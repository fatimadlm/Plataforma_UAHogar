package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.util.ZonaHorariaApp;

import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.NotificacionDAO;
import com.fatima.UAHogar.modelo.Hogar;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.Notificacion;
import com.fatima.UAHogar.modelo.TipoNotificacion;
import com.fatima.UAHogar.modelo.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacionServicio {

    private final NotificacionDAO notificacionDAO;
    private final MiembroHogarDAO miembroHogarDAO;

    public NotificacionServicio(
            NotificacionDAO notificacionDAO,
            MiembroHogarDAO miembroHogarDAO) {
        this.notificacionDAO = notificacionDAO;
        this.miembroHogarDAO = miembroHogarDAO;
    }

    // Todas las notificaciones del usuario
    public List<Notificacion> obtenerTodas(Long usuarioId) {
        return notificacionDAO.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
    }

    // Solo las no leídas (Contador del sidebar)
    public List<Notificacion> obtenerNoLeidas(Long usuarioId) {
        return notificacionDAO.findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(usuarioId);
    }

    // Marcar una como leída
    public void marcarComoLeida(Long notificacionId, Long usuarioId) {
        Notificacion notificacion = notificacionDAO.findById(notificacionId)
                .orElseThrow(() -> new IllegalArgumentException("La notificación no existe"));

        if (notificacion.getUsuario() == null || !notificacion.getUsuario().getId().equals(usuarioId)) {
            throw new SecurityException("Esta notificación no te pertenece");
        }

        notificacion.setLeida(true);
        notificacionDAO.save(notificacion);
    }

    // Marca todas las notificaciones como leídas
    public void marcarTodasComoLeidas(Long usuarioId) {
        List<Notificacion> noLeidas = notificacionDAO.findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(usuarioId);
        noLeidas.forEach(n -> n.setLeida(true));
        notificacionDAO.saveAll(noLeidas);
    }

    // Borrar una notificación. Solo su dueño puede hacerlo
    public void borrar(Long notificacionId, Long usuarioId) {
        Notificacion notificacion = notificacionDAO.findById(notificacionId)
                .orElseThrow(() -> new IllegalArgumentException("La notificación no existe"));

        if (notificacion.getUsuario() == null || !notificacion.getUsuario().getId().equals(usuarioId)) {
            throw new SecurityException("Esta notificación no te pertenece");
        }

        notificacionDAO.deleteById(notificacionId);
    }

    // Borra todas las notificaciones del usuario
    public void borrarTodas(Long usuarioId) {
        List<Notificacion> todas = notificacionDAO.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
        notificacionDAO.deleteAll(todas);
    }
    // Crea una notificación individual
    public void crear(Usuario usuario, Hogar hogar, TipoNotificacion tipo, String titulo, String mensaje, Long referenciaId, String urlOrigen) {
        if (usuario == null) return;
        try {
            Notificacion n = new Notificacion();
            n.setUsuario(usuario);
            n.setHogar(hogar);
            n.setTipo(tipo);
            n.setTitulo(titulo);
            n.setMensaje(mensaje);
            n.setReferenciaId(referenciaId);
            n.setUrlOrigen(urlOrigen);
            n.setLeida(false);
            n.setFechaCreacion(LocalDateTime.now(ZonaHorariaApp.ZONA));
            notificacionDAO.save(n);
        } catch (Exception e) {
            // Una notificación no debe romper la operación principal
            e.printStackTrace();
        }
    }

    // Notifica a todos los miembros de un hogar
    public void notificarMiembros(Hogar hogar, TipoNotificacion tipo, String titulo, String mensaje, Long referenciaId, String urlOrigen) {
        if (hogar == null) return;
        try {
            List<MiembroHogar> miembros = miembroHogarDAO.findByHogarId(hogar.getId());
            for (MiembroHogar miembro : miembros) {
                crear(miembro.getUsuario(), hogar, tipo, titulo, mensaje, referenciaId, urlOrigen);
            }
        } catch (Exception e) {
            // Las notificaciones no deben deshacer la operación principal
            e.printStackTrace();
        }
    }

    // Notifica a todos excepto a un usuario
    public void notificarMiembrosExcepto(Hogar hogar, Long usuarioExcluirId, TipoNotificacion tipo, String titulo, String mensaje, Long referenciaId, String urlOrigen) {
        if (hogar == null) return;
        try {
            List<MiembroHogar> miembros = miembroHogarDAO.findByHogarId(hogar.getId());
            for (MiembroHogar miembro : miembros) {
                Usuario usuario = miembro.getUsuario();
                if (usuario == null) continue;
                Long usuarioId = usuario.getId();
                if (usuarioExcluirId != null && usuarioId != null && usuarioId.equals(usuarioExcluirId)) continue;
                crear(usuario, hogar, tipo, titulo, mensaje, referenciaId, urlOrigen);
            }
        } catch (Exception e) {
            // Una notificación no debe romper la operación principal
            e.printStackTrace();
        }
    }

    // Elimina las notificaciones relacionadas con una referencia
    @Transactional
    public void eliminarPorReferenciaId(Long referenciaId) {
        if (referenciaId == null) return;
        try {
            List<Notificacion> notificaciones = notificacionDAO.findByReferenciaId(referenciaId);
            if (!notificaciones.isEmpty()) {
                notificacionDAO.deleteAll(notificaciones);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}