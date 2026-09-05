package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.dto.AuditoriaSupervisionDTO;
import com.fatima.UAHogar.dto.HogarDetalleAmpliadoDTO;
import com.fatima.UAHogar.dto.HogarDetalleSupervisionDTO;
import com.fatima.UAHogar.dto.HogarSupervisionDTO;
import com.fatima.UAHogar.dto.IncidenciaSupervisionDTO;
import com.fatima.UAHogar.dto.MetricasSupervisionDTO;
import com.fatima.UAHogar.dto.TareaSupervisionDTO;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import com.fatima.UAHogar.servicio.SupervisorServicio;
import com.fatima.UAHogar.servicio.UsuarioServicio;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supervisor")
public class SupervisorControlador {

    private final SupervisorServicio supervisorServicio;
    private final UsuarioServicio usuarioServicio;

    public SupervisorControlador(SupervisorServicio supervisorServicio, UsuarioServicio usuarioServicio) {
        this.supervisorServicio = supervisorServicio;
        this.usuarioServicio = usuarioServicio;
    }

    // Metricas
    @GetMapping("/metricas")
    public ResponseEntity<?> obtenerMetricas() {
        MetricasSupervisionDTO metricas = supervisorServicio.obtenerMetricas();
        return ResponseEntity.ok(metricas);
    }

    // Listar usuarios con filtros opcionales
    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios(@RequestParam(required = false) String busqueda,
                                            @RequestParam(required = false) String estado) {
        List<Usuario> usuarios = usuarioServicio.buscarParaSupervision(busqueda, estado);
        return ResponseEntity.ok(usuarios);
    }

    // Bloquear o desbloquear usuario
    @PutMapping("/usuarios/{id}/bloquear")
    public ResponseEntity<?> alternarBloqueoUsuario(@PathVariable Long id) {
        if (id.equals(UsuarioActual.id())) {
            throw new IllegalArgumentException("No puedes bloquear tu propia cuenta.");
        }

        try {
            Usuario usuario = usuarioServicio.alternarBloqueo(id);
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    public record CambiarRolRequest(String rolGlobal) {}

    // Cambiar rol de usuario
    @PutMapping("/usuarios/{id}/rol")
    public ResponseEntity<?> cambiarRolUsuario(@PathVariable Long id, @RequestBody CambiarRolRequest request) {
        Usuario usuario = usuarioServicio.cambiarRolGlobal(id, request.rolGlobal());
        return ResponseEntity.ok(usuario);
    }

    // Eliminar o anonimizar usuario si tiene datos asociados
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        if (id.equals(UsuarioActual.id())) {
            throw new IllegalArgumentException("No puedes eliminar tu propia cuenta.");
        }

        try {
            usuarioServicio.salirDeHogaresYPlantillas(id);
            usuarioServicio.intentarBorrarFila(id);
            return ResponseEntity.ok("Usuario eliminado correctamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (DataAccessException e) {
            // Si tiene datos asociados, se anonimiza en lugar de borrar
            usuarioServicio.anonimizarComoAlternativaAlBorrado(id);
            return ResponseEntity.ok("Se ha bloqueado y anonimizado su cuenta.");
        }
    }

    // Listar hogares con filtro de búsqueda
    @GetMapping("/hogares")
    public ResponseEntity<?> listarHogares(@RequestParam(required = false) String busqueda) {
        List<HogarSupervisionDTO> hogares = supervisorServicio.buscarHogares(busqueda);
        return ResponseEntity.ok(hogares);
    }

    // Vista del detalle del hogar
    @GetMapping("/hogares/{id}")
    public ResponseEntity<?> obtenerDetalleHogar(@PathVariable Long id) {
        try {
            HogarDetalleSupervisionDTO detalle = supervisorServicio.obtenerDetalleHogar(id);
            return ResponseEntity.ok(detalle);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/hogares/{id}/detalle")
    public ResponseEntity<?> obtenerDetalleAmpliadoHogar(@PathVariable Long id) {
        try {
            HogarDetalleAmpliadoDTO detalle = supervisorServicio.obtenerDetalleAmpliadoHogar(id);
            return ResponseEntity.ok(detalle);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Eliminar hogar
    @DeleteMapping("/hogares/{id}")
    public ResponseEntity<?> eliminarHogar(@PathVariable Long id) {
        try {
            supervisorServicio.eliminarHogar(id);
            return ResponseEntity.ok("Hogar eliminado correctamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Borra de golpe todos los hogares fantasma
    @DeleteMapping("/hogares/fantasma")
    public ResponseEntity<?> limpiarHogaresFantasma() {
        int borrados = supervisorServicio.limpiarHogaresFantasma();
        String mensaje = borrados == 0
                ? "No había ningún hogar fantasma que limpiar."
                : "Se han eliminado " + borrados + " hogar(es) fantasma.";
        return ResponseEntity.ok(mensaje);
    }

    // Listar tareas con filtros y ordenación
    @GetMapping("/tareas")
    public ResponseEntity<?> listarTareas(@RequestParam(required = false) String busqueda,
                                          @RequestParam(required = false) String estado,
                                          @RequestParam(required = false) String tipo,
                                          @RequestParam(required = false) Long usuarioId,
                                          @RequestParam(required = false) String orden) {
        List<TareaSupervisionDTO> tareas = supervisorServicio.buscarTareas(busqueda, estado, tipo, usuarioId, orden);
        return ResponseEntity.ok(tareas);
    }

    // Eliminar tarea
    @DeleteMapping("/tareas/{id}")
    public ResponseEntity<?> eliminarTarea(@PathVariable Long id) {
        try {
            supervisorServicio.eliminarTarea(id);
            return ResponseEntity.ok("Tarea eliminada correctamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Listar incidencias
    @GetMapping("/incidencias")
    public ResponseEntity<?> listarIncidencias(@RequestParam(required = false) String busqueda,
                                               @RequestParam(required = false) String estado) {
        List<IncidenciaSupervisionDTO> incidencias = supervisorServicio.buscarIncidencias(busqueda, estado);
        return ResponseEntity.ok(incidencias);
    }

    // Cierra una incidencia como supervisor
    @PutMapping("/incidencias/{id}/cerrar")
    public ResponseEntity<?> cerrarIncidencia(@PathVariable Long id) {
        supervisorServicio.cerrarIncidenciaComoSupervisor(id, UsuarioActual.id());
        return ResponseEntity.ok("Incidencia cerrada correctamente.");
    }

    // Ultimas acciones de los supervisores
    @GetMapping("/auditoria")
    public ResponseEntity<?> listarAuditoria(@RequestParam(required = false) String busqueda,
                                             @RequestParam(required = false) String accion) {
        List<AuditoriaSupervisionDTO> auditoria = supervisorServicio.obtenerAuditoria(busqueda, accion);
        return ResponseEntity.ok(auditoria);
    }
}
