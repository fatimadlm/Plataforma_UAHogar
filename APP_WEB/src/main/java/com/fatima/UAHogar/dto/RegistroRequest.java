package com.fatima.UAHogar.dto;


public record RegistroRequest(
        String nombre,
        String usuario,
        String email,
        String telefono,
        String password,
        String imagenPerfil
) {}