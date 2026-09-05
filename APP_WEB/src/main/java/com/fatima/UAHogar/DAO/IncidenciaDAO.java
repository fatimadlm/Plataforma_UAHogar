package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidenciaDAO extends JpaRepository<Incidencia, Long> {

    // Incidencias de una tarea
    List<Incidencia> findByRegistroTareaId(Long registroTareaId);

    // Ya tiene una incidencia en ese estado
    boolean existsByRegistroTareaIdAndEstado(Long registroTareaId, String estado);

    // Incidencias reportadas por un usuario
    List<Incidencia> findByReportanteIdOrderByFechaCreacionDesc(Long reportanteId);

    // Incidencias sobre tareas que hizo un usuario
    List<Incidencia> findByResponsableIdOrderByFechaCreacionDesc(Long responsableId);

    // Incidencias de un hogar, para el admin
    @Query("SELECT i FROM Incidencia i WHERE i.registroTarea.hogar.id = :hogarId ORDER BY i.fechaCreacion DESC")
    List<Incidencia> findByHogarId(@Param("hogarId") Long hogarId);

    // Cuenta incidencias por estado
    long countByEstado(String estado);
}