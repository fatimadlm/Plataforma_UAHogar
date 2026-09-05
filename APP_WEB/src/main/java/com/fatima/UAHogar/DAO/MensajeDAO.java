package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MensajeDAO extends JpaRepository<Mensaje, Long> {
}