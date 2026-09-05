package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.modelo.Notificacion;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import com.fatima.UAHogar.servicio.NotificacionServicio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionControlador {

    private final NotificacionServicio notificacionServicio;

    public NotificacionControlador(NotificacionServicio notificacionServicio) {
        this.notificacionServicio = notificacionServicio;
    }

    /**
     * GET /api/notificaciones/usuario/{usuarioId}
     * Devuelve todas las notificaciones del usuario autenticado como DTOs
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerTodas(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes ver las notificaciones de otro usuario.");
        }

        List<Notificacion> lista = notificacionServicio.obtenerTodas(usuarioId);
        return ResponseEntity.ok(lista.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * GET /api/notificaciones/usuario/{usuarioId}/no-leidas/count
     * Devuelve el número de notificaciones no leídas (Contador del sidebar)
     */
    @GetMapping("/usuario/{usuarioId}/no-leidas/count")
    public ResponseEntity<?> contarNoLeidas(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes ver las notificaciones de otro usuario.");
        }

        int count = notificacionServicio.obtenerNoLeidas(usuarioId).size();
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * PUT /api/notificaciones/{id}/leer
     * Marca una notificación como leída. Solo si es del usuario autenticado
     */
    @PutMapping("/{id}/leer")
    public ResponseEntity<?> marcarLeida(@PathVariable Long id) {
        notificacionServicio.marcarComoLeida(id, UsuarioActual.id());
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /api/notificaciones/usuario/{usuarioId}/leer-todas
     * Marca todas las notificaciones del usuario autenticado como leídas
     */
    @PutMapping("/usuario/{usuarioId}/leer-todas")
    public ResponseEntity<?> marcarTodasLeidas(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes modificar las notificaciones de otro usuario.");
        }

        notificacionServicio.marcarTodasComoLeidas(usuarioId);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/notificaciones/{id}
     * Borra una notificación concreta. Solo si es del usuario autenticado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> borrar(@PathVariable Long id) {
        notificacionServicio.borrar(id, UsuarioActual.id());
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/notificaciones/usuario/{usuarioId}
     * Borra todas las notificaciones del usuario autenticado
     */
    @DeleteMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> borrarTodas(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes borrar las notificaciones de otro usuario.");
        }

        notificacionServicio.borrarTodas(usuarioId);
        return ResponseEntity.ok().build();
    }

    // Convierte Notificacion a un mapa
    private Map<String, Object> toDTO(Notificacion n) {
        return Map.of(
                "id", n.getId(),
                "titulo", n.getTitulo(),
                "mensaje", n.getMensaje(),
                "tipo", n.getTipo() != null ? n.getTipo().name() : "",
                "leida", n.getLeida(),
                "fechaCreacion", n.getFechaCreacion().toString(),
                "urlOrigen", n.getUrlOrigen() != null ? n.getUrlOrigen() : ""
        );
    }
}
