package com.fatima.UAHogar.dto;

// Resumen de la UAHogar
public record MetricasSupervisionDTO(
        long totalUsuarios,
        long totalHogares,
        long tareasActivas,
        long incidenciasAbiertas
) {}
