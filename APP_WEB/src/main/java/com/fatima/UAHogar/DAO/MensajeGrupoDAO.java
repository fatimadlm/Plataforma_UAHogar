package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.MensajeGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MensajeGrupoDAO extends JpaRepository<MensajeGrupo, Long> {
    List<MensajeGrupo> findByHogarIdOrderByFechaEnvioAsc(Long hogarId);
}