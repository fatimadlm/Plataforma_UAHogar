package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.dto.RegistroTareaDTO;
import com.fatima.UAHogar.servicio.ConsejoTareaServicio;
import com.fatima.UAHogar.servicio.EstimacionTareaServicio;
import com.fatima.UAHogar.servicio.HogarServicio;
import com.fatima.UAHogar.servicio.RegistroTareaServicio;
import com.fatima.UAHogar.servicio.TareaServicio;
import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.modelo.Tarea;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tareas")
public class TareaControlador {

    private final TareaServicio tareaServicio;
    private final RegistroTareaServicio registroTareaServicio;
    private final EstimacionTareaServicio estimacionTareaServicio;
    private final ConsejoTareaServicio consejoTareaServicio;
    private final HogarServicio hogarServicio;

    public TareaControlador(
            TareaServicio tareaServicio,
            RegistroTareaServicio registroTareaServicio,
            EstimacionTareaServicio estimacionTareaServicio,
            ConsejoTareaServicio consejoTareaServicio,
            HogarServicio hogarServicio) {

        this.tareaServicio = tareaServicio;
        this.registroTareaServicio = registroTareaServicio;
        this.estimacionTareaServicio = estimacionTareaServicio;
        this.consejoTareaServicio = consejoTareaServicio;
        this.hogarServicio = hogarServicio;
    }

    public record CompletarTareaRequest(Long tareaId, String imagenUrl) {}
    public record EstimarTareaRequest(String nombre, String descripcion, String tipo) {}
    public record EstimarTareaResponse(Integer estimatedMinutes, Double confidence, Integer points) {}
    public record ConsultarTareaRequest(Long tareaId, boolean regenerar) {}
    public record ConsultarTareaResponse(String consejo, List<String> pasos,
                                         List<String> productosRecomendados, List<String> precauciones) {}
    public record CrearTareaRequest(String nombre, String descripcion, String tipo, String frecuencia,
                                    Integer puntos, String tiempoEstimado, String fechaInicio,
                                    Long usuarioAsignadoId) {}

    // Estima el tiempo de una tarea y calcula sus puntos
    @PostMapping("/estimar-tiempo")
    public ResponseEntity<?> estimarTiempo(@RequestBody EstimarTareaRequest request) {
        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }

        EstimacionTareaServicio.Estimacion estimacion =
                estimacionTareaServicio.estimarTiempo(
                        request.nombre(), request.descripcion(), request.tipo());

        int puntos = tareaServicio.calcularPuntos(estimacion.estimatedMinutes());

        return ResponseEntity.ok(new EstimarTareaResponse(
                estimacion.estimatedMinutes(), estimacion.confidence(), puntos));
    }

    // Genera una ayuda practica para realizar una tarea
    @PostMapping("/consultar")
    public ResponseEntity<?> consultarTarea(@RequestBody ConsultarTareaRequest request) {
        if (request.tareaId() == null) {
            throw new IllegalArgumentException("El ID de la tarea es obligatorio");
        }

        Long hogarId = tareaServicio.obtenerHogarIdDeTarea(request.tareaId());
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);

        ConsejoTareaServicio.Consejo consejo = consejoTareaServicio.consultarTarea(
                request.tareaId(), request.regenerar());

        return ResponseEntity.ok(new ConsultarTareaResponse(
                consejo.consejo(), consejo.pasos(),
                consejo.productosRecomendados(), consejo.precauciones()));
    }

    // Devuelve las plantillas de un hogar
    @GetMapping("/hogar/{hogarId}")
    public ResponseEntity<?> obtenerTareasDelHogar(@PathVariable Long hogarId) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);
        return ResponseEntity.ok(tareaServicio.obtenerTareasDelHogar(hogarId));
    }

    // Devuelve las instancias activas de un hogar en los proximos 15 dias
    @GetMapping("/hogar/{hogarId}/instancias-activas")
    public ResponseEntity<?> obtenerInstanciasActivas(@PathVariable Long hogarId) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);
        return ResponseEntity.ok(tareaServicio.obtenerInstanciasActivasDelHogar(hogarId));
    }

    // Devuelve las instancias pendientes del usuario autenticado para su feed
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerTareasDeUsuario(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes ver las tareas de otro usuario.");
        }
        return ResponseEntity.ok(tareaServicio.obtenerTareasPorUsuario(usuarioId));
    }

    // Crea una nueva plantilla. Exige pertenecer al hogar donde se crea
    @PostMapping("/crear")
    public ResponseEntity<?> crearTarea(@RequestBody CrearTareaRequest request,
                                        @RequestParam Long hogarId) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);

        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la tarea es obligatorio");
        }

        Tarea nueva = new Tarea();
        nueva.setNombre(request.nombre());
        nueva.setDescripcion(request.descripcion());
        nueva.setTipo(request.tipo());
        nueva.setFrecuencia(request.frecuencia());
        nueva.setTiempoEstimado(request.tiempoEstimado());

        Tarea guardada = tareaServicio.crearTarea(
                nueva, hogarId, request.fechaInicio(), request.usuarioAsignadoId());

        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    // Elimina una plantilla
    @DeleteMapping("/{tareaId}/eliminar")
    public ResponseEntity<?> eliminarPlantilla(@PathVariable Long tareaId,
                                                @RequestParam String opcion) {
        Long hogarId = tareaServicio.obtenerHogarIdDeTarea(tareaId);
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);

        if ("AHORA".equals(opcion)) {
            tareaServicio.eliminarPlantillaAhora(tareaId);
        } else if ("AL_COMPLETARSE".equals(opcion)) {
            tareaServicio.eliminarPlantillaAlCompletarse(tareaId);
        } else {
            throw new IllegalArgumentException(
                    "Opcion no valida. Usa AHORA o AL_COMPLETARSE");
        }

        return ResponseEntity.ok().build();
    }

    // Completa una tarea y genera la siguiente instancia
    @PostMapping("/completar")
    public ResponseEntity<?> completarTarea(@RequestBody CompletarTareaRequest request) {
        RegistroTarea registro = registroTareaServicio.completarTarea(
                request.tareaId(), UsuarioActual.id(), request.imagenUrl());

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Tarea completada con éxito");
        respuesta.put("registroId", registro.getId());
        respuesta.put("puntosNetos", registro.puntosNetos());
        respuesta.put("penalizacion", registro.getPenalizacion());
        respuesta.put("imagenUrl", registro.getImagenUrl());

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    // Devuelve los puntos de un usuario en un hogar
    @GetMapping("/puntos/usuario/{usuarioId}/hogar/{hogarId}")
    public ResponseEntity<?> obtenerPuntos(@PathVariable Long usuarioId,
                                           @PathVariable Long hogarId,
                                           @RequestParam(required = false) Integer mes,
                                           @RequestParam(required = false) Integer anio) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);

        Integer puntos = (mes != null && anio != null)
                ? registroTareaServicio.obtenerPuntosPorMesYAnio(usuarioId, hogarId, mes, anio)
                : registroTareaServicio.obtenerPuntosMesActual(usuarioId, hogarId);

        return ResponseEntity.ok(puntos);
    }

    // Devuelve puntos del mes y tareas completadas para el perfil propio
    @GetMapping("/estadisticas/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerEstadisticasPerfil(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes ver las estadísticas de otro usuario.");
        }

        Map<String, Integer> stats = new HashMap<>();
        stats.put("puntosMes", registroTareaServicio.obtenerPuntosTotalesMesActual(usuarioId));
        stats.put("tareasCompletadas", registroTareaServicio.obtenerTotalTareasCompletadas(usuarioId));

        return ResponseEntity.ok(stats);
    }

    // Devuelve tareas completadas en hogares compartidos entre dos usuarios
    @GetMapping("/recientes-comunes")
    public ResponseEntity<?> obtenerTareasRecientesComunes(@RequestParam Long usuarioId,
                                                            @RequestParam Long miId) {
        Long yo = UsuarioActual.id();
        if (!usuarioId.equals(yo) && !miId.equals(yo)) {
            throw new SecurityException(
                    "No puedes consultar el historial de otros dos usuarios.");
        }

        List<RegistroTareaDTO> dtos = registroTareaServicio
                .obtenerTareasRecientesEntreUsuarios(usuarioId, miId)
                .stream()
                .map(RegistroTareaDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // Devuelve el historial paginado de tareas completadas
    @GetMapping("/historial/hogar/{hogarId}")
    public ResponseEntity<?> obtenerHistorialHogar(@PathVariable Long hogarId,
                                                   @RequestParam(defaultValue = "0") int pagina,
                                                   @RequestParam(defaultValue = "40") int limite) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);

        List<RegistroTareaDTO> dtos = registroTareaServicio
                .obtenerHistorialHogar(hogarId, pagina, limite)
                .stream()
                .map(RegistroTareaDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
