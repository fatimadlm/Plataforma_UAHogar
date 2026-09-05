package com.fatima.UAHogar.controladores;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/imagenes")
public class ImagenControlador {

    // Tipos de imagen permitidos
    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    // Extension fija por tipo,asi evitamos un .. o una / y escribir fuera de la carpeta de subidas
    private static final Map<String, String> EXTENSION_POR_TIPO = Map.of(
            "image/jpeg", ".jpg",
            "image/png",  ".png",
            "image/webp", ".webp",
            "image/gif",  ".gif"
    );

    // Tamaño máximo: 5 MB
    private static final long TAMAÑO_MAX_BYTES = 5 * 1024 * 1024;

    // Carpetas separadas por tipo
    private static final String CARPETA_TAREAS  = "uploads/tareas/";
    private static final String CARPETA_PERFIL  = "uploads/perfiles/";

    //Sube una imagen asociada a una tarea completada.
    @PostMapping("/subir/tarea")
    public ResponseEntity<String> subirImagenTarea(@RequestParam("archivo") MultipartFile archivo) {
        return guardar(archivo, CARPETA_TAREAS, "/tareas/");
    }

     //Sube una imagen de perfil de usuario.
    @PostMapping("/subir/perfil")
    public ResponseEntity<String> subirImagenPerfil(@RequestParam("archivo") MultipartFile archivo) {
        return guardar(archivo, CARPETA_PERFIL, "/perfiles/");
    }

     // Redirige a /subir/tarea para no romper el frontend actual
    @PostMapping("/subir")
    public ResponseEntity<String> subirImagenLegacy(@RequestParam("archivo") MultipartFile archivo) {
        return guardar(archivo, CARPETA_TAREAS, "/tareas/");
    }

    // Guardar
    private ResponseEntity<String> guardar(MultipartFile archivo, String carpeta, String urlBase) {
        // Validación de tipo
        String tipo = archivo.getContentType();
        if (tipo == null || !TIPOS_PERMITIDOS.contains(tipo)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF.");
        }

        // Validación de tamaño
        if (archivo.getSize() > TAMAÑO_MAX_BYTES) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("La imagen no puede superar los 5 MB.");
        }

        try {
            // Ruta absoluta para evitar problemas según directorio de trabajo
            String dirTrabajo = System.getProperty("user.dir");
            Path rutaCarpeta = Paths.get(dirTrabajo, carpeta);
            Files.createDirectories(rutaCarpeta);

            // Nombre unico con una extension fija segun el tipo
            String extension = EXTENSION_POR_TIPO.getOrDefault(tipo, ".jpg");
            String nombre = UUID.randomUUID() + extension;
            Path destino = rutaCarpeta.resolve(nombre).normalize();

            // destino final dentro de la carpeta de subidas
            if (!destino.startsWith(rutaCarpeta.normalize())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nombre de archivo no válido.");
            }

            Files.write(destino, archivo.getBytes());

            // Devuelve la URL pública relativa al servidor Spring
            return ResponseEntity.ok(urlBase + nombre);

        } catch (IOException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar la imagen.");
        }
    }
}