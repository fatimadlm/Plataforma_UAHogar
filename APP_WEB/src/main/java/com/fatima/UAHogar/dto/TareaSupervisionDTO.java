package com.fatima.UAHogar.dto;

import java.time.LocalDateTime;

// Datos de una  tarea
public record TareaSupervisionDTO(
        Long id,
        String nombreTarea,
        String tipo,
        String estado,
        String nombreHogar,
        Long usuarioAsignadoId,
        String nombreAsignado,
        Integer puntos,
        LocalDateTime fechaLimite
) {}