package com.fatima.UAHogar.dto;

import java.time.LocalDate;
import java.util.List;

public record HogarDetalleSupervisionDTO(
        Long id,
        String nombre,
        String codigoInvitacion,
        LocalDate fechaCreacion,
        List<MiembroSupervisionDTO> miembros,
        List<TareaSupervisionDTO> tareas
) {}