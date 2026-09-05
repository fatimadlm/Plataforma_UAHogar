package com.fatima.UAHogar.DAO;

import com.fatima.UAHogar.modelo.MensajePrivado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MensajePrivadoDAO extends JpaRepository<MensajePrivado, Long> {

    List<MensajePrivado> findByRemitenteIdAndReceptorIdOrRemitenteIdAndReceptorIdOrderByFechaEnvioAsc(
            Long remitente1, Long receptor1, Long remitente2, Long receptor2
    );
}