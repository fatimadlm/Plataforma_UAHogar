package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TareaDAO extends JpaRepository<Tarea, Long> {

    List<Tarea> findByHogarId(Long hogarId);
    List<Tarea> findByUsuarioAsignadoId(Long usuarioId);

    // Obtenemos las plantillas activas de un usuario
    @Query("SELECT t FROM Tarea t WHERE t.usuarioAsignado.id = :usuarioId AND t.activa = true")
    List<Tarea> obtenerTareasPorUsuario(@Param("usuarioId") Long usuarioId);

    // Buscamos plantillas inactivas cuya fecha de inicio ya llegó para activarlas
    List<Tarea> findByActivaFalseAndFechaInicioLessThanEqual(LocalDate fecha);
}