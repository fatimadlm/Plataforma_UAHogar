package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.util.ZonaHorariaApp;

import com.fatima.UAHogar.DAO.IncidenciaDAO;
import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.DAO.UsuarioDAO;
import com.fatima.UAHogar.modelo.Incidencia;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.modelo.TipoNotificacion;
import com.fatima.UAHogar.modelo.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidenciaServicio {

    private final IncidenciaDAO incidenciaDAO;
    private final RegistroTareaDAO registroTareaDAO;
    private final UsuarioDAO usuarioDAO;
    private final MiembroHogarDAO miembroHogarDAO;
    private final NotificacionServicio notificacionServicio;

    public IncidenciaServicio(
            IncidenciaDAO incidenciaDAO,
            RegistroTareaDAO registroTareaDAO,
            UsuarioDAO usuarioDAO,
            MiembroHogarDAO miembroHogarDAO,
            NotificacionServicio notificacionServicio) {
        this.incidenciaDAO = incidenciaDAO;
        this.registroTareaDAO = registroTareaDAO;
        this.usuarioDAO = usuarioDAO;
        this.miembroHogarDAO = miembroHogarDAO;
        this.notificacionServicio = notificacionServicio;
    }

    // Reporta una tarea completada mal hecha
    @Transactional
    public Incidencia reportarIncidencia(Long registroTareaId, Long reportanteId, String descripcion) {
        RegistroTarea registro = registroTareaDAO.findById(registroTareaId)
                .orElseThrow(() -> new IllegalArgumentException("La tarea completada no existe"));

        if (!"COMPLETADA".equals(registro.getEstado()))
            throw new IllegalArgumentException("Solo se pueden reportar incidencias sobre tareas completadas");

        Usuario reportante = usuarioDAO.findById(reportanteId)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));

        // Debe ser del mismo hogar
        miembroHogarDAO.findByUsuarioIdAndHogarId(reportanteId, registro.getHogar().getId())
                .orElseThrow(() -> new IllegalArgumentException("No perteneces a este hogar"));

        if (descripcion == null || descripcion.isBlank())
            throw new IllegalArgumentException("Describe el problema encontrado en la tarea");

        // No duplicar incidencias abiertas
        if (incidenciaDAO.existsByRegistroTareaIdAndEstado(registroTareaId, "OPEN")) {
            throw new IllegalArgumentException("Esta tarea ya tiene una incidencia abierta");
        }

        Incidencia nueva = new Incidencia(registro, reportante, descripcion);
        nueva = incidenciaDAO.save(nueva);

        // Notificamos al responsable o al hogar
        notificarNuevaIncidencia(nueva);

        return nueva;
    }

    // Una incidencia concreta, para la pagina de detalle a la que lleva la notificacion
    public Incidencia obtenerPorId(Long incidenciaId) {
        return incidenciaDAO.findById(incidenciaId)
                .orElseThrow(() -> new IllegalArgumentException("La incidencia no existe"));
    }

    // Incidencias de un hogar, para el admin
    public List<Incidencia> obtenerIncidenciasDelHogar(Long hogarId) {
        return incidenciaDAO.findByHogarId(hogarId);
    }

    // Incidencias reportadas por un usuario
    public List<Incidencia> obtenerIncidenciasReportadasPor(Long usuarioId) {
        return incidenciaDAO.findByReportanteIdOrderByFechaCreacionDesc(usuarioId);
    }

    // Incidencias sobre tareas que hizo un usuario
    public List<Incidencia> obtenerIncidenciasComoResponsable(Long usuarioId) {
        return incidenciaDAO.findByResponsableIdOrderByFechaCreacionDesc(usuarioId);
    }

    // Solo un ADMIN puede cerrar, y no se reabre
    @Transactional
    public Incidencia cerrarIncidencia(Long incidenciaId, Long adminId) {
        Incidencia incidencia = incidenciaDAO.findById(incidenciaId)
                .orElseThrow(() -> new IllegalArgumentException("La incidencia no existe"));

        if ("CLOSED".equals(incidencia.getEstado()))
            throw new IllegalArgumentException("Esta incidencia ya está cerrada");

        Long hogarId = incidencia.getRegistroTarea().getHogar().getId();

        MiembroHogar admin = miembroHogarDAO.findByUsuarioIdAndHogarId(adminId, hogarId)
                .orElseThrow(() -> new IllegalArgumentException("No perteneces a este hogar"));

        if (!"ADMIN".equals(admin.getRol()))
            throw new IllegalArgumentException("Solo un administrador del hogar puede cerrar incidencias");

        incidencia.setEstado("CLOSED");
        incidencia.setFechaCierre(LocalDateTime.now(ZonaHorariaApp.ZONA));
        incidencia.setCerradaPor(admin.getUsuario());

        incidenciaDAO.save(incidencia);

        // Notificamos el cierre
        notificarCierre(incidencia);

        return incidencia;
    }

    // Avisa al responsable
    private void notificarNuevaIncidencia(Incidencia incidencia) {
        try {
            RegistroTarea registro = incidencia.getRegistroTarea();
            Usuario responsable = incidencia.getResponsable();
            String nombreTarea = registro.getTarea().getNombre();

            // Si existe responsable, se le notifica únicamente a él
            if (responsable != null) {
                notificacionServicio.crear(
                        responsable,
                        registro.getHogar(),
                        TipoNotificacion.INCIDENCIA_NUEVA,
                        "Nueva incidencia",
                        "Nueva incidencia reportada: " + nombreTarea,
                        incidencia.getId(),
                        "/incidencias/" + incidencia.getId()
                );
            } else {
                // Si no hay responsable, avisamos al hogar
                notificacionServicio.notificarMiembros(
                        registro.getHogar(),
                        TipoNotificacion.INCIDENCIA_NUEVA,
                        "Nueva incidencia",
                        "Se ha reportado una nueva incidencia sobre la tarea: " + nombreTarea,
                        incidencia.getId(),
                        "/incidencias/" + incidencia.getId()
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Avisa al reportante cuando se cierra
    private void notificarCierre(Incidencia incidencia) {
        try {
            Usuario reportante = incidencia.getReportante();
            if (reportante == null) return;

            String nombreTarea = incidencia.getRegistroTarea().getTarea().getNombre();
            String nombreUsuario = incidencia.getCerradaPor() != null
                    ? incidencia.getCerradaPor().getNombre()
                    : "un administrador";

            notificacionServicio.crear(
                    reportante,
                    incidencia.getRegistroTarea().getHogar(),
                    TipoNotificacion.INCIDENCIA_CERRADA,
                    "Incidencia cerrada",
                    "La incidencia sobre \"" + nombreTarea + "\" ha sido resuelta y cerrada por " + nombreUsuario + ".",
                    incidencia.getId(),
                    "/incidencias/" + incidencia.getId()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}