package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.dto.IncidenciaDTO;
import com.fatima.UAHogar.modelo.Incidencia;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import com.fatima.UAHogar.servicio.HogarServicio;
import com.fatima.UAHogar.servicio.IncidenciaServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/incidencias")
public class IncidenciaControlador {

    private final IncidenciaServicio incidenciaServicio;
    private final HogarServicio hogarServicio;

    public IncidenciaControlador(IncidenciaServicio incidenciaServicio, HogarServicio hogarServicio) {
        this.incidenciaServicio = incidenciaServicio;
        this.hogarServicio = hogarServicio;
    }

    public record ReportarIncidenciaRequest(Long registroTareaId, String descripcion) {}

    // Reporta una incidencia 
    @PostMapping("/reportar")
    public ResponseEntity<?> reportarIncidencia(@RequestBody ReportarIncidenciaRequest request) {
        Incidencia nueva = incidenciaServicio.reportarIncidencia(
                request.registroTareaId(), UsuarioActual.id(), request.descripcion());
        return ResponseEntity.status(HttpStatus.CREATED).body(new IncidenciaDTO(nueva));
    }

    // Detalle de una incidencia
    @GetMapping("/{incidenciaId}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long incidenciaId) {
        Incidencia incidencia = incidenciaServicio.obtenerPorId(incidenciaId);
        hogarServicio.verificarPertenencia(
                UsuarioActual.id(), incidencia.getRegistroTarea().getHogar().getId());
        return ResponseEntity.ok(new IncidenciaDTO(incidencia));
    }

    // Incidencias de un hogar  para el admin
    @GetMapping("/hogar/{hogarId}")
    public ResponseEntity<?> obtenerIncidenciasDelHogar(@PathVariable Long hogarId) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);
        List<IncidenciaDTO> dtos = incidenciaServicio.obtenerIncidenciasDelHogar(hogarId)
                .stream().map(IncidenciaDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Incidencias reportadas por un usuario
    @GetMapping("/reportante/{usuarioId}")
    public ResponseEntity<?> obtenerIncidenciasReportadas(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes ver las incidencias de otro usuario.");
        }

        List<IncidenciaDTO> dtos = incidenciaServicio.obtenerIncidenciasReportadasPor(usuarioId)
                .stream().map(IncidenciaDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Incidencias sobre tareas que hizo un usuario
    @GetMapping("/responsable/{usuarioId}")
    public ResponseEntity<?> obtenerIncidenciasComoResponsable(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes ver las incidencias de otro usuario.");
        }

        List<IncidenciaDTO> dtos = incidenciaServicio.obtenerIncidenciasComoResponsable(usuarioId)
                .stream().map(IncidenciaDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Solo un ADMIN puede cerrar
    @PutMapping("/{incidenciaId}/cerrar")
    public ResponseEntity<?> cerrarIncidencia(@PathVariable Long incidenciaId) {
        Incidencia cerrada = incidenciaServicio.cerrarIncidencia(
                incidenciaId, UsuarioActual.id());
        return ResponseEntity.ok(new IncidenciaDTO(cerrada));
    }
}
