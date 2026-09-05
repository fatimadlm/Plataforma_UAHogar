package com.fatima.UAHogar.cfg;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    // Errores de validacion 400
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> manejarIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    // Usuario no autenticado 401
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> manejarIllegalState(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }

    // Acceso denegado 403
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<String> manejarSecurity(SecurityException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    }

    // Fallo en integridad de datos 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> manejarDataIntegrityViolation(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Los datos introducidos ya están en uso.");
    }

    // Errores 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> manejarError(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error inesperado en el servidor.");
    }
}
