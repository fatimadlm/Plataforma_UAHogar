package com.fatima.UAHogar.dto;


public record MiembroPuntosDTO(
        Long usuarioId,
        String nombre,
        String usuario,
        String imagenPerfil,
        String rol,
        int puntos
) {}