package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.IntercambioTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IntercambioTareaDAO extends JpaRepository<IntercambioTarea, Long> {

    // Comprobamos si la tarea ya tiene una solicitud
    boolean existsByRegistroTareaIdAndEstado(Long registroTareaId, String estado);

    // Obtenemos las solicitudes recibidas por un usuario según su estado
    List<IntercambioTarea> findByDestinatarioIdAndEstadoOrderByFechaSolicitudDesc(Long destinatarioId, String estado);

    // Obtenemos todas las solicitudes enviadas por un usuario
    List<IntercambioTarea> findBySolicitanteIdOrderByFechaSolicitudDesc(Long solicitanteId);

    // Buscamos las solicitudes pendientes de un usuario en un hogar para gestionarlas si lo abandona
    @Query("SELECT i FROM IntercambioTarea i WHERE i.estado = 'PENDIENTE' " +
            "AND i.registroTarea.hogar.id = :hogarId " +
            "AND (i.solicitante.id = :usuarioId OR i.destinatario.id = :usuarioId)")
    List<IntercambioTarea> findPendientesDeUsuarioEnHogar(
            @Param("usuarioId") Long usuarioId,
            @Param("hogarId") Long hogarId);

    // Intercambios de varios registros de tarea
    List<IntercambioTarea> findByRegistroTareaIdIn(List<Long> registroTareaIds);
}