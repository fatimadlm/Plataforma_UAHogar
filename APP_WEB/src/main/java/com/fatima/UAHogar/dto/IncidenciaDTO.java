package com.fatima.UAHogar.dto;

import com.fatima.UAHogar.modelo.Incidencia;
import com.fatima.UAHogar.modelo.RegistroTarea;
import java.time.LocalDateTime;

public class IncidenciaDTO {

    private Long id;
    private Long registroTareaId;
    private String nombreTarea;
    private Long hogarId;
    private String nombreHogar;

    private Long reportanteId;
    private String nombreReportante;

    private Long responsableId;
    private String nombreResponsable;

    private String descripcion;
    private String estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCierre;
    private String nombreCerradaPor;

    public IncidenciaDTO(Incidencia i) {
        RegistroTarea registro = i.getRegistroTarea();

        this.id = i.getId();
        this.registroTareaId = registro != null ? registro.getId() : null;
        this.nombreTarea = registro != null && registro.getTarea() != null ? registro.getTarea().getNombre() : "";
        this.hogarId = registro != null && registro.getHogar() != null ? registro.getHogar().getId() : null;
        this.nombreHogar = registro != null && registro.getHogar() != null ? registro.getHogar().getNombre() : "";

        this.reportanteId = i.getReportante() != null ? i.getReportante().getId() : null;
        this.nombreReportante = i.getReportante() != null ? i.getReportante().getNombre() : "";

        this.responsableId = i.getResponsable() != null ? i.getResponsable().getId() : null;
        this.nombreResponsable = i.getResponsable() != null ? i.getResponsable().getNombre() : "";

        this.descripcion = i.getDescripcion();
        this.estado = i.getEstado();
        this.fechaCreacion = i.getFechaCreacion();
        this.fechaCierre = i.getFechaCierre();
        this.nombreCerradaPor = i.getCerradaPor() != null ? i.getCerradaPor().getNombre() : null;
    }

    // Getters
    public Long getId() { return id; }
    public Long getRegistroTareaId() { return registroTareaId; }
    public String getNombreTarea() { return nombreTarea; }
    public Long getHogarId() { return hogarId; }
    public String getNombreHogar() { return nombreHogar; }
    public Long getReportanteId() { return reportanteId; }
    public String getNombreReportante() { return nombreReportante; }
    public Long getResponsableId() { return responsableId; }
    public String getNombreResponsable() { return nombreResponsable; }
    public String getDescripcion() { return descripcion; }
    public String getEstado() { return estado; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public String getNombreCerradaPor() { return nombreCerradaPor; }
}