package com.fatima.UAHogar.dto;

import java.time.LocalDate;
import java.util.List;


public record HogarDetalleAmpliadoDTO(
        Long id,
        String nombre,
        String codigoInvitacion,
        LocalDate fechaCreacion,
        List<MiembroSupervisionDTO> miembros,
        List<PlantillaTareaSupervisionDTO> plantillas,
        List<TareaSupervisionDTO> tareasActivas
) {}
