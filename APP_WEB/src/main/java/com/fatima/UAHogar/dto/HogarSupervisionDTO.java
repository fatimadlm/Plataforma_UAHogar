package com.fatima.UAHogar.dto;

import java.time.LocalDate;

// Datos de un hogar para el listado del Supervisor
public record HogarSupervisionDTO(
        Long id,
        String nombre,
        String codigoInvitacion,
        LocalDate fechaCreacion,
        int numMiembros,
        boolean fantasma
) {}