package com.fatima.UAHogar.cfg;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("desarrollo")
public class GeneradorContrasenas implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;

    public GeneradorContrasenas(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
//Por si en un futuro es necesario generar el hash
    @Override
    public void run(String... args) {
       // System.out.println("Fatima: " + passwordEncoder.encode("Contraseña"));

    }
}