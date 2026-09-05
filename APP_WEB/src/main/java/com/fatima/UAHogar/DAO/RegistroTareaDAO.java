package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.RegistroTarea;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RegistroTareaDAO extends JpaRepository<RegistroTarea, Long> {

    // Solo devuelve completadas para no mezclar con pendientes
    List<RegistroTarea> findByHogarIdAndEstadoOrderByFechaCompletadaDesc(Long hogarId, String estado);

    // Todas las instancias de un hogar ordenadas por fecha limite para el bloque de tareas activas
    List<RegistroTarea> findByHogarIdOrderByFechaLimiteAsc(Long hogarId);

    // Historial de un usuario concreto
    List<RegistroTarea> findByUsuarioIdOrderByFechaCompletadaDesc(Long usuarioId);

    // Comprueba si hay instancia pendiente para una plantilla en un hogar
    boolean existsByTareaIdAndHogarIdAndEstado(Long tareaId, Long hogarId, String estado);

    // Todos los registros de una plantilla sin importar el estado para poder borrarlos todos al eliminar
    List<RegistroTarea> findByTareaId(Long tareaId);

    // Instancias de una plantilla con un estado concreto
    List<RegistroTarea> findByTareaIdAndEstado(Long tareaId, String estado);

    // Suma puntos de completadas en un mes concreto para un hogar
    @Query("SELECT COALESCE(SUM(r.puntosSumados), 0) FROM RegistroTarea r " +
            "WHERE r.usuario.id = :usuarioId AND r.hogar.id = :hogarId " +
            "AND r.estado = 'COMPLETADA' " +
            "AND r.fechaCompletada >= :inicioMes AND r.fechaCompletada <= :finMes")
    Integer sumarPuntosPorMes(
            @Param("usuarioId") Long usuarioId,
            @Param("hogarId") Long hogarId,
            @Param("inicioMes") LocalDateTime inicioMes,
            @Param("finMes") LocalDateTime finMes);

    // Suma puntos de completadas en un mes sin importar el hogar
    @Query("SELECT COALESCE(SUM(r.puntosSumados), 0) FROM RegistroTarea r " +
            "WHERE r.usuario.id = :usuarioId " +
            "AND r.estado = 'COMPLETADA' " +
            "AND r.fechaCompletada >= :inicioMes AND r.fechaCompletada <= :finMes")
    Integer sumarPuntosTotalesPorMes(
            @Param("usuarioId") Long usuarioId,
            @Param("inicioMes") LocalDateTime inicioMes,
            @Param("finMes") LocalDateTime finMes);

    // Solo cuenta completadas
    @Query("SELECT COUNT(r) FROM RegistroTarea r WHERE r.usuario.id = :usuarioId AND r.estado = 'COMPLETADA'")
    Integer contarTareasCompletadasTotales(@Param("usuarioId") Long usuarioId);

    // Cuenta completadas del usuario en una lista de hogares
    @Query("SELECT COUNT(rt) FROM RegistroTarea rt WHERE rt.usuario.id = :uId AND rt.hogar.id IN :hIds AND rt.estado = 'COMPLETADA'")
    long countByUsuarioIdAndHogarIdIn(@Param("uId") Long uId, @Param("hIds") List<Long> hIds);

    // Suma puntos del usuario en una lista de hogares
    @Query("SELECT COALESCE(SUM(rt.puntosSumados), 0) FROM RegistroTarea rt WHERE rt.usuario.id = :uId AND rt.hogar.id IN :hIds AND rt.estado = 'COMPLETADA'")
    Long sumPuntosByUsuarioIdAndHogarIdIn(@Param("uId") Long uId, @Param("hIds") List<Long> hIds);

    // Tareas completadas en hogares comunes entre dos usuarios
    @Query("SELECT rt FROM RegistroTarea rt WHERE rt.hogar.id IN " +
            "(SELECT mh.hogar.id FROM MiembroHogar mh WHERE mh.usuario.id = :usuarioId) " +
            "AND rt.hogar.id IN (SELECT mh2.hogar.id FROM MiembroHogar mh2 WHERE mh2.usuario.id = :miId) " +
            "AND rt.estado = 'COMPLETADA' " +
            "ORDER BY rt.fechaCompletada DESC")
    List<RegistroTarea> findTareasComunes(
            @Param("usuarioId") Long usuarioId,
            @Param("miId") Long miId,
            PageRequest pageable);

    // Instancias pendientes de un usuario en un hogar
    List<RegistroTarea> findByUsuarioAsignadoIdAndHogarIdAndEstado(
            Long usuarioId, Long hogarId, String estado);

    // Instancias pendientes de un usuario ordenadas por urgencia
    List<RegistroTarea> findByUsuarioAsignadoIdAndEstadoOrderByFechaLimiteAsc(
            Long usuarioId, String estado);

    // Instancias sin asignar de un hogar que están en la bolsa
    List<RegistroTarea> findByHogarIdAndUsuarioAsignadoIsNullAndEstado(
            Long hogarId, String estado);

    // Instancias de un hogar con un estado concreto, para recalcular la carga
    List<RegistroTarea> findByHogarIdAndEstado(Long hogarId, String estado);

    // puntos de tarea  pendientes/vencidas ya asignadas a un usuario en un hogar
    @Query("SELECT COALESCE(SUM(r.tarea.puntos), 0) FROM RegistroTarea r " +
            "WHERE r.usuarioAsignado.id = :usuarioId AND r.hogar.id = :hogarId " +
            "AND r.estado IN ('PENDIENTE', 'VENCIDA')")
    Integer sumarCargaPendienteAsignada(@Param("usuarioId") Long usuarioId, @Param("hogarId") Long hogarId);

    // puntos tarea completada por un usuario en un hogar dentro de un periodo
    @Query("SELECT COALESCE(SUM(r.tarea.puntos), 0) FROM RegistroTarea r " +
            "WHERE r.usuario.id = :usuarioId AND r.hogar.id = :hogarId AND r.estado = 'COMPLETADA' " +
            "AND r.fechaCompletada >= :inicio AND r.fechaCompletada <= :fin")
    Integer sumarCargaCompletadaEnPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("hogarId") Long hogarId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    // Carga total planificada de un hogar en un periodo: suma de puntos de las tareas cuya fecha limite cae dentro
    @Query("SELECT COALESCE(SUM(r.tarea.puntos), 0) FROM RegistroTarea r " +
            "WHERE r.hogar.id = :hogarId AND r.fechaLimite >= :inicio AND r.fechaLimite <= :fin")
    Integer sumarCargaPlanificadaHogarEnPeriodo(
            @Param("hogarId") Long hogarId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    // Instancias pendientes que ya superaron su fecha limite
    List<RegistroTarea> findByEstadoAndFechaLimiteBefore(
            String estado, LocalDateTime ahora);
    //Para urgencia
    List<RegistroTarea> findByEstadoAndFechaLimiteBetween(
            String estado,
            LocalDateTime inicio,
            LocalDateTime fin);

    // Ultima instancia completada de una plantilla
    @Query("SELECT r FROM RegistroTarea r WHERE r.tarea.id = :tareaId " +
            "AND r.estado = 'COMPLETADA' ORDER BY r.fechaCompletada DESC")
    List<RegistroTarea> findUltimaCompletadaPorTarea(@Param("tareaId") Long tareaId);

    // Cuenta las tareas activas
    long countByEstadoIn(List<String> estados);

    // Puntos por tareas completadas por el usuario en un hogar
    @Query("SELECT COALESCE(SUM(r.puntosSumados), 0) FROM RegistroTarea r " +
            "WHERE r.usuario.id = :usuarioId AND r.hogar.id = :hogarId AND r.estado = 'COMPLETADA'")
    Integer sumarPuntosCompletadosTotales(@Param("usuarioId") Long usuarioId, @Param("hogarId") Long hogarId);

    // Penalizaciones por tareas vencidas asignadas al usuario en un hogar
    @Query("SELECT COALESCE(SUM(r.penalizacion), 0) FROM RegistroTarea r " +
            "WHERE r.usuarioAsignado.id = :usuarioId AND r.hogar.id = :hogarId AND r.estado = 'VENCIDA'")
    Integer sumarPenalizacionVencidasTotales(@Param("usuarioId") Long usuarioId, @Param("hogarId") Long hogarId);
}