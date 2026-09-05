package com.fatima.UAHogar.DAO;


import com.fatima.UAHogar.modelo.Hogar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HogarDAO extends JpaRepository<Hogar, Long> {
    Optional<Hogar> findByCodigoInvitacion(String codigoInvitacion);
}