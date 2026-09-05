package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.ReaccionMensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReaccionMensajeDAO extends JpaRepository<ReaccionMensaje, Long> {

    // La reacción de un usuario concreto a un mensaje concreto
    Optional<ReaccionMensaje> findByMensajeIdAndUsuarioId(Long mensajeId, Long usuarioId);

    // Todas las reacciones de un mensaje, para contar cuántas hay de cada emoji
    List<ReaccionMensaje> findByMensajeId(Long mensajeId);

    // Reacciones de varios mensajes a la vez, para no hacer una consulta por cada mensaje al listar un chat
    List<ReaccionMensaje> findByMensajeIdIn(List<Long> mensajeIds);
}