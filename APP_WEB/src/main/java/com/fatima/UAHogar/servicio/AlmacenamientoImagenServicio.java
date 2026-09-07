package com.fatima.UAHogar.servicio;

import com.azure.identity.DefaultAzureCredential;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.UserDelegationKey;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class AlmacenamientoImagenServicio {

    // Tamaño maximo de 5 MB
    private static final long MAX_BYTES = 5 * 1024 * 1024;

    // Formatos de imagen
    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    // Extension segun el tipo de imagen
    private static final Map<String, String> EXTENSION_POR_TIPO = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    // Carpetas permitidas
    private static final Set<String> CARPETAS_PERMITIDAS = Set.of(
            "tareas",
            "perfiles"
    );

    // Tiempo de validez del enlace
    private static final long DURACION_SAS_MINUTOS = 25;

    private final BlobServiceClient blobServiceClient;
    private final String nombreContenedor;

    private volatile UserDelegationKey claveDelegacion;
    private volatile OffsetDateTime caducidadClave;

    // Conecta con Azure
    public AlmacenamientoImagenServicio(
            @Value("${azure.storage.account-name}") String nombreCuenta,
            @Value("${azure.storage.container-name:uploads}") String nombreContenedor) {

        if (nombreCuenta == null || nombreCuenta.isBlank()) {
            throw new IllegalStateException(
                    "Falta la configuración azure.storage.account-name."
            );
        }

        if (nombreContenedor == null || nombreContenedor.isBlank()) {
            throw new IllegalStateException(
                    "Falta la configuración azure.storage.container-name."
            );
        }

        this.nombreContenedor = nombreContenedor;

        DefaultAzureCredential credencial =
                new DefaultAzureCredentialBuilder().build();

        this.blobServiceClient = new BlobServiceClientBuilder()
                .endpoint("https://" + nombreCuenta + ".blob.core.windows.net")
                .credential(credencial)
                .buildClient();
    }

    // Sube una foto con nombre unico y devuelve la ruta
    public String subir(MultipartFile archivo, String carpeta) {
        validarCarpeta(carpeta);
        validarArchivo(archivo);

        String tipo = archivo.getContentType();
        String extension = EXTENSION_POR_TIPO.get(tipo);

        String nombre = UUID.randomUUID() + extension;
        String rutaBlob = carpeta + "/" + nombre;

        BlobContainerClient contenedor =
                blobServiceClient.getBlobContainerClient(nombreContenedor);

        BlobClient blob = contenedor.getBlobClient(rutaBlob);

        try {
            BlobHttpHeaders headers = new BlobHttpHeaders()
                    .setContentType(tipo);

            blob.upload(archivo.getInputStream(), archivo.getSize(), true);
            blob.setHttpHeaders(headers);

            return "/" + rutaBlob;

        } catch (IOException e) {
            throw new IllegalArgumentException(
                    "No se pudo leer la imagen subida.",
                    e
            );

        } catch (RuntimeException e) {
            e.printStackTrace();

            throw new IllegalArgumentException(
                    "No se pudo guardar la imagen en Azure Blob Storage.",
                    e
            );
        }
    }

    // Borra la foto si existe
    public void eliminar(String rutaImagen) {
        if (rutaImagen == null || rutaImagen.isBlank()) {
            return;
        }

        String ruta = rutaImagen.trim();

        if (ruta.startsWith("http://") || ruta.startsWith("https://") || ruta.startsWith("blob:")) {
            return;
        }

        String rutaBlob = normalizarRutaBlob(ruta);

        BlobClient blob = blobServiceClient
                .getBlobContainerClient(nombreContenedor)
                .getBlobClient(rutaBlob);

        try {
            blob.deleteIfExists();
        } catch (RuntimeException e) {
            e.printStackTrace();
            throw new IllegalArgumentException(
                    "No se pudo eliminar la imagen de Azure Blob Storage.",
                    e
            );
        }
    }

    // Crea un enlace con permiso de lectura
    public String generarUrlSas(String rutaImagen) {
        String rutaBlob = normalizarRutaBlob(rutaImagen);

        BlobClient blob = blobServiceClient
                .getBlobContainerClient(nombreContenedor)
                .getBlobClient(rutaBlob);

        OffsetDateTime ahora = OffsetDateTime.now();
        OffsetDateTime inicioSas = ahora.minusMinutes(5);
        OffsetDateTime finSas =
                ahora.plusMinutes(DURACION_SAS_MINUTOS);

        UserDelegationKey clave =
                obtenerClaveDelegacion(finSas.plusMinutes(5));

        BlobSasPermission permisos = new BlobSasPermission()
                .setReadPermission(true);

        BlobServiceSasSignatureValues valores =
                new BlobServiceSasSignatureValues(
                        finSas,
                        permisos
                ).setStartTime(inicioSas);

        String token =
                blob.generateUserDelegationSas(valores, clave);

        return blob.getBlobUrl() + "?" + token;
    }

    // Guarda la clave en memoria
    private synchronized UserDelegationKey obtenerClaveDelegacion(
            OffsetDateTime minimoValidoHasta) {

        if (claveDelegacion != null
                && caducidadClave != null
                && caducidadClave.isAfter(minimoValidoHasta)) {

            return claveDelegacion;
        }

        OffsetDateTime inicio =
                OffsetDateTime.now().minusMinutes(5);

        OffsetDateTime fin =
                OffsetDateTime.now().plusHours(2);

        claveDelegacion =
                blobServiceClient.getUserDelegationKey(
                        inicio,
                        fin
                );

        caducidadClave = fin;

        return claveDelegacion;
    }

    // Limpia la ruta y comprueba que sea de tareas o perfiles
    private String normalizarRutaBlob(String rutaImagen) {
        if (rutaImagen == null || rutaImagen.isBlank()) {
            throw new IllegalArgumentException(
                    "La ruta de la imagen es obligatoria."
            );
        }

        String ruta =
                rutaImagen.trim().replace("\\", "/");

        while (ruta.startsWith("/")) {
            ruta = ruta.substring(1);
        }

        if (ruta.contains("..")
                || ruta.contains("?")
                || ruta.contains("#")) {

            throw new IllegalArgumentException(
                    "Ruta de imagen no válida."
            );
        }

        String[] partes = ruta.split("/", 2);

        if (partes.length != 2
                || !CARPETAS_PERMITIDAS.contains(partes[0])
                || partes[1].isBlank()) {

            throw new IllegalArgumentException(
                    "La ruta de imagen debe pertenecer a tareas o perfiles."
            );
        }

        return ruta;
    }

    // Revisa que la carpeta sea valida
    private void validarCarpeta(String carpeta) {
        if (!CARPETAS_PERMITIDAS.contains(carpeta)) {
            throw new IllegalArgumentException(
                    "Carpeta de imagen no válida."
            );
        }
    }

    // Comprueba el formato y tamaño
    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debes seleccionar una imagen."
            );
        }

        String tipo = archivo.getContentType();

        if (tipo == null || !TIPOS_PERMITIDOS.contains(tipo)) {
            throw new IllegalArgumentException(
                    "Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF."
            );
        }

        if (archivo.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException(
                    "La imagen no puede superar los 5 MB."
            );
        }
    }
}