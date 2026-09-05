package com.fatima.UAHogar.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_supervisor")
public class AuditoriaSupervisor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quien ejecuto la accion
    @ManyToOne
    @JoinColumn(name = "supervisor_id", nullable = false)
    private Usuario supervisor;

    // Tipo de accion
    @Column(nullable = false)
    private String accion;

    // Descripcion de la acción
    @Column(nullable = false, length = 500)
    private String detalles;

    @Column(nullable = false)
    private LocalDateTime fecha;

    public AuditoriaSupervisor() {}

    public AuditoriaSupervisor(Usuario supervisor, String accion, String detalles) {
        this.supervisor = supervisor;
        this.accion = accion;
        this.detalles = detalles;
        this.fecha = LocalDateTime.now();
    }
//GETEERS Y SETTERS
    public Long getId() { return id; }

    public Usuario getSupervisor() { return supervisor; }
    public void setSupervisor(Usuario supervisor) { this.supervisor = supervisor; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public String getDetalles() { return detalles; }
    public void setDetalles(String detalles) { this.detalles = detalles; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
}
