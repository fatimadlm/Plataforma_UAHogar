package com.fatima.UAHogar.modelo;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidencias")
public class Incidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tarea completada reportada
    @ManyToOne
    @JoinColumn(name = "registro_tarea_id", nullable = false)
    private RegistroTarea registroTarea;

    // Quien reporta
    @ManyToOne
    @JoinColumn(name = "reportante_id", nullable = false)
    private Usuario reportante;

    // Quien hizo la tarea
    @ManyToOne
    @JoinColumn(name = "responsable_id", nullable = false)
    private Usuario responsable;

    @Column(nullable = false, length = 500)
    private String descripcion;

    // OPEN o CLOSED
    @Column(nullable = false)
    private String estado = "OPEN";

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = true)
    private LocalDateTime fechaCierre;

    // Admin que cerro la incidencia
    @ManyToOne
    @JoinColumn(name = "cerrada_por_id", nullable = true)
    private Usuario cerradaPor;

    //Constructor vacío
    public Incidencia() {}

    // Constructor para reportar
    public Incidencia(RegistroTarea registroTarea, Usuario reportante, String descripcion) {
        this.registroTarea = registroTarea;
        this.reportante = reportante;
        this.responsable = registroTarea.getUsuario();
        this.descripcion = descripcion;
        this.estado = "OPEN";
        this.fechaCreacion = LocalDateTime.now();
    }

    //Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RegistroTarea getRegistroTarea() { return registroTarea; }
    public void setRegistroTarea(RegistroTarea registroTarea) { this.registroTarea = registroTarea; }

    public Usuario getReportante() { return reportante; }
    public void setReportante(Usuario reportante) { this.reportante = reportante; }

    public Usuario getResponsable() { return responsable; }
    public void setResponsable(Usuario responsable) { this.responsable = responsable; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }

    public Usuario getCerradaPor() { return cerradaPor; }
    public void setCerradaPor(Usuario cerradaPor) { this.cerradaPor = cerradaPor; }
}