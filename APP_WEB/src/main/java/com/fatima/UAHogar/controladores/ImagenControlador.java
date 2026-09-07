package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import com.fatima.UAHogar.servicio.AlmacenamientoImagenServicio;
import com.fatima.UAHogar.servicio.UsuarioServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/imagenes")
public class ImagenControlador {

    private final AlmacenamientoImagenServicio almacenamientoImagenServicio;
    private final UsuarioServicio usuarioServicio;

    public ImagenControlador(
            AlmacenamientoImagenServicio almacenamientoImagenServicio,
            UsuarioServicio usuarioServicio) {
        this.almacenamientoImagenServicio = almacenamientoImagenServicio;
        this.usuarioServicio = usuarioServicio;
    }

    //Sube una imagen asociada a una tarea completada.
    @PostMapping("/subir/tarea")
    public ResponseEntity<String> subirImagenTarea(
            @RequestParam("archivo") MultipartFile archivo) {
        return subir(archivo, "tareas");
    }

    //Sube una imagen de perfil de usuario.
    @PostMapping("/subir/perfil")
    public ResponseEntity<String> subirImagenPerfil(
            @RequestParam("archivo") MultipartFile archivo) {
        return subir(archivo, "perfiles");
    }

    // Elimina la foto de perfil del usuario actual
    @DeleteMapping("/perfil")
    public ResponseEntity<String> eliminarImagenPerfil() {
        try {
            Long usuarioId = UsuarioActual.id();
            Usuario usuario = usuarioServicio.buscarPorId(usuarioId);

            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Usuario no encontrado.");
            }

            String rutaAnterior = usuario.getImagenPerfil();
            usuario.setImagenPerfil(null);
            usuarioServicio.guardarUsuario(usuario);

            if (rutaAnterior != null && !rutaAnterior.isBlank()) {
                try {
                    almacenamientoImagenServicio.eliminar(rutaAnterior);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            return ResponseEntity.ok("Foto de perfil eliminada correctamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se pudo eliminar la foto de perfil.");
        }
    }

    @PostMapping("/subir")
    public ResponseEntity<String> subirImagenLegacy(
            @RequestParam("archivo") MultipartFile archivo) {
        return subir(archivo, "tareas");
    }

    // Genera una URL SAS de lectura
    @GetMapping("/url")
    public ResponseEntity<Map<String, String>> obtenerUrl(
            @RequestParam("ruta") String ruta) {

        try {
            String url = almacenamientoImagenServicio.generarUrlSas(ruta);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo obtener la URL de la imagen."));
        }
    }

    // Llama a almacenamientoImagenServicio para subir la imagen
    private ResponseEntity<String> subir(MultipartFile archivo, String carpeta) {
        try {
            String ruta = almacenamientoImagenServicio.subir(archivo, carpeta);
            return ResponseEntity.ok(ruta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se pudo guardar la imagen.");
        }
    }
}
