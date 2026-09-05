package com.fatima.UAHogar.dto;

import com.fatima.UAHogar.modelo.RegistroTarea;
import java.time.LocalDateTime;

/**
 * DTO para devolver registros de tareas al frontend sin referencias circulares.
 * Se usa en el perfil ajeno para mostrar las tareas recientes en común.
 */
public class RegistroTareaDTO {

    private Long id;
    private String nombre;       // nombre de la tarea
    private String nombreHogar;  // nombre del hogar donde se completó
    private String nombreUsuario; // quién la completó
    private Integer puntosSumados;
    private LocalDateTime fechaCompletada;
    private String imagenUrl;
    private Long usuarioId;

    // Constructor
    public RegistroTareaDTO(RegistroTarea rt) {
        this.id = rt.getId();
        this.nombre = rt.getTarea() != null ? rt.getTarea().getNombre() : "Tarea desconocida";
        this.nombreHogar = rt.getHogar() != null ? rt.getHogar().getNombre() : "Hogar";
        this.nombreUsuario = rt.getUsuario() != null ? rt.getUsuario().getNombre() : "";        this.puntosSumados = rt.getPuntosSumados();
        this.fechaCompletada = rt.getFechaCompletada();
        this.imagenUrl = rt.getImagenUrl();
        this.usuarioId = rt.getUsuario() != null ? rt.getUsuario().getId() : null;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getNombreHogar() { return nombreHogar; }
    public String getNombreUsuario() { return nombreUsuario; }
    public Integer getPuntosSumados() { return puntosSumados; }
    public LocalDateTime getFechaCompletada() { return fechaCompletada; }
    public String getImagenUrl() { return imagenUrl; }
    public Long getUsuarioId() { return usuarioId; }
}