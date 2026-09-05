package com.fatima.UAHogar.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "miembros_hogar")

//Esta clase lo que hara es unir nuestro usuario y su hogar con el contador y rol que tiene en este Hogar
public class MiembroHogar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Usuario implicado
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    //Hogar en el que esta este usuario
    @ManyToOne
    @JoinColumn(name = "hogar_id", nullable = false)
    private Hogar hogar;

    // ROL: Puede ser ADMIN o miembro
    @Column(nullable = false)
    private String rol;

    // Constructor vacío
    public MiembroHogar() {}

    // Constructor para añadir a alguien a una casa
    public MiembroHogar(Usuario usuario, Hogar hogar, String rol) {
        this.usuario = usuario;
        this.hogar = hogar;
        this.rol = rol;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Hogar getHogar() { return hogar; }
    public void setHogar(Hogar hogar) { this.hogar = hogar; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}