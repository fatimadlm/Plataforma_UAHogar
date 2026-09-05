package com.fatima.UAHogar.DAO;
import com.fatima.UAHogar.modelo.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacionDAO extends JpaRepository<Notificacion, Long> {

    // Todas las notificaciones de un usuario
    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(
            Long usuarioId);

    // Notificaciones no leídas de un usuario
    List<Notificacion> findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(
            Long usuarioId);

    // Notificaciones relacionadas con una referencia concreta
    List<Notificacion> findByReferenciaId(
            Long referenciaId);

    // Comprueba si ya existe una notificación concreta
    boolean existsByUsuarioIdAndTipoAndReferenciaId(
            Long usuarioId,
            com.fatima.UAHogar.modelo.TipoNotificacion tipo,
            Long referenciaId);

    // Busca una notificación concreta
    List<Notificacion> findByUsuarioIdAndTipoAndReferenciaId(
            Long usuarioId,
            com.fatima.UAHogar.modelo.TipoNotificacion tipo,
            Long referenciaId);

    // Notificaciones relacionadas con un hogar
    List<Notificacion> findByHogarId(Long hogarId);
}