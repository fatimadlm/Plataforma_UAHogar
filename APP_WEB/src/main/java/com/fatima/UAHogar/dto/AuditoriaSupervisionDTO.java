package com.fatima.UAHogar.dto;

import java.time.LocalDateTime;

public record AuditoriaSupervisionDTO(
        Long id,
        String nombreSupervisor,
        String usuarioSupervisor,
        String accion,
        String detalles,
        LocalDateTime fecha
) {}
