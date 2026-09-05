package com.fatima.UAHogar.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

public class MensajeGrupoDTO {

    public Long id;
    public Long hogarId;
    public Long remitenteId;
    public String remitente;
    public String imagenPerfil;
    public String contenido;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    public LocalDateTime fechaEnvio;

    // ===== NUEVOS CAMPOS =====
    public String contenidoOriginal;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    public LocalDateTime editadoEn;

    public boolean esEditado;

    // ===== CONSTRUCTORES =====
    public MensajeGrupoDTO() {}

    public MensajeGrupoDTO(Long id, Long hogarId, Long remitenteId, String remitente,
                           String contenido, LocalDateTime fechaEnvio) {
        this.id = id;
        this.hogarId = hogarId;
        this.remitenteId = remitenteId;
        this.remitente = remitente;
        this.contenido = contenido;
        this.fechaEnvio = fechaEnvio;
        this.esEditado = false;
    }

    // ===== GETTERS Y SETTERS =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHogarId() { return hogarId; }
    public void setHogarId(Long hogarId) { this.hogarId = hogarId; }

    public Long getRemitenteId() { return remitenteId; }
    public void setRemitenteId(Long remitenteId) { this.remitenteId = remitenteId; }

    public String getRemitente() { return remitente; }
    public void setRemitente(String remitente) { this.remitente = remitente; }

    public String getImagenPerfil() { return imagenPerfil; }
    public void setImagenPerfil(String imagenPerfil) { this.imagenPerfil = imagenPerfil; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

    public String getContenidoOriginal() { return contenidoOriginal; }
    public void setContenidoOriginal(String contenidoOriginal) {
        this.contenidoOriginal = contenidoOriginal;
    }

    public LocalDateTime getEditadoEn() { return editadoEn; }
    public void setEditadoEn(LocalDateTime editadoEn) { this.editadoEn = editadoEn; }

    public boolean getEsEditado() { return esEditado; }
    public void setEsEditado(boolean esEditado) { this.esEditado = esEditado; }
}