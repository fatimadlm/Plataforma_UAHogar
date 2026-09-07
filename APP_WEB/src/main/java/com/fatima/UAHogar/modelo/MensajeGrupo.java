package com.fatima.UAHogar.modelo;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
@DiscriminatorValue("GRUPO")
public class MensajeGrupo extends Mensaje {

    @ManyToOne
    @JoinColumn(name = "hogar_id", nullable = true)
    private Hogar hogar;

    // Constructor vacío
    public MensajeGrupo() {
        super();
    }

    // Constructor para crear mensajes de grupo
    public MensajeGrupo(String contenido, Usuario remitente, Hogar hogar) {
        super(contenido, remitente);
        this.hogar = hogar;
    }

    // Getter y Setter
    public Hogar getHogar() {
        return hogar;
    }

    public void setHogar(Hogar hogar) {
        this.hogar = hogar;
    }
}