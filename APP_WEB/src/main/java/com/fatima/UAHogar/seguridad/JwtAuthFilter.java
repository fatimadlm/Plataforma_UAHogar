package com.fatima.UAHogar.seguridad;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// lee cada petición para autenticar al usuario si incluye un token
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtServicio jwtServicio;

    public JwtAuthFilter(JwtServicio jwtServicio) {
        this.jwtServicio = jwtServicio;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String cabecera = request.getHeader("Authorization");

        if (cabecera != null && cabecera.startsWith("Bearer ")) {
            String token = cabecera.substring(7);
            try {
                Long usuarioId = jwtServicio.validarYObtenerUsuarioId(token);

                // Asignamos el rol como autoridad para el  acceso
                String rolGlobal = jwtServicio.validarYObtenerRolGlobal(token);
                List<GrantedAuthority> autoridades = List.of(new SimpleGrantedAuthority("ROLE_" + rolGlobal));

                // Guardamos la autenticación en el contexto de seguridad
                UsernamePasswordAuthenticationToken autenticacion =
                        new UsernamePasswordAuthenticationToken(usuarioId, null, autoridades);
                SecurityContextHolder.getContext().setAuthentication(autenticacion);

            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}