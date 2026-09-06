package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.util.ZonaHorariaApp;

import com.fatima.UAHogar.DAO.HogarDAO;
import com.fatima.UAHogar.DAO.MensajeDAO;
import com.fatima.UAHogar.DAO.MensajeGrupoDAO;
import com.fatima.UAHogar.DAO.MensajePrivadoDAO;
import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.ReaccionMensajeDAO;
import com.fatima.UAHogar.DAO.UsuarioDAO;
import com.fatima.UAHogar.modelo.Hogar;
import com.fatima.UAHogar.modelo.Mensaje;
import com.fatima.UAHogar.modelo.MensajeGrupo;
import com.fatima.UAHogar.modelo.MensajePrivado;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.ReaccionMensaje;
import com.fatima.UAHogar.modelo.TipoNotificacion;
import com.fatima.UAHogar.modelo.TipoReaccion;
import com.fatima.UAHogar.modelo.Usuario;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MensajeServicio {

    private final MensajeDAO mensajeDAO;
    private final MensajeGrupoDAO mensajeGrupoDAO;
    private final MensajePrivadoDAO mensajePrivadoDAO;
    private final UsuarioDAO usuarioDAO;
    private final HogarDAO hogarDAO;
    private final MiembroHogarDAO miembroHogarDAO;
    private final NotificacionServicio notificacionServicio;
    private final ReaccionMensajeDAO reaccionMensajeDAO;

    public MensajeServicio(
            MensajeDAO mensajeDAO,
            MensajeGrupoDAO mensajeGrupoDAO,
            MensajePrivadoDAO mensajePrivadoDAO,
            UsuarioDAO usuarioDAO,
            HogarDAO hogarDAO,
            MiembroHogarDAO miembroHogarDAO,
            NotificacionServicio notificacionServicio,
            ReaccionMensajeDAO reaccionMensajeDAO) {
        this.mensajeDAO = mensajeDAO;
        this.mensajeGrupoDAO = mensajeGrupoDAO;
        this.mensajePrivadoDAO = mensajePrivadoDAO;
        this.usuarioDAO = usuarioDAO;
        this.hogarDAO = hogarDAO;
        this.miembroHogarDAO = miembroHogarDAO;
        this.notificacionServicio = notificacionServicio;
        this.reaccionMensajeDAO = reaccionMensajeDAO;
    }

    //Grupo

    public List<MensajeGrupo> getMensajesGrupo(Long hogarId) {
        return mensajeGrupoDAO.findByHogarIdOrderByFechaEnvioAsc(hogarId)
                .stream()
                .filter(m -> !m.esEliminado())
                .toList();
    }

    // Envía un mensaje al grupo
    public MensajeGrupo enviarMensajeGrupo(Long hogarId, Long remitenteId, String contenido) {
        Usuario remitente = usuarioDAO.findById(remitenteId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Hogar hogar = hogarDAO.findById(hogarId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));

        MensajeGrupo msg = new MensajeGrupo(contenido, remitente, hogar);
        msg = mensajeGrupoDAO.save(msg);

        // Notificamos a los demás miembros
        List<MiembroHogar> miembros = miembroHogarDAO.findByHogarId(hogarId);
        for (MiembroHogar miembro : miembros) {
            Usuario receptor = miembro.getUsuario();
            if (receptor == null || receptor.getId() == null) {
                continue;
            }
            if (receptor.getId().equals(remitenteId)) {
                continue;
            }
            try {
                notificacionServicio.crear(
                        receptor,
                        hogar,
                        TipoNotificacion.MENSAJE_NUEVO,
                        "Nuevo mensaje",
                        remitente.getNombre() + " ha enviado un mensaje en el chat del hogar.",
                        msg.getId(),
                        "/chat"
                );
            } catch (Exception e) {
                e.printStackTrace();}   }
        return msg;
    }
    // Privado
    public List<MensajePrivado> getMensajesPrivados(Long usuarioId, Long otroId) {
        return mensajePrivadoDAO
                .findByRemitenteIdAndReceptorIdOrRemitenteIdAndReceptorIdOrderByFechaEnvioAsc(
                        usuarioId, otroId, otroId, usuarioId)
                .stream()
                .filter(m -> !m.esEliminado())
                .toList();
    }

    // Envía un mensaje privado
    public MensajePrivado enviarMensajePrivado(Long remitenteId, Long receptorId, String contenido) {
        Usuario remitente = usuarioDAO.findById(remitenteId)
                .orElseThrow(() -> new IllegalArgumentException("Remitente no encontrado"));

        Usuario receptor = usuarioDAO.findById(receptorId)
                .orElseThrow(() -> new IllegalArgumentException("Receptor no encontrado"));

        MensajePrivado msg = new MensajePrivado(contenido, remitente, receptor);
        msg = mensajePrivadoDAO.save(msg);

        // Notificamos al receptor
        try {
            notificacionServicio.crear(
                    receptor,
                    null,
                    TipoNotificacion.MENSAJE_NUEVO,
                    "Nuevo mensaje",
                    remitente.getNombre() + " te ha enviado un mensaje.",
                    msg.getId(),
                    "/mensajes"
            );
        } catch (Exception e) {
            // Una notificación no debe romper el envío del mensaje
            e.printStackTrace();
        }

        return msg;
    }

    // Edita un mensaje
    public Mensaje editarMensaje(Long mensajeId, Long remitenteId, String nuevoContenido) {
        Mensaje msg = mensajeDAO.findById(mensajeId)
                .orElseThrow(() -> new IllegalArgumentException("Mensaje no encontrado"));

        if (!msg.getRemitente().getId().equals(remitenteId)) {
            throw new SecurityException("No puedes editar un mensaje de otro usuario");
        }

        if (nuevoContenido == null || nuevoContenido.trim().isEmpty()) {
            throw new IllegalArgumentException("El contenido no puede estar vacío");
        }

        if (msg.esEliminado()) {
            throw new IllegalArgumentException("No puedes editar un mensaje eliminado");
        }

        // Guardamos el contenido original solo la primera vez que se edita
        if (msg.getContenidoOriginal() == null) {
            msg.setContenidoOriginal(msg.getContenido());
        }

        msg.setContenido(nuevoContenido.trim());
        msg.setEditadoEn(LocalDateTime.now(ZonaHorariaApp.ZONA));

        return mensajeDAO.save(msg);
    }

    // Borra un mensaje
    public void borrarMensaje(Long mensajeId, Long remitenteId) {
        Mensaje msg = mensajeDAO.findById(mensajeId)
                .orElseThrow(() -> new IllegalArgumentException("Mensaje no encontrado"));

        if (!msg.getRemitente().getId().equals(remitenteId)) {
            throw new SecurityException("No puedes borrar un mensaje de otro usuario");
        }

        msg.setEliminado(true);
        msg.setEliminadoEn(LocalDateTime.now(ZonaHorariaApp.ZONA));

        mensajeDAO.save(msg);
    }

    //Reacciones
    public void alternarReaccion(Long mensajeId, Long usuarioId, String tipoReaccion) {
        if (tipoReaccion == null || tipoReaccion.isBlank()) {
            throw new IllegalArgumentException("Falta el tipo de reaccion");
        }

        // Comprobamos que el tipo sea uno de los que existen
        try {
            TipoReaccion.valueOf(tipoReaccion);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo de reaccion no valido: " + tipoReaccion);
        }

        Mensaje mensaje = mensajeDAO.findById(mensajeId)
                .orElseThrow(() -> new IllegalArgumentException("Mensaje no encontrado"));
        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Optional<ReaccionMensaje> existente = reaccionMensajeDAO.findByMensajeIdAndUsuarioId(mensajeId, usuarioId);
        if (existente.isPresent()) {
            if (existente.get().getTipo().equals(tipoReaccion)) {
                reaccionMensajeDAO.delete(existente.get()); // mismo emoji otra vez -> se quita
            } else {
                existente.get().setTipo(tipoReaccion); //emoji distinto -> se cambia
                reaccionMensajeDAO.save(existente.get());
            }
        } else {
            reaccionMensajeDAO.save(new ReaccionMensaje(mensaje, usuario, tipoReaccion));
        }
    }

    // Resumen de reacciones de un mensaje
    public Map<String, Object> obtenerReacciones(Long mensajeId, Long usuarioId) {
        List<ReaccionMensaje> reacciones = reaccionMensajeDAO.findByMensajeId(mensajeId);
        return construirResumenReacciones(reacciones, usuarioId);
    }
    public Map<Long, Map<String, Object>> obtenerReaccionesPorMensajes(List<Long> mensajeIds, Long usuarioId) {
        Map<Long, List<ReaccionMensaje>> agrupadas = reaccionMensajeDAO.findByMensajeIdIn(mensajeIds).stream()
                .collect(Collectors.groupingBy(r -> r.getMensaje().getId()));

        Map<Long, Map<String, Object>> resultado = new LinkedHashMap<>();
        for (Long id : mensajeIds) {
            resultado.put(id, construirResumenReacciones(agrupadas.getOrDefault(id, List.of()), usuarioId));
        }
        return resultado;
    }

    private Map<String, Object> construirResumenReacciones(List<ReaccionMensaje> reacciones, Long usuarioId) {
        Map<String, Integer> conteos = new LinkedHashMap<>();
        String miReaccion = null;

        for (ReaccionMensaje r : reacciones) {
            conteos.merge(r.getTipo(), 1, Integer::sum);
            if (r.getUsuario().getId().equals(usuarioId)) {
                miReaccion = r.getTipo();
            }
        }

        Map<String, Object> resumen = new LinkedHashMap<>();
        resumen.put("conteos", conteos);
        resumen.put("miReaccion", miReaccion);
        return resumen;
    }
}