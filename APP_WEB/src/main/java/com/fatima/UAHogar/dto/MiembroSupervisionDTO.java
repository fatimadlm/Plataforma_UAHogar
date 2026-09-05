package com.fatima.UAHogar.dto;

public record MiembroSupervisionDTO(
        Long usuarioId,
        String nombre,
        String usuario,
        String imagenPerfil,
        String rol,
        int puntos
) {}