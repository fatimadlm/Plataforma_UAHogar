package com.fatima.UAHogar.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tareas")
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    private String tipo;

    @Column(nullable = false)
    private Integer puntos;

    private String tiempoEstimado; // Se medirá en minutos

    private String frecuencia; //Frecuencia en la que se realiza la tarea

    @Column(nullable = true)
    private LocalDate fechaInicio;

    @Column(nullable = true, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean activa = false;

    @Column(columnDefinition = "TEXT")
    private String consejoIA;

    @Column(columnDefinition = "TEXT")
    private String pasosIA;

    @Column(columnDefinition = "TEXT")
    private String productosIA;

    @Column(columnDefinition = "TEXT")
    private String precaucionesIA;

    // RELACIONES
    @ManyToOne
    @JoinColumn(name = "hogar_id", nullable = false)
    private Hogar hogar; // Hogar relacionado en la tarea

    @ManyToOne
    @JoinColumn(name = "usuario_asignado_id")
    @JsonIgnoreProperties({"tareas", "hogares", "password", "miembrosHogar"}) // evita bucles
    private Usuario usuarioAsignado;

    @Transient
    @JsonProperty("estado")
    private String estado;

    // Constructor vacío
    public Tarea() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Integer getPuntos() { return puntos; }
    public void setPuntos(Integer puntos) { this.puntos = puntos; }

    public String getTiempoEstimado() { return tiempoEstimado; }
    public void setTiempoEstimado(String tiempoEstimado) { this.tiempoEstimado = tiempoEstimado; }

    public String getFrecuencia() { return frecuencia; }
    public void setFrecuencia(String frecuencia) { this.frecuencia = frecuencia; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }

    public String getConsejoIA() { return consejoIA; }
    public void setConsejoIA(String consejoIA) { this.consejoIA = consejoIA; }

    public String getPasosIA() { return pasosIA; }
    public void setPasosIA(String pasosIA) { this.pasosIA = pasosIA; }

    public String getProductosIA() { return productosIA; }
    public void setProductosIA(String productosIA) { this.productosIA = productosIA; }

    public String getPrecaucionesIA() { return precaucionesIA; }
    public void setPrecaucionesIA(String precaucionesIA) { this.precaucionesIA = precaucionesIA; }

    public Hogar getHogar() { return hogar; }
    public void setHogar(Hogar hogar) { this.hogar = hogar; }

    public Usuario getUsuarioAsignado() { return usuarioAsignado; }
    public void setUsuarioAsignado(Usuario usuarioAsignado) { this.usuarioAsignado = usuarioAsignado; }

    public String getEstado() {
        return this.estado != null ? this.estado : "PENDIENTE";
    }
    public void setEstado(String estado) { this.estado = estado; }
}