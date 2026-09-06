package com.fatima.UAHogar.dto;

import com.fatima.UAHogar.util.ZonaHorariaApp;

import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.util.PlazosUtil;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

// Envía instancias pendientes del usuario incluyendo todos los campos necesarios para mostrar urgencia estado y margen de gracia
public class InstanciaTareaDTO {

    private Long id;
    private Long tareaId;
    private String nombre;
    private String descripcion;
    private String tipo;
    private String frecuencia;
    private String tiempoEstimado;
    private Integer puntos;
    private Integer puntosConMargen;
    private String estado;
    private LocalDateTime fechaLimite;
    private Long diasRestantes;
    private Long horasRestantes;
    private boolean esUrgente;
    private boolean completableConMargen;
    private String imagenUrl;
    private String nombreHogar;
    private Long hogarId;
    private String nombreUsuarioAsignado;
    private String imagenPerfilAsignado;

    public InstanciaTareaDTO(RegistroTarea rt) {
        this.id = rt.getId();
        this.tareaId = rt.getTarea() != null ? rt.getTarea().getId() : null;
        this.nombre = rt.getTarea() != null ? rt.getTarea().getNombre() : "";
        this.descripcion = rt.getTarea() != null ? rt.getTarea().getDescripcion() : "";
        this.tipo = rt.getTarea() != null ? rt.getTarea().getTipo() : "";
        this.frecuencia = rt.getTarea() != null ? rt.getTarea().getFrecuencia() : "";
        this.tiempoEstimado = rt.getTarea() != null ? rt.getTarea().getTiempoEstimado() : "";
        this.puntos = rt.getTarea() != null ? rt.getTarea().getPuntos() : 0;
        this.estado = rt.getEstado();
        this.fechaLimite = rt.getFechaLimite();
        this.imagenUrl = rt.getImagenUrl();
        this.nombreHogar = rt.getHogar() != null ? rt.getHogar().getNombre() : "";
        this.hogarId = rt.getHogar() != null ? rt.getHogar().getId() : null;
        this.nombreUsuarioAsignado = rt.getUsuarioAsignado() != null ? rt.getUsuarioAsignado().getNombre() : "";
        this.imagenPerfilAsignado = rt.getUsuarioAsignado() != null ? rt.getUsuarioAsignado().getImagenPerfil() : "";

        // Calculamos dias restantes y urgencia
        if (rt.getFechaLimite() != null) {
            this.diasRestantes = ChronoUnit.DAYS.between(LocalDateTime.now(ZonaHorariaApp.ZONA), rt.getFechaLimite());
            this.horasRestantes = ChronoUnit.HOURS.between(LocalDateTime.now(ZonaHorariaApp.ZONA), rt.getFechaLimite());
            this.esUrgente = this.horasRestantes <= 48;

            // La tarea esta en margen de gracia si vencio pero sigue dentro de su margen  proporcional a la frecuencia
            boolean vencida = LocalDateTime.now(ZonaHorariaApp.ZONA).isAfter(rt.getFechaLimite());
            long margenHoras = PlazosUtil.margenGraciaHoras(this.frecuencia);
            boolean dentroDelMargen = vencida &&
                    LocalDateTime.now(ZonaHorariaApp.ZONA).isBefore(rt.getFechaLimite().plusHours(margenHoras));
            this.completableConMargen = dentroDelMargen;
        } else {
            this.diasRestantes = null;
            this.horasRestantes = null;
            this.esUrgente = false;
            this.completableConMargen = false;
        }

        // Puntos que obtendra si completa en el margen de gracia el 70%
        this.puntosConMargen = this.puntos != null
                ? (int) Math.round(this.puntos * 0.70)
                : 0;
    }

    public Long getId() { return id; }
    public Long getTareaId() { return tareaId; }
    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }
    public String getTipo() { return tipo; }
    public String getFrecuencia() { return frecuencia; }
    public String getTiempoEstimado() { return tiempoEstimado; }
    public Integer getPuntos() { return puntos; }
    public Integer getPuntosConMargen() { return puntosConMargen; }
    public String getEstado() { return estado; }
    public LocalDateTime getFechaLimite() { return fechaLimite; }
    public Long getDiasRestantes() { return diasRestantes; }
    public Long getHorasRestantes() { return horasRestantes; }
    public boolean isEsUrgente() { return esUrgente; }
    public boolean isCompletableConMargen() { return completableConMargen; }
    public String getImagenUrl() { return imagenUrl; }
    public String getNombreHogar() { return nombreHogar; }
    public Long getHogarId() { return hogarId; }
    public String getNombreUsuarioAsignado() { return nombreUsuarioAsignado; }
    public String getImagenPerfilAsignado() { return imagenPerfilAsignado; }
}