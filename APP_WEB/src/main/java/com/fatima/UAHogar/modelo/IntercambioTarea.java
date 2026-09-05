package com.fatima.UAHogar.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "intercambios_tarea")
public class IntercambioTarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Instancia de tarea que queremos intercambiar
    @ManyToOne
    @JoinColumn(name = "registro_tarea_id", nullable = false)
    private RegistroTarea registroTarea;

    // Miembro que solicita el intercambio
    @ManyToOne
    @JoinColumn(name = "solicitante_id", nullable = false)
    private Usuario solicitante;

    // Miembro que recibe la propuesta
    @ManyToOne
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario;

    // PENDIENTE, ACEPTADA, RECHAZADA o CADUCADA
    @Column(nullable = false)
    private String estado = "PENDIENTE";

    @Column(nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(nullable = true)
    private LocalDateTime fechaRespuesta;

    public IntercambioTarea() {}

    // Inicializamos una nueva solicitud en estado pendiente
    public IntercambioTarea(RegistroTarea registroTarea, Usuario solicitante, Usuario destinatario) {
        this.registroTarea = registroTarea;
        this.solicitante = solicitante;
        this.destinatario = destinatario;
        this.estado = "PENDIENTE";
        this.fechaSolicitud = LocalDateTime.now();
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RegistroTarea getRegistroTarea() { return registroTarea; }
    public void setRegistroTarea(RegistroTarea registroTarea) { this.registroTarea = registroTarea; }

    public Usuario getSolicitante() { return solicitante; }
    public void setSolicitante(Usuario solicitante) { this.solicitante = solicitante; }

    public Usuario getDestinatario() { return destinatario; }
    public void setDestinatario(Usuario destinatario) { this.destinatario = destinatario; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public LocalDateTime getFechaRespuesta() { return fechaRespuesta; }
    public void setFechaRespuesta(LocalDateTime fechaRespuesta) { this.fechaRespuesta = fechaRespuesta; }
}