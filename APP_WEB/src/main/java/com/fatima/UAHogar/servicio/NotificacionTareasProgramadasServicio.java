package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.modelo.TipoNotificacion;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.util.PlazosUtil;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacionTareasProgramadasServicio {

    private final RegistroTareaDAO registroTareaDAO;
    private final NotificacionServicio notificacionServicio;

    public NotificacionTareasProgramadasServicio(RegistroTareaDAO registroTareaDAO, NotificacionServicio notificacionServicio) {
        this.registroTareaDAO = registroTareaDAO;
        this.notificacionServicio = notificacionServicio;
    }

    // Revisa cada hora las tareas que requieren una notificación
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void comprobarNotificacionesTareas() {
        LocalDateTime ahora = LocalDateTime.now();
        List<RegistroTarea> pendientes = registroTareaDAO.findByEstadoAndFechaLimiteBefore("PENDIENTE", ahora);
        procesarMargenGracia(pendientes, ahora);
        comprobarUrgencias(ahora);
    }

    // Notifica cuando una tarea acaba de entrar en margen de gracia
    private void procesarMargenGracia(List<RegistroTarea> tareas, LocalDateTime ahora) {
        for (RegistroTarea registro : tareas) {
            if (registro.getUsuarioAsignado() == null || registro.getFechaLimite() == null) continue;
            if (Boolean.TRUE.equals(registro.getNotificacionGraciaEnviada())) continue;

            long margenHoras = PlazosUtil.margenGraciaHoras(registro.getTarea().getFrecuencia());
            LocalDateTime finGracia = registro.getFechaLimite().plusHours(margenHoras);

            // Ya ha terminado el margen: no corresponde esta notificación
            if (!ahora.isBefore(finGracia)) continue;

            enviarGracia(registro);
            registro.setNotificacionGraciaEnviada(true);
            registroTareaDAO.save(registro);
        }
    }

    // Comprueba tareas próximas a vencer
    private void comprobarUrgencias(LocalDateTime ahora) {
        LocalDateTime limite = ahora.plusHours(24);
        List<RegistroTarea> pendientes = registroTareaDAO.findByEstadoAndFechaLimiteBetween("PENDIENTE", ahora, limite);

        for (RegistroTarea registro : pendientes) {
            if (registro.getUsuarioAsignado() == null) continue;
            if (Boolean.TRUE.equals(registro.getNotificacionUrgenciaEnviada())) continue;
            enviarUrgencia(registro, ahora);
            registro.setNotificacionUrgenciaEnviada(true);
            registroTareaDAO.save(registro);
        }
    }

    // Envía la alerta de urgencia
    private void enviarUrgencia(RegistroTarea registro, LocalDateTime ahora) {
        long minutos = Duration.between(ahora, registro.getFechaLimite()).toMinutes();
        long horas = Math.max(1, (minutos + 59) / 60);
        Usuario usuario = registro.getUsuarioAsignado();

        notificacionServicio.crear(
                usuario,
                registro.getHogar(),
                TipoNotificacion.TAREA_URGENTE,
                "Tarea urgente",
                "¡Atención! La tarea '" + registro.getTarea().getNombre() + "' vence pronto (quedan " + horas + "h)",
                registro.getId(),
                "/feed"
        );
    }

    // Envía la alerta de margen de gracia
    private void enviarGracia(RegistroTarea registro) {
        Usuario usuario = registro.getUsuarioAsignado();

        notificacionServicio.crear(
                usuario,
                registro.getHogar(),
                TipoNotificacion.TAREA_MARGEN_GRACIA,
                "Tarea en periodo de gracia",
                "La tarea '" + registro.getTarea().getNombre() + "' ha entrado en periodo de gracia. Complétala ahora para conservar el 70% de los puntos.",
                registro.getId(),
                "/feed"
        );
    }
}