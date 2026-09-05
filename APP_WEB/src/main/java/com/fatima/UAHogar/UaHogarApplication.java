package com.fatima.UAHogar;

import com.fatima.UAHogar.servicio.RegistroTareaServicio;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UaHogarApplication implements ApplicationRunner {

    private final RegistroTareaServicio registroTareaServicio;

    public UaHogarApplication(RegistroTareaServicio registroTareaServicio) {
        this.registroTareaServicio = registroTareaServicio;
    }

    public static void main(String[] args) {
        SpringApplication.run(UaHogarApplication.class, args);
    }

    // Procesamos las tareas vencidas al arrancar para que los datos sean consistentes desde el inicio
    @Override
    public void run(ApplicationArguments args) {
        registroTareaServicio.procesarVencidas();
    }
}