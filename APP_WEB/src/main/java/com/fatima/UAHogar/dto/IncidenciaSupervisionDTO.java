package com.fatima.UAHogar.dto;

import java.time.LocalDateTime;

// Datos de una incidencia para el listado del Supervisor
public record IncidenciaSupervisionDTO(
        Long id,
        String descripcion,
        String estado,
        String nombreHogar,
        String nombreTarea,
        String nombreReportante,
        String nombreResponsable,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaCierre
) {}