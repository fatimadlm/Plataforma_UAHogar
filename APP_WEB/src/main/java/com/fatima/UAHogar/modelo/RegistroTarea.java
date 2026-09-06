package com.fatima.UAHogar.modelo;

import com.fatima.UAHogar.util.ZonaHorariaApp;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_tareas")
public class RegistroTarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tarea_id", nullable = false)
    private Tarea tarea;

    // Usuario al que se le asigna la tarea null significa que está en la bolsa
    @ManyToOne
    @JoinColumn(name = "usuario_asignado_id", nullable = true)
    private Usuario usuarioAsignado;

    // Usuario que finalmente completó la tarea puede ser distinto al asignado
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = true)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "hogar_id", nullable = false)
    private Hogar hogar;

    // PENDIENTE COMPLETADA VENCIDA
    @Column(nullable = false)
    private String estado = "PENDIENTE";

    // Fecha limite para completar la tarea
    @Column(nullable = true)
    private LocalDateTime fechaLimite;

    // Fecha en la que se completó
    @Column(nullable = true)
    private LocalDateTime fechaCompletada;

    @Column(nullable = false)
    private Boolean notificacionUrgenciaEnviada = false;

    @Column(nullable = false)
    private Boolean notificacionGraciaEnviada = false;

    // Puntos congelados al momento de completar
    @Column(nullable = true)
    private Integer puntosSumados;

    // Puntos negativos por entregar tarde
    @Column(nullable = false)
    private Integer penalizacion = 0;

    @Column(nullable = true)
    private String imagenUrl;

    @OneToMany(mappedBy = "registroTarea", cascade = CascadeType.ALL)
    private List<Incidencia> incidencias = new ArrayList<>();

    public RegistroTarea() {}

    // Constructor
    public RegistroTarea(Tarea tarea, Usuario usuario, Hogar hogar, Integer puntosSumados, String imagenUrl) {
        this.tarea = tarea;
        this.usuario = usuario;
        this.usuarioAsignado = usuario;
        this.hogar = hogar;
        this.puntosSumados = puntosSumados;
        this.imagenUrl = imagenUrl;
        this.fechaCompletada = LocalDateTime.now(ZonaHorariaApp.ZONA);
        this.estado = "COMPLETADA";
        this.penalizacion = 0;
    }

    // Constructor para crear una instancia
    public RegistroTarea(Tarea tarea, Hogar hogar, Usuario usuarioAsignado, LocalDateTime fechaLimite) {
        this.tarea = tarea;
        this.hogar = hogar;
        this.usuarioAsignado = usuarioAsignado;
        this.fechaLimite = fechaLimite;
        this.estado = "PENDIENTE";
        this.penalizacion = 0;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tarea getTarea() { return tarea; }
    public void setTarea(Tarea tarea) { this.tarea = tarea; }

    public Usuario getUsuarioAsignado() { return usuarioAsignado; }
    public void setUsuarioAsignado(Usuario u) { this.usuarioAsignado = u; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Hogar getHogar() { return hogar; }
    public void setHogar(Hogar hogar) { this.hogar = hogar; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(LocalDateTime f) { this.fechaLimite = f; }

    public LocalDateTime getFechaCompletada() { return fechaCompletada; }
    public void setFechaCompletada(LocalDateTime f) { this.fechaCompletada = f; }

    public Integer getPuntosSumados() { return puntosSumados; }
    public void setPuntosSumados(Integer p) { this.puntosSumados = p; }

    public Integer getPenalizacion() { return penalizacion; }
    public void setPenalizacion(Integer p) { this.penalizacion = p; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String url) { this.imagenUrl = url; }

    public List<Incidencia> getIncidencias() { return incidencias; }
    public void setIncidencias(List<Incidencia> i) { this.incidencias = i; }

    public boolean tieneImagen() {
        return imagenUrl != null && !imagenUrl.isEmpty();
    }

    public boolean estaVencida() {
        return "PENDIENTE".equals(estado) && fechaLimite != null && LocalDateTime.now(ZonaHorariaApp.ZONA).isAfter(fechaLimite);
    }

    public boolean fueEntregadaTarde() {
        return fechaCompletada != null && fechaLimite != null && fechaCompletada.isAfter(fechaLimite);
    }

    // Puntos netos descontando la penalizacion
    public int puntosNetos() {
        return (puntosSumados != null ? puntosSumados : 0) - penalizacion;
    }
    public Boolean getNotificacionUrgenciaEnviada() {
        return notificacionUrgenciaEnviada;
    }

    public void setNotificacionUrgenciaEnviada(Boolean notificacionUrgenciaEnviada) {
        this.notificacionUrgenciaEnviada = notificacionUrgenciaEnviada;
    }

    public Boolean getNotificacionGraciaEnviada() {
        return notificacionGraciaEnviada;
    }

    public void setNotificacionGraciaEnviada(Boolean notificacionGraciaEnviada) {
        this.notificacionGraciaEnviada = notificacionGraciaEnviada;
    }
}