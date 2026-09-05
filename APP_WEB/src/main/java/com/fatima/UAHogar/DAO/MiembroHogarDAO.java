package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.MiembroHogar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MiembroHogarDAO extends JpaRepository<MiembroHogar, Long> {
    List<MiembroHogar> findByHogarId(Long hogarId);
    List<MiembroHogar> findByUsuarioId(Long usuarioId);
    List<MiembroHogar> findByHogarIdIn(List<Long> hogarIds);
    Optional<MiembroHogar> findByUsuarioIdAndHogarId(Long usuarioId, Long hogarId);


        // Encuentra los IDs de los hogares donde ambos usuarios son miembros
        @Query("SELECT m1.hogar.id FROM MiembroHogar m1 WHERE m1.usuario.id = :usuarioId " +
                "AND m1.hogar.id IN (SELECT m2.hogar.id FROM MiembroHogar m2 WHERE m2.usuario.id = :miId)")
        List<Long> findHogaresComunes(@Param("usuarioId") Long usuarioId, @Param("miId") Long miId);

}