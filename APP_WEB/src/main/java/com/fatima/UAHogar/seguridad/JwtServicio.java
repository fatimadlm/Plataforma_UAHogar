package com.fatima.UAHogar.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// Genera y valida tokens JWT
@Component
public class JwtServicio {

    @Value("${app.jwt.secret}")
    private String secreto;

    @Value("${app.jwt.expiracion-horas:24}")
    private long expiracionHoras;

    private SecretKey clave() {
        return Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
    }

    // Genera un token con los datos del usuario y su rol
    public String generarToken(Long usuarioId, String username, String rolGlobal) {
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + expiracionHoras * 3600_000);

        return Jwts.builder()
                .subject(String.valueOf(usuarioId))
                .claim("username", username)
                .claim("rolGlobal", rolGlobal)
                .issuedAt(ahora)
                .expiration(expira)
                .signWith(clave())
                .compact();
    }

    // Obtiene el ID del usuario tras validar el token
    public Long validarYObtenerUsuarioId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(clave())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject());
    }

    // Obtiene el rol del usuario (por defecto USER si no existe)
    public String validarYObtenerRolGlobal(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(clave())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String rol = claims.get("rolGlobal", String.class);
        return rol != null ? rol : "USER";
    }
}