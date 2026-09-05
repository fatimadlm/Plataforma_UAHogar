package com.fatima.UAHogar.dto;

import com.fatima.UAHogar.modelo.IntercambioTarea;
import com.fatima.UAHogar.modelo.RegistroTarea;
import java.time.LocalDateTime;

public class IntercambioTareaDTO {

    private Long id;

    private Long registroTareaId;
    private String nombreTarea;
    private Integer puntos;
    private LocalDateTime fechaLimite;

    private Long hogarId;
    private String nombreHogar;

    private Long solicitanteId;
    private String nombreSolicitante;

    private Long destinatarioId;
    private String nombreDestinatario;

    private String estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaRespuesta;

    public IntercambioTareaDTO(IntercambioTarea i) {
        RegistroTarea registro = i.getRegistroTarea();

        this.id = i.getId();

        this.registroTareaId = registro != null ? registro.getId() : null;
        this.nombreTarea = registro != null && registro.getTarea() != null ? registro.getTarea().getNombre() : "";
        this.puntos = registro != null && registro.getTarea() != null ? registro.getTarea().getPuntos() : null;
        this.fechaLimite = registro != null ? registro.getFechaLimite() : null;

        this.hogarId = registro != null && registro.getHogar() != null ? registro.getHogar().getId() : null;
        this.nombreHogar = registro != null && registro.getHogar() != null ? registro.getHogar().getNombre() : "";

        this.solicitanteId = i.getSolicitante() != null ? i.getSolicitante().getId() : null;
        this.nombreSolicitante = i.getSolicitante() != null ? i.getSolicitante().getNombre() : "";

        this.destinatarioId = i.getDestinatario() != null ? i.getDestinatario().getId() : null;
        this.nombreDestinatario = i.getDestinatario() != null ? i.getDestinatario().getNombre() : "";

        this.estado = i.getEstado();
        this.fechaSolicitud = i.getFechaSolicitud();
        this.fechaRespuesta = i.getFechaRespuesta();
    }

    // Getters
    public Long getId() { return id; }
    public Long getRegistroTareaId() { return registroTareaId; }
    public String getNombreTarea() { return nombreTarea; }
    public Integer getPuntos() { return puntos; }
    public LocalDateTime getFechaLimite() { return fechaLimite; }
    public Long getHogarId() { return hogarId; }
    public String getNombreHogar() { return nombreHogar; }
    public Long getSolicitanteId() { return solicitanteId; }
    public String getNombreSolicitante() { return nombreSolicitante; }
    public Long getDestinatarioId() { return destinatarioId; }
    public String getNombreDestinatario() { return nombreDestinatario; }
    public String getEstado() { return estado; }
    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public LocalDateTime getFechaRespuesta() { return fechaRespuesta; }
}
