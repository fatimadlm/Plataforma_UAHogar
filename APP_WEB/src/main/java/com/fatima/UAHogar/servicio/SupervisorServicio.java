package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.DAO.HogarDAO;
import com.fatima.UAHogar.DAO.IncidenciaDAO;
import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.DAO.TareaDAO;
import com.fatima.UAHogar.DAO.UsuarioDAO;
import com.fatima.UAHogar.dto.AuditoriaSupervisionDTO;
import com.fatima.UAHogar.dto.HogarDetalleAmpliadoDTO;
import com.fatima.UAHogar.dto.HogarDetalleSupervisionDTO;
import com.fatima.UAHogar.dto.HogarSupervisionDTO;
import com.fatima.UAHogar.dto.IncidenciaSupervisionDTO;
import com.fatima.UAHogar.dto.MetricasSupervisionDTO;
import com.fatima.UAHogar.dto.MiembroSupervisionDTO;
import com.fatima.UAHogar.dto.PlantillaTareaSupervisionDTO;
import com.fatima.UAHogar.dto.TareaSupervisionDTO;
import com.fatima.UAHogar.modelo.Hogar;
import com.fatima.UAHogar.modelo.Incidencia;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.modelo.Tarea;
import com.fatima.UAHogar.modelo.TipoAccionAuditoria;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

// Servicio del panel de supervisor
@Service
public class SupervisorServicio {

    private final UsuarioDAO usuarioDAO;
    private final HogarDAO hogarDAO;
    private final MiembroHogarDAO miembroHogarDAO;
    private final RegistroTareaDAO registroTareaDAO;
    private final TareaDAO tareaDAO;
    private final IncidenciaDAO incidenciaDAO;
    private final HogarServicio hogarServicio;
    private final AuditoriaServicio auditoriaServicio;

    public SupervisorServicio(UsuarioDAO usuarioDAO, HogarDAO hogarDAO, MiembroHogarDAO miembroHogarDAO,
                              RegistroTareaDAO registroTareaDAO, TareaDAO tareaDAO, IncidenciaDAO incidenciaDAO,
                              HogarServicio hogarServicio, AuditoriaServicio auditoriaServicio) {
        this.usuarioDAO = usuarioDAO;
        this.hogarDAO = hogarDAO;
        this.miembroHogarDAO = miembroHogarDAO;
        this.registroTareaDAO = registroTareaDAO;
        this.tareaDAO = tareaDAO;
        this.incidenciaDAO = incidenciaDAO;
        this.hogarServicio = hogarServicio;
        this.auditoriaServicio = auditoriaServicio;
    }

    // Métricas globales
    public MetricasSupervisionDTO obtenerMetricas() {
        long totalUsuarios = usuarioDAO.count();
        long totalHogares = hogarDAO.count();
        long tareasActivas = registroTareaDAO.countByEstadoIn(List.of("PENDIENTE", "VENCIDA"));
        long incidenciasAbiertas = incidenciaDAO.countByEstado("OPEN");

        return new MetricasSupervisionDTO(totalUsuarios, totalHogares, tareasActivas, incidenciasAbiertas);
    }

    //Hogares

    // Buscar hogares por nombre o código
    public List<HogarSupervisionDTO> buscarHogares(String busqueda) {
        String texto = busqueda == null ? "" : busqueda.trim().toLowerCase();

        return hogarDAO.findAll().stream()
                .filter(h -> texto.isEmpty()
                        || h.getNombre().toLowerCase().contains(texto)
                        || h.getCodigoInvitacion().toLowerCase().contains(texto))
                .map(this::aHogarDTO)
                .toList();
    }

    private HogarSupervisionDTO aHogarDTO(Hogar hogar) {
        List<MiembroHogar> miembros = miembroHogarDAO.findByHogarId(hogar.getId());
        return new HogarSupervisionDTO(
                hogar.getId(),
                hogar.getNombre(),
                hogar.getCodigoInvitacion(),
                hogar.getFechaCreacion(),
                miembros.size(),
                esHogarFantasma(miembros)
        );
    }

    // Reconoce las cuentas que ya pasaron por el borrado o anonimizacion
    private boolean esUsuarioEliminado(Usuario usuario) {
        return usuario != null && usuario.getUsuario() != null
                && usuario.getUsuario().startsWith("usuario_eliminado_");
    }

    // Un hogar es fantasma si sus miembros son solo cuentas ya eliminadas
    private boolean esHogarFantasma(List<MiembroHogar> miembros) {
        return !miembros.isEmpty() && miembros.stream().allMatch(m -> esUsuarioEliminado(m.getUsuario()));
    }

    // Vista de un hogar
    public HogarDetalleSupervisionDTO obtenerDetalleHogar(Long hogarId) {
        Hogar hogar = hogarDAO.findById(hogarId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));

        List<MiembroSupervisionDTO> miembros = miembroHogarDAO.findByHogarId(hogarId).stream()
                .map(this::aMiembroDTO)
                .sorted(Comparator.comparingInt(MiembroSupervisionDTO::puntos).reversed())
                .toList();

        List<TareaSupervisionDTO> tareas = registroTareaDAO.findByHogarIdOrderByFechaLimiteAsc(hogarId).stream()
                .map(this::aTareaDTO)
                .toList();

        return new HogarDetalleSupervisionDTO(
                hogar.getId(),
                hogar.getNombre(),
                hogar.getCodigoInvitacion(),
                hogar.getFechaCreacion(),
                miembros,
                tareas
        );
    }

    // Detalle de un hogar
    public HogarDetalleAmpliadoDTO obtenerDetalleAmpliadoHogar(Long hogarId) {
        Hogar hogar = hogarDAO.findById(hogarId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));

        List<MiembroSupervisionDTO> miembros = miembroHogarDAO.findByHogarId(hogarId).stream()
                .map(this::aMiembroDTO)
                .sorted(Comparator.comparingInt(MiembroSupervisionDTO::puntos).reversed())
                .toList();

        List<PlantillaTareaSupervisionDTO> plantillas = tareaDAO.findByHogarId(hogarId).stream()
                .map(this::aPlantillaDTO)
                .toList();

        List<TareaSupervisionDTO> tareasActivas = registroTareaDAO.findByHogarIdOrderByFechaLimiteAsc(hogarId).stream()
                .filter(r -> "PENDIENTE".equals(r.getEstado()) || "VENCIDA".equals(r.getEstado()))
                .map(this::aTareaDTO)
                .toList();

        return new HogarDetalleAmpliadoDTO(
                hogar.getId(),
                hogar.getNombre(),
                hogar.getCodigoInvitacion(),
                hogar.getFechaCreacion(),
                miembros,
                plantillas,
                tareasActivas
        );
    }

    private PlantillaTareaSupervisionDTO aPlantillaDTO(Tarea t) {
        return new PlantillaTareaSupervisionDTO(
                t.getId(),
                t.getNombre(),
                t.getTipo(),
                t.getPuntos(),
                t.getFrecuencia()
        );
    }

    private MiembroSupervisionDTO aMiembroDTO(MiembroHogar m) {
        Usuario u = m.getUsuario();
        int puntos = registroTareaDAO.sumarPuntosCompletadosTotales(u.getId(), m.getHogar().getId())
                - registroTareaDAO.sumarPenalizacionVencidasTotales(u.getId(), m.getHogar().getId());
        return new MiembroSupervisionDTO(
                u.getId(),
                u.getNombre(),
                u.getUsuario(),
                u.getImagenPerfil(),
                m.getRol(),
                puntos
        );
    }

    // Borra un hogar por completo
    @Transactional
    public void eliminarHogar(Long hogarId) {
        Hogar hogar = hogarDAO.findById(hogarId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));

        String nombreHogar = hogar.getNombre();
        hogarServicio.eliminarHogarPorCompleto(hogarId);

        auditoriaServicio.registrar(UsuarioActual.id(), TipoAccionAuditoria.ELIMINAR_HOGAR,
                "Elimino el hogar " + nombreHogar);
    }

    // Borra de golpe todos los hogares fantasma
    @Transactional
    public int limpiarHogaresFantasma() {
        List<Long> idsFantasma = hogarDAO.findAll().stream()
                .filter(h -> esHogarFantasma(miembroHogarDAO.findByHogarId(h.getId())))
                .map(Hogar::getId)
                .toList();


        for (Long hogarId : idsFantasma) {
            hogarServicio.eliminarHogarPorCompleto(hogarId);
        }

        if (!idsFantasma.isEmpty()) {
            auditoriaServicio.registrar(UsuarioActual.id(), TipoAccionAuditoria.LIMPIAR_FANTASMAS,
                    "Limpio " + idsFantasma.size() + " hogar(es) fantasma");
        }

        return idsFantasma.size();
    }

    // Tareas

    // Buscar tareas con filtros
    public List<TareaSupervisionDTO> buscarTareas(String busqueda, String estado, String tipo, Long usuarioId, String orden) {
        String texto = busqueda == null ? "" : busqueda.trim().toLowerCase();

        List<TareaSupervisionDTO> resultado = registroTareaDAO.findAll().stream()
                .filter(r -> texto.isEmpty()
                        || (r.getTarea() != null
                        && r.getTarea().getNombre() != null
                        && r.getTarea().getNombre().toLowerCase().contains(texto)))
                .filter(r -> estado == null || estado.isBlank() || estado.equalsIgnoreCase(r.getEstado()))
                .filter(r -> tipo == null || tipo.isBlank() || tipo.equalsIgnoreCase(r.getTarea().getTipo()))
                .filter(r -> usuarioId == null
                        || (r.getUsuarioAsignado() != null && usuarioId.equals(r.getUsuarioAsignado().getId())))
                .map(this::aTareaDTO)
                .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));

        ordenarTareas(resultado, orden);
        return resultado;
    }

    // Ordenar tareas
    private void ordenarTareas(List<TareaSupervisionDTO> tareas, String orden) {
        if (orden == null || orden.isBlank()) return;

        java.util.Comparator<TareaSupervisionDTO> comparador = switch (orden) {
            case "fecha-desc" -> java.util.Comparator.comparing(
                    TareaSupervisionDTO::fechaLimite, java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder()));
            case "puntos-asc" -> java.util.Comparator.comparing(
                    TareaSupervisionDTO::puntos, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
            case "puntos-desc" -> java.util.Comparator.comparing(
                    TareaSupervisionDTO::puntos, java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder()));
            default -> java.util.Comparator.comparing(
                    TareaSupervisionDTO::fechaLimite, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
        };

        tareas.sort(comparador);
    }

    private TareaSupervisionDTO aTareaDTO(RegistroTarea r) {
        return new TareaSupervisionDTO(
                r.getId(),
                r.getTarea().getNombre(),
                r.getTarea().getTipo(),
                r.getEstado(),
                r.getHogar().getNombre(),
                r.getUsuarioAsignado() != null ? r.getUsuarioAsignado().getId() : null,
                r.getUsuarioAsignado() != null ? r.getUsuarioAsignado().getNombre() : "Sin asignar",
                r.getTarea().getPuntos(),
                r.getFechaLimite()
        );
    }

    // Eliminar tarea
    @Transactional
    public void eliminarTarea(Long registroTareaId) {
        RegistroTarea registro = registroTareaDAO.findById(registroTareaId)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));

        String nombreTarea = registro.getTarea() != null ? registro.getTarea().getNombre() : "sin nombre";
        String nombreHogar = registro.getHogar() != null ? registro.getHogar().getNombre() : "sin hogar";

        registroTareaDAO.deleteById(registroTareaId);

        auditoriaServicio.registrar(UsuarioActual.id(), TipoAccionAuditoria.ELIMINAR_TAREA,
                "Elimino la tarea " + nombreTarea + " del hogar " + nombreHogar);
    }

    //Incidencias

    // Listado de incidencias
    public List<IncidenciaSupervisionDTO> buscarIncidencias(String busqueda, String estado) {
        String texto = busqueda == null ? "" : busqueda.trim().toLowerCase();

        return incidenciaDAO.findAll().stream()
                .filter(i -> texto.isEmpty()
                        || (i.getDescripcion() != null && i.getDescripcion().toLowerCase().contains(texto))
                        || (i.getRegistroTarea() != null && i.getRegistroTarea().getTarea() != null
                        && i.getRegistroTarea().getTarea().getNombre() != null
                        && i.getRegistroTarea().getTarea().getNombre().toLowerCase().contains(texto)))
                .filter(i -> estado == null || estado.isBlank() || estado.equalsIgnoreCase(i.getEstado()))
                .sorted(Comparator.comparing(Incidencia::getFechaCreacion).reversed())
                .map(this::aIncidenciaDTO)
                .toList();
    }

    private IncidenciaSupervisionDTO aIncidenciaDTO(Incidencia i) {
        return new IncidenciaSupervisionDTO(
                i.getId(),
                i.getDescripcion(),
                i.getEstado(),
                i.getRegistroTarea().getHogar().getNombre(),
                i.getRegistroTarea().getTarea() != null ? i.getRegistroTarea().getTarea().getNombre() : "Tarea eliminada",
                i.getReportante().getNombre(),
                i.getResponsable() != null ? i.getResponsable().getNombre() : "Sin responsable",
                i.getFechaCreacion(),
                i.getFechaCierre()
        );
    }

    // Cierra una incidencia como supervisor
    @Transactional
    public void cerrarIncidenciaComoSupervisor(Long incidenciaId, Long supervisorId) {
        Incidencia incidencia = incidenciaDAO.findById(incidenciaId)
                .orElseThrow(() -> new IllegalArgumentException("La incidencia no existe"));

        if ("CLOSED".equals(incidencia.getEstado())) {
            throw new IllegalArgumentException("Esta incidencia ya esta cerrada");
        }

        Usuario supervisor = usuarioDAO.findById(supervisorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        incidencia.setEstado("CLOSED");
        incidencia.setFechaCierre(LocalDateTime.now());
        incidencia.setCerradaPor(supervisor);

        incidenciaDAO.save(incidencia);

        auditoriaServicio.registrar(supervisorId, TipoAccionAuditoria.CERRAR_INCIDENCIA,
                "Cerro la incidencia #" + incidenciaId + " (" + incidencia.getDescripcion() + ")");
    }

    // Auditoria

    // Ultimas acciones
    public List<AuditoriaSupervisionDTO> obtenerAuditoria(String busqueda, String accion) {
        return auditoriaServicio.obtenerUltimasAcciones(busqueda, accion);
    }
}