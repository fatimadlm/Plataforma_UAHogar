package com.fatima.UAHogar.modelo;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String usuario; // username

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false)
    // Evitamos que se escriba en respuesta JSON
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String imagenPerfil;

    // Rol global del usuario  "USER" o "SUPERVISOR"
    @Column(nullable = false)
    private String rolGlobal = "USER";

    @Column(nullable = false)
    private boolean bloqueado = false;

    // Constructor vacío
    public Usuario() {
    }

    // Constructor completo
    public Usuario(String usuario, String email, String nombre, String telefono, String password, String imagenPerfil) {
        this.usuario = usuario;
        this.email = email;
        this.nombre = nombre;
        this.telefono = telefono;
        this.password = password;
        this.imagenPerfil = imagenPerfil;
    }

    // Getters y Setters

    public Long getId() {
        return id;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getImagenPerfil() {
        return imagenPerfil;
    }

    public void setImagenPerfil(String imagenPerfil) {
        this.imagenPerfil = imagenPerfil;
    }

    public String getRolGlobal() {
        return rolGlobal;
    }

    public void setRolGlobal(String rolGlobal) {
        this.rolGlobal = rolGlobal;
    }

    public boolean isBloqueado() {
        return bloqueado;
    }

    public void setBloqueado(boolean bloqueado) {
        this.bloqueado = bloqueado;
    }
}
