package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.DAO.IntercambioTareaDAO;
import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.DAO.UsuarioDAO;
import com.fatima.UAHogar.modelo.IntercambioTarea;
import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.modelo.TipoNotificacion;
import com.fatima.UAHogar.modelo.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IntercambioTareaServicio {

    private final IntercambioTareaDAO intercambioTareaDAO;
    private final RegistroTareaDAO registroTareaDAO;
    private final UsuarioDAO usuarioDAO;
    private final MiembroHogarDAO miembroHogarDAO;
    private final NotificacionServicio notificacionServicio;

    public IntercambioTareaServicio(
            IntercambioTareaDAO intercambioTareaDAO,
            RegistroTareaDAO registroTareaDAO,
            UsuarioDAO usuarioDAO,
            MiembroHogarDAO miembroHogarDAO,
            NotificacionServicio notificacionServicio) {
        this.intercambioTareaDAO = intercambioTareaDAO;
        this.registroTareaDAO = registroTareaDAO;
        this.usuarioDAO = usuarioDAO;
        this.miembroHogarDAO = miembroHogarDAO;
        this.notificacionServicio = notificacionServicio;
    }

    // Registramos una nueva solicitud de intercambio entre dos miembros
    @Transactional
    public IntercambioTarea solicitarIntercambio(Long registroTareaId, Long solicitanteId, Long destinatarioId) {

        if (solicitanteId.equals(destinatarioId)) {
            throw new IllegalArgumentException("No puedes intercambiar una tarea contigo mismo");
        }

        RegistroTarea registro = registroTareaDAO.findById(registroTareaId)
                .orElseThrow(() -> new IllegalArgumentException("La tarea no existe"));

        // Comprobamos que el solicitante tenga la tarea asignada
        if (registro.getUsuarioAsignado() == null || !registro.getUsuarioAsignado().getId().equals(solicitanteId)) {
            throw new IllegalArgumentException("Solo puedes intercambiar una tarea que tengas asignada");
        }

        validarTareaIntercambiable(registro);

        Long hogarId = registro.getHogar().getId();

        // Verificamos que ambos usuarios pertenezcan al hogar
        miembroHogarDAO.findByUsuarioIdAndHogarId(solicitanteId, hogarId)
                .orElseThrow(() -> new IllegalArgumentException("No perteneces a este hogar"));

        Usuario destinatario = usuarioDAO.findById(destinatarioId)
                .orElseThrow(() -> new IllegalArgumentException("El usuario destinatario no existe"));

        miembroHogarDAO.findByUsuarioIdAndHogarId(destinatarioId, hogarId)
                .orElseThrow(() -> new IllegalArgumentException("Ese usuario no pertenece a tu hogar"));

        // Evitamos duplicar solicitudes pendientes para la misma tarea
        if (intercambioTareaDAO.existsByRegistroTareaIdAndEstado(registroTareaId, "PENDIENTE")) {
            throw new IllegalArgumentException("Esta tarea ya tiene una solicitud de intercambio pendiente");
        }

        Usuario solicitante = registro.getUsuarioAsignado();

        IntercambioTarea nuevo = new IntercambioTarea(registro, solicitante, destinatario);
        nuevo = intercambioTareaDAO.save(nuevo);

        notificarSolicitud(nuevo);

        return nuevo;
    }

    // Aceptamos el intercambio y reasignamos la tarea al destinatario
    @Transactional
    public IntercambioTarea aceptarIntercambio(Long intercambioId, Long usuarioId) {

        IntercambioTarea intercambio = obtenerPendientePropio(intercambioId, usuarioId);

        // Verificamos que la tarea y los usuarios sigan cumpliendo los requisitos
        try {
            validarTareaIntercambiable(intercambio.getRegistroTarea());
            validarPartesSiguenEnHogar(intercambio);
        } catch (IllegalArgumentException e) {
            intercambio.setEstado("CADUCADA");
            intercambio.setFechaRespuesta(LocalDateTime.now());
            intercambioTareaDAO.save(intercambio);
            notificarCaducidad(intercambio);
            throw e;
        }

        RegistroTarea registro = intercambio.getRegistroTarea();
        registro.setUsuarioAsignado(intercambio.getDestinatario());
        registroTareaDAO.save(registro);

        intercambio.setEstado("ACEPTADA");
        intercambio.setFechaRespuesta(LocalDateTime.now());
        intercambioTareaDAO.save(intercambio);

        notificarRespuesta(intercambio, true);

        return intercambio;
    }

    // Rechazamos el intercambio y cerramos la solicitud
    @Transactional
    public IntercambioTarea rechazarIntercambio(Long intercambioId, Long usuarioId) {

        IntercambioTarea intercambio = obtenerPendientePropio(intercambioId, usuarioId);

        intercambio.setEstado("RECHAZADA");
        intercambio.setFechaRespuesta(LocalDateTime.now());
        intercambioTareaDAO.save(intercambio);

        notificarRespuesta(intercambio, false);

        return intercambio;
    }

    // Buscamos un intercambio por su ID
    public IntercambioTarea obtenerPorId(Long id) {
        return intercambioTareaDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud de intercambio no existe"));
    }

    // Obtenemos las solicitudes pendientes recibidas por un usuario
    public List<IntercambioTarea> obtenerRecibidasPendientes(Long usuarioId) {
        return intercambioTareaDAO.findByDestinatarioIdAndEstadoOrderByFechaSolicitudDesc(usuarioId, "PENDIENTE");
    }

    // Obtenemos todas las solicitudes enviadas por un usuario
    public List<IntercambioTarea> obtenerEnviadas(Long usuarioId) {
        return intercambioTareaDAO.findBySolicitanteIdOrderByFechaSolicitudDesc(usuarioId);
    }

    // Marcamos como caducadas las solicitudes activas si un miembro deja el hogar
    @Transactional
    public void caducarPorSalidaDeMiembro(Long usuarioId, Long hogarId) {
        List<IntercambioTarea> pendientes = intercambioTareaDAO.findPendientesDeUsuarioEnHogar(usuarioId, hogarId);

        for (IntercambioTarea intercambio : pendientes) {
            intercambio.setEstado("CADUCADA");
            intercambio.setFechaRespuesta(LocalDateTime.now());
            intercambioTareaDAO.save(intercambio);

            boolean seFueElSolicitante = intercambio.getSolicitante().getId().equals(usuarioId);
            Usuario otraParte = seFueElSolicitante ? intercambio.getDestinatario() : intercambio.getSolicitante();
            notificarCaducidadPorSalida(intercambio, otraParte);
        }
    }

    // Validamos que la solicitud esté pendiente y pertenezca al usuario indicado
    private IntercambioTarea obtenerPendientePropio(Long intercambioId, Long usuarioId) {
        IntercambioTarea intercambio = obtenerPorId(intercambioId);

        if (!"PENDIENTE".equals(intercambio.getEstado())) {
            throw new IllegalArgumentException("Esta solicitud ya ha sido respondida");
        }

        if (!intercambio.getDestinatario().getId().equals(usuarioId)) {
            throw new SecurityException("Esta solicitud no es para ti");
        }

        return intercambio;
    }

    // Comprobamos que la tarea siga pendiente, activa y en plazo
    private void validarTareaIntercambiable(RegistroTarea registro) {
        if (!"PENDIENTE".equals(registro.getEstado())) {
            throw new IllegalArgumentException("Esta tarea ya no está pendiente, no se puede intercambiar");
        }

        if (registro.estaVencida()) {
            throw new IllegalArgumentException("Esta tarea ya venció o está en margen de gracia, no se puede intercambiar");
        }

        if (registro.getTarea().getActiva() != null && !registro.getTarea().getActiva()) {
            throw new IllegalArgumentException("Esta tarea ya no está activa, no se puede intercambiar");
        }
    }

    // Verificamos que la tarea siga asignada al solicitante y ambos sigan en el hogar
    private void validarPartesSiguenEnHogar(IntercambioTarea intercambio) {
        RegistroTarea registro = intercambio.getRegistroTarea();
        Long hogarId = registro.getHogar().getId();

        if (registro.getUsuarioAsignado() == null
                || !registro.getUsuarioAsignado().getId().equals(intercambio.getSolicitante().getId())) {
            throw new IllegalArgumentException("La tarea ya no está asignada a quien la ofreció, no se puede intercambiar");
        }

        boolean solicitanteSigueEnHogar = miembroHogarDAO
                .findByUsuarioIdAndHogarId(intercambio.getSolicitante().getId(), hogarId)
                .isPresent();

        boolean destinatarioSigueEnHogar = miembroHogarDAO
                .findByUsuarioIdAndHogarId(intercambio.getDestinatario().getId(), hogarId)
                .isPresent();

        if (!solicitanteSigueEnHogar || !destinatarioSigueEnHogar) {
            throw new IllegalArgumentException("Alguna de las dos personas ya no pertenece a este hogar, no se puede intercambiar");
        }
    }

    // Notificamos al destinatario sobre la propuesta recibida
    private void notificarSolicitud(IntercambioTarea intercambio) {
        String nombreTarea = intercambio.getRegistroTarea().getTarea().getNombre();

        notificacionServicio.crear(
                intercambio.getDestinatario(),
                intercambio.getRegistroTarea().getHogar(),
                TipoNotificacion.INTERCAMBIO_SOLICITADO,
                "Propuesta de intercambio",
                intercambio.getSolicitante().getNombre() + " quiere intercambiar contigo la tarea \"" + nombreTarea + "\"",
                intercambio.getId(),
                "/intercambios/" + intercambio.getId()
        );
    }

    // Notificamos al solicitante la respuesta de la solicitud
    private void notificarRespuesta(IntercambioTarea intercambio, boolean aceptada) {
        String nombreTarea = intercambio.getRegistroTarea().getTarea().getNombre();
        String nombreDestinatario = intercambio.getDestinatario().getNombre();

        notificacionServicio.crear(
                intercambio.getSolicitante(),
                intercambio.getRegistroTarea().getHogar(),
                aceptada ? TipoNotificacion.INTERCAMBIO_ACEPTADO : TipoNotificacion.INTERCAMBIO_RECHAZADO,
                aceptada ? "Intercambio aceptado" : "Intercambio rechazado",
                aceptada
                        ? nombreDestinatario + " ha aceptado quedarse la tarea \"" + nombreTarea + "\""
                        : nombreDestinatario + " ha rechazado el intercambio de \"" + nombreTarea + "\"",
                intercambio.getId(),
                "/intercambios/" + intercambio.getId()
        );
    }

    // Notificamos al solicitante si la tarea dejó de estar disponible
    private void notificarCaducidad(IntercambioTarea intercambio) {
        String nombreTarea = intercambio.getRegistroTarea().getTarea().getNombre();

        notificacionServicio.crear(
                intercambio.getSolicitante(),
                intercambio.getRegistroTarea().getHogar(),
                TipoNotificacion.INTERCAMBIO_CADUCADO,
                "Intercambio no completado",
                "Tu solicitud de intercambio de \"" + nombreTarea + "\" ya no se pudo completar: la tarea dejó de estar disponible.",
                intercambio.getId(),
                "/intercambios/" + intercambio.getId()
        );
    }

    // Notificamos la caducidad cuando un usuario abandona el hogar
    private void notificarCaducidadPorSalida(IntercambioTarea intercambio, Usuario aviso) {
        String nombreTarea = intercambio.getRegistroTarea().getTarea().getNombre();

        notificacionServicio.crear(
                aviso,
                intercambio.getRegistroTarea().getHogar(),
                TipoNotificacion.INTERCAMBIO_CADUCADO,
                "Intercambio caducado",
                "El intercambio de \"" + nombreTarea + "\" ha caducado: la otra persona ya no pertenece a este hogar.",
                intercambio.getId(),
                "/intercambios/" + intercambio.getId()
        );
    }
}