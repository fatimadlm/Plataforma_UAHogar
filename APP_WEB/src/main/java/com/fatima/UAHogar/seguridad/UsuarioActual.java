package com.fatima.UAHogar.seguridad;

import org.springframework.security.core.context.SecurityContextHolder;

// Obtiene el usuario autenticado desde el JWT validado
public class UsuarioActual {

    private UsuarioActual() {}

    // Retorna el ID autenticado
    public static Long id() {
        var autenticacion = SecurityContextHolder.getContext().getAuthentication();

        if (autenticacion == null || !(autenticacion.getPrincipal() instanceof Long)) {
            throw new IllegalStateException("No hay un usuario autenticado en esta petición");
        }

        return (Long) autenticacion.getPrincipal();
    }
}