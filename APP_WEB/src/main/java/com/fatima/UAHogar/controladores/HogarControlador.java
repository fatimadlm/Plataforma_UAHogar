package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.modelo.Hogar;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import com.fatima.UAHogar.servicio.HogarEstadisticasServicio;
import com.fatima.UAHogar.servicio.HogarServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hogares")
public class HogarControlador {

    private final HogarServicio hogarServicio;
    private final HogarEstadisticasServicio estadisticasServicio;

    public HogarControlador(HogarServicio hogarServicio,
                            HogarEstadisticasServicio estadisticasServicio) {
        this.hogarServicio = hogarServicio;
        this.estadisticasServicio = estadisticasServicio;
    }

    public record CrearHogarRequest(String nombreHogar, String aparienciaId) {}
    public record UnirseHogarRequest(String codigoInvitacion) {}

    // Crea una nueva casa y nombra al creador como ADMIN
    @PostMapping("/crear")
    public ResponseEntity<?> crearHogar(@RequestBody CrearHogarRequest request) {
        Hogar nuevoHogar = hogarServicio.crearHogar(
                request.nombreHogar(), UsuarioActual.id(), request.aparienciaId());
        return new ResponseEntity<>(nuevoHogar, HttpStatus.CREATED);
    }

    // Permite a un usuario entrar en una casa usando un codigo
    @PostMapping("/unirse")
    public ResponseEntity<?> unirseAHogar(@RequestBody UnirseHogarRequest request) {
        hogarServicio.unirseAHogar(request.codigoInvitacion(), UsuarioActual.id());
        return new ResponseEntity<>("Te has unido al hogar", HttpStatus.OK);
    }

    // Devuelve todos los hogares a los que pertenece un usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerHogaresPorUsuario(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes consultar los hogares de otro usuario.");
        }

        List<com.fatima.UAHogar.modelo.MiembroHogar> membresias =
                hogarServicio.obtenerHogaresPorUsuario(usuarioId);

        List<Map<String, Object>> resultado = membresias.stream().map(m -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", m.getHogar().getId());
            item.put("nombre", m.getHogar().getNombre());
            item.put("codigoInvitacion", m.getHogar().getCodigoInvitacion());
            item.put("rol", m.getRol());
            item.put("puntos", hogarServicio.calcularPuntosMiembro(usuarioId, m.getHogar().getId()));
            item.put("miembros", hogarServicio.contarMiembros(m.getHogar().getId()));
            item.put("aparienciaId", m.getHogar().getAparienciaId());
            return item;
        }).collect(java.util.stream.Collectors.toList());

        return new ResponseEntity<>(resultado, HttpStatus.OK);
    }

    // Permite a un usuario salirse de la casa
    @DeleteMapping("/{hogarId}/abandonar")
    public ResponseEntity<?> abandonarHogar(@PathVariable Long hogarId) {
        hogarServicio.abandonarHogar(UsuarioActual.id(), hogarId);
        return new ResponseEntity<>("Has abandonado el hogar correctamente.", HttpStatus.OK);
    }

    // Permite a un ADMIN del hogar expulsar a otro miembro
    @DeleteMapping("/{hogarId}/expulsar")
    public ResponseEntity<?> expulsarMiembro(@PathVariable Long hogarId,
                                             @RequestParam Long usuarioId) {
        hogarServicio.expulsarMiembro(UsuarioActual.id(), hogarId, usuarioId);
        return new ResponseEntity<>("El miembro ha sido expulsado y sus tareas se han redistribuido.", HttpStatus.OK);
    }

    // Devuelve miembros y actividad reciente para el panel del hogar
    @GetMapping("/{hogarId}/panel")
    public ResponseEntity<?> obtenerDatosPanel(@PathVariable Long hogarId) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);

        List<com.fatima.UAHogar.dto.MiembroPuntosDTO> membresias =
                hogarServicio.getMiembrosOrdenadosPorPuntos(hogarId);

        List<Map<String, Object>> miembros = membresias.stream().map(m -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", m.usuarioId());
            item.put("nombre", m.nombre());
            item.put("usuario", m.usuario());
            item.put("imagenPerfil", m.imagenPerfil());
            item.put("rol", m.rol());
            item.put("puntos", m.puntos());
            return item;
        }).collect(java.util.stream.Collectors.toList());

        List<com.fatima.UAHogar.modelo.RegistroTarea> registros =
                hogarServicio.getUltimosRegistros(hogarId, 10);

        List<Map<String, Object>> actividad = registros.stream().map(r -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", r.getId());
            item.put("nombreUsuario", r.getUsuario() != null
                    ? r.getUsuario().getNombre()
                    : "Usuario eliminado");
            item.put("nombreTarea", r.getTarea().getNombre());
            item.put("puntosSumados", r.getPuntosSumados());
            item.put("fechaCompletada", r.getFechaCompletada());
            return item;
        }).collect(java.util.stream.Collectors.toList());

        Map<String, Object> respuesta = new java.util.HashMap<>();
        respuesta.put("miembros", miembros);
        respuesta.put("actividad", actividad);

        return ResponseEntity.ok(respuesta);
    }

    // Devuelve las estadisticas completas del hogar con ranking mensual y datos graciosos
    @GetMapping("/{hogarId}/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas(@PathVariable Long hogarId) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);
        return ResponseEntity.ok(estadisticasServicio.calcular(hogarId));
    }
}
