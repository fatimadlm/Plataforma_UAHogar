package com.fatima.UAHogar.dto;

public record PerfilAjeno(
        Long id,
        String nombre,
        String usuario,
        String imagenPerfil,
        long puntosComunes,
        long tareasComunes
){}