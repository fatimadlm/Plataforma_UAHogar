package com.fatima.UAHogar.modelo;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "hogares")
public class Hogar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 75)
    private String nombre;

    @Column(unique = true, nullable = false)
    private String codigoInvitacion;

    @Column(nullable = false)
    private String aparienciaId = "azul-noche";

    // Fecha en la que se creo el hogar
    @Column(nullable = true)
    private LocalDate fechaCreacion;

    @JsonIgnore
    @OneToMany(mappedBy = "hogar", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MiembroHogar> miembros = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "hogar", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tarea> tareas = new ArrayList<>();

    public Hogar() {}

    public Hogar(String nombre) {
        this.nombre = nombre;
        this.codigoInvitacion = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.fechaCreacion = LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCodigoInvitacion() { return codigoInvitacion; }
    public void setCodigoInvitacion(String codigoInvitacion) { this.codigoInvitacion = codigoInvitacion; }

    public String getAparienciaId() { return aparienciaId; }
    public void setAparienciaId(String aparienciaId) { this.aparienciaId = aparienciaId; }

    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDate fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public List<MiembroHogar> getMiembros() { return miembros; }
    public void setMiembros(List<MiembroHogar> miembros) { this.miembros = miembros; }

    public List<Tarea> getTareas() { return tareas; }
    public void setTareas(List<Tarea> tareas) { this.tareas = tareas; }
}