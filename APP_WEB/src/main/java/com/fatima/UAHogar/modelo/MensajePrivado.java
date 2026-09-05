package com.fatima.UAHogar.modelo;


import jakarta.persistence.*;

@Entity
@DiscriminatorValue("PRIVADO")
public class MensajePrivado extends Mensaje {

    @ManyToOne
    @JoinColumn(name = "receptor_id", nullable = true)
    private Usuario receptor;

    //Constructor vacío
    public MensajePrivado() {
        super();
    }

    // Constructor para crear mensajes privados
    public MensajePrivado(String contenido, Usuario remitente, Usuario receptor) {
        super(contenido, remitente);
        this.receptor = receptor;
    }

    // Getters y Setters
    public Usuario getReceptor() {
        return receptor;
    }

    public void setReceptor(Usuario receptor) {
        this.receptor = receptor;
    }
}