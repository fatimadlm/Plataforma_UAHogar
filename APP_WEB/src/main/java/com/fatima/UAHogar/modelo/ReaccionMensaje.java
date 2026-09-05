package com.fatima.UAHogar.modelo;

import jakarta.persistence.*;

// Guarda la reacción
@Entity
@Table(name = "reacciones_mensaje", uniqueConstraints = @UniqueConstraint(columnNames = {"mensaje_id", "usuario_id"}))
public class ReaccionMensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mensaje_id", nullable = false)
    private Mensaje mensaje;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 20)
    private String tipo;

    public ReaccionMensaje() {
    }

    public ReaccionMensaje(Mensaje mensaje, Usuario usuario, String tipo) {
        this.mensaje = mensaje;
        this.usuario = usuario;
        this.tipo = tipo;
    }

    // Getters y Setters
    public Long getId() { return id; }

    public Mensaje getMensaje() { return mensaje; }
    public void setMensaje(Mensaje mensaje) { this.mensaje = mensaje; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
}