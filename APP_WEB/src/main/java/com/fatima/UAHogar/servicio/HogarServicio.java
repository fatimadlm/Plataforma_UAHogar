package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.util.ZonaHorariaApp;

import com.fatima.UAHogar.DAO.HogarDAO;
import com.fatima.UAHogar.DAO.IncidenciaDAO;
import com.fatima.UAHogar.DAO.IntercambioTareaDAO;
import com.fatima.UAHogar.DAO.MensajeGrupoDAO;
import com.fatima.UAHogar.DAO.NotificacionDAO;
import com.fatima.UAHogar.DAO.ReaccionMensajeDAO;
import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.dto.MiembroPuntosDTO;
import com.fatima.UAHogar.modelo.Mensaje;
import com.fatima.UAHogar.modelo.MensajeGrupo;
import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.UsuarioDAO;
import com.fatima.UAHogar.modelo.Hogar;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.modelo.TipoNotificacion;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HogarServicio {

    private final HogarDAO hogarDAO;
    private final MiembroHogarDAO miembroHogarDAO;
    private final UsuarioDAO usuarioDAO;
    private final RegistroTareaServicio registroTareaServicio;
    private final RegistroTareaDAO registroTareaDAO;
    private final NotificacionServicio notificacionServicio;
    private final IntercambioTareaServicio intercambioTareaServicio;
    private final IncidenciaDAO incidenciaDAO;
    private final IntercambioTareaDAO intercambioTareaDAO;
    private final MensajeGrupoDAO mensajeGrupoDAO;
    private final ReaccionMensajeDAO reaccionMensajeDAO;
    private final NotificacionDAO notificacionDAO;

    public HogarServicio(
            HogarDAO hogarDAO,
            MiembroHogarDAO miembroHogarDAO,
            UsuarioDAO usuarioDAO,
            RegistroTareaDAO registroTareaDAO,
            RegistroTareaServicio registroTareaServicio,
            NotificacionServicio notificacionServicio,
            IntercambioTareaServicio intercambioTareaServicio,
            IncidenciaDAO incidenciaDAO,
            IntercambioTareaDAO intercambioTareaDAO,
            MensajeGrupoDAO mensajeGrupoDAO,
            ReaccionMensajeDAO reaccionMensajeDAO,
            NotificacionDAO notificacionDAO) {

        this.hogarDAO = hogarDAO;
        this.miembroHogarDAO = miembroHogarDAO;
        this.usuarioDAO = usuarioDAO;
        this.registroTareaDAO = registroTareaDAO;
        this.registroTareaServicio = registroTareaServicio;
        this.notificacionServicio = notificacionServicio;
        this.intercambioTareaServicio = intercambioTareaServicio;
        this.incidenciaDAO = incidenciaDAO;
        this.intercambioTareaDAO = intercambioTareaDAO;
        this.mensajeGrupoDAO = mensajeGrupoDAO;
        this.reaccionMensajeDAO = reaccionMensajeDAO;
        this.notificacionDAO = notificacionDAO;
    }

    // Borra un hogar por completo
    @Transactional
    public void eliminarHogarPorCompleto(Long hogarId) {
        List<RegistroTarea> registros = registroTareaDAO.findByHogarIdOrderByFechaLimiteAsc(hogarId);
        if (!registros.isEmpty()) {
            List<Long> registroIds = registros.stream().map(RegistroTarea::getId).toList();

            incidenciaDAO.deleteAll(incidenciaDAO.findByHogarId(hogarId));
            intercambioTareaDAO.deleteAll(intercambioTareaDAO.findByRegistroTareaIdIn(registroIds));

            registroTareaDAO.deleteAll(registros);
        }

        List<MensajeGrupo> mensajes = mensajeGrupoDAO.findByHogarIdOrderByFechaEnvioAsc(hogarId);
        if (!mensajes.isEmpty()) {
            List<Long> mensajeIds = mensajes.stream().map(Mensaje::getId).toList();
            reaccionMensajeDAO.deleteAll(reaccionMensajeDAO.findByMensajeIdIn(mensajeIds));
            mensajeGrupoDAO.deleteAll(mensajes);
        }

        notificacionDAO.deleteAll(notificacionDAO.findByHogarId(hogarId));

        // El hogar en sí: miembros y plantillas de tarea se van en cascada
        hogarDAO.deleteById(hogarId);
    }

    // Crea un nuevo hogar y asigna al creador como ADMIN
    @Transactional
    public Hogar crearHogar(String nombreHogar, Long creadorId, String aparienciaId) {
        Usuario creador = usuarioDAO.findById(creadorId)
                .orElseThrow(() -> new IllegalArgumentException("El usuario creador no existe"));

        Hogar nuevoHogar = new Hogar(nombreHogar);

        if (aparienciaId != null && !aparienciaId.isBlank()) {
            nuevoHogar.setAparienciaId(aparienciaId);
        }

        nuevoHogar.setFechaCreacion(LocalDate.now(ZonaHorariaApp.ZONA));

        nuevoHogar = hogarDAO.save(nuevoHogar);

        MiembroHogar relacionMiembro = new MiembroHogar(creador, nuevoHogar, "ADMIN");
        miembroHogarDAO.save(relacionMiembro);

        return nuevoHogar;
    }

    // Permite a un usuario unirse a un hogar con el codigo de invitacion
    @Transactional
    public void unirseAHogar(String codigo, Long usuarioId) {
        Hogar hogar = hogarDAO.findByCodigoInvitacion(codigo)
                .orElseThrow(() -> new IllegalArgumentException("Código de invitación no válido"));

        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException( "El usuario no existe"));

        Optional<MiembroHogar> yaEsMiembro =
                miembroHogarDAO.findByUsuarioIdAndHogarId(
                        usuarioId,
                        hogar.getId()
                );

        if (yaEsMiembro.isPresent()) {
            throw new IllegalArgumentException("Ya eres miembro de este hogar");
        }

        MiembroHogar nuevoMiembro = new MiembroHogar(usuario, hogar, "MIEMBRO");
        miembroHogarDAO.save(nuevoMiembro);

        // Recalculamos el reparto al entrar un nuevo miembro
        registroTareaServicio.recalcularCargaPorNuevoMiembro(
                hogar.getId()
        );

        // Avisamos al resto del hogar
        notificacionServicio.notificarMiembrosExcepto(
                hogar,
                usuarioId,
                TipoNotificacion.UNION_HOGAR,
                "Nuevo miembro en el hogar",
                usuario.getNombre()
                        + " se ha unido al hogar "
                        + hogar.getNombre(),
                hogar.getId(),
                "/panelhogar"
        );

        // Mensaje de bienvenida para el nuevo usuario
        notificacionServicio.crear(
                usuario,
                hogar,
                TipoNotificacion.UNION_HOGAR,
                "¡Bienvenido a tu nuevo hogar!",
                "¡Te has unido a "
                        + hogar.getNombre()
                        + " con éxito!",
                hogar.getId(),
                "/panelhogar"
        );
    }

    public List<MiembroHogar> obtenerHogaresPorUsuario(Long usuarioId) {
        return miembroHogarDAO.findByUsuarioId(usuarioId);
    }

    public int contarMiembros(Long hogarId) {
        return miembroHogarDAO.findByHogarId(hogarId).size();
    }
    // Valida que el usuario del JWT pertenezca al hogar antes de acceder o modificar sus datos
    public void verificarPertenencia(Long usuarioId, Long hogarId) {
        miembroHogarDAO.findByUsuarioIdAndHogarId(usuarioId, hogarId)
                .orElseThrow(() -> new SecurityException("No perteneces a este hogar"));
    }

    @Transactional
    public void abandonarHogar(
            Long usuarioId,
            Long hogarId) {

        MiembroHogar miembroQueSeVa = miembroHogarDAO .findByUsuarioIdAndHogarId(usuarioId, hogarId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No eres miembro de este hogar"));

        procesarSalidaDeMiembro(miembroQueSeVa);
    }

    // Permite a un ADMIN del hogar expulsar a otro miembro
    @Transactional
    public void expulsarMiembro(
            Long adminId,
            Long hogarId,
            Long usuarioAExpulsarId) {

        if (adminId.equals(usuarioAExpulsarId)) {
            throw new IllegalArgumentException(
                    "No puedes expulsarte a ti mismo. "
                            + "Usa la opción de abandonar el hogar");
        }

        MiembroHogar admin =
                miembroHogarDAO
                        .findByUsuarioIdAndHogarId(
                                adminId,
                                hogarId
                        )
                        .orElseThrow(() ->
                                new SecurityException(
                                        "No perteneces a este hogar"));

        if (!"ADMIN".equals(admin.getRol())) {
            throw new SecurityException(
                    "Solo un administrador del hogar puede "
                            + "expulsar miembros");
        }

        MiembroHogar miembroAExpulsar =
                miembroHogarDAO
                        .findByUsuarioIdAndHogarId(
                                usuarioAExpulsarId,
                                hogarId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ese usuario no es miembro "
                                                + "de este hogar"));

        Usuario usuarioExpulsado =
                miembroAExpulsar.getUsuario();

        Hogar hogar =
                miembroAExpulsar.getHogar();

        procesarSalidaDeMiembro(miembroAExpulsar);

        notificarExpulsion(
                usuarioExpulsado,
                hogar
        );
    }

    // Miembro sale del hogar abandonando o siendo expulsado
    private void procesarSalidaDeMiembro(
            MiembroHogar miembro) {

        Long usuarioId =
                miembro.getUsuario().getId();

        Long hogarId =
                miembro.getHogar().getId();

        boolean eraAdmin =
                "ADMIN".equals(miembro.getRol());

        miembroHogarDAO.delete(miembro);
        miembroHogarDAO.flush();

        List<MiembroHogar> miembrosRestantes =
                miembroHogarDAO.findByHogarId(hogarId);

        // Si ya no queda nadie o los que quedan son solo cuentas eliminadas
        boolean soloQuedanEliminados = !miembrosRestantes.isEmpty()
                && miembrosRestantes.stream().allMatch(m -> esUsuarioEliminado(m.getUsuario()));

        if (miembrosRestantes.isEmpty() || soloQuedanEliminados) {
            eliminarHogarPorCompleto(hogarId);
            return;
        }

        if (eraAdmin) {

            MiembroHogar nuevoAdmin =
                    miembrosRestantes.stream()
                            .min(Comparator.comparing(
                                    MiembroHogar::getId))
                            .get();

            nuevoAdmin.setRol("ADMIN");

            miembroHogarDAO.save(nuevoAdmin);
        }

        // Redistribuimos las tareas del miembro que salió
        registroTareaServicio.redistribuirTareasDeMiembro(
                usuarioId,
                hogarId
        );

        //Caducamos el intercambio si la otra perona ya no es del hogar
        intercambioTareaServicio.caducarPorSalidaDeMiembro(
                usuarioId,
                hogarId
        );
    }

    // Reconoce las cuentas que ya pasaron por el borrado/anonimización
    private boolean esUsuarioEliminado(Usuario usuario) {
        return usuario != null && usuario.getUsuario() != null
                && usuario.getUsuario().startsWith("usuario_eliminado_");
    }

    // Notifica al usuario expulsado
    private void notificarExpulsion(
            Usuario usuarioExpulsado,
            Hogar hogar) {

        notificacionServicio.crear(
                usuarioExpulsado,
                hogar,
                TipoNotificacion.EXPULSADO_HOGAR,
                "Has sido expulsado del hogar",
                "Un administrador te ha expulsado de \""
                        + hogar.getNombre()
                        + "\". Tus tareas pendientes se han "
                        + "redistribuido entre el resto de miembros.",
                hogar.getId(),
                "/mis-hogares"
        );
    }

    // Puntos de un miembro en un hogar
    public int calcularPuntosMiembro(Long usuarioId, Long hogarId) {
        int completados = registroTareaDAO.sumarPuntosCompletadosTotales(usuarioId, hogarId);
        int penalizaciones = registroTareaDAO.sumarPenalizacionVencidasTotales(usuarioId, hogarId);
        return completados - penalizaciones;
    }

    public List<MiembroPuntosDTO> getMiembrosOrdenadosPorPuntos(Long hogarId) {
        return miembroHogarDAO.findByHogarId(hogarId)
                .stream()
                .map(m -> new MiembroPuntosDTO(
                        m.getUsuario().getId(),
                        m.getUsuario().getNombre(),
                        m.getUsuario().getUsuario(),
                        m.getUsuario().getImagenPerfil(),
                        m.getRol(),
                        calcularPuntosMiembro(m.getUsuario().getId(), hogarId)
                ))
                .sorted(Comparator.comparingInt(MiembroPuntosDTO::puntos).reversed())
                .collect(Collectors.toList());
    }

    // Solo devuelve completadas para el panel del hogar
    public List<RegistroTarea> getUltimosRegistros(Long hogarId, int limite) {
        return registroTareaDAO
                .findByHogarIdAndEstadoOrderByFechaCompletadaDesc(hogarId, "COMPLETADA")
                .stream()
                .limit(limite)
                .collect(Collectors.toList());
    }
}