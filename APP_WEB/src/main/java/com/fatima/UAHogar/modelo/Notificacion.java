package com.fatima.UAHogar.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacion tipo;

    @Column(nullable = false)
    private Boolean leida = false;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = true)
    private String urlOrigen;

    // ID de la entidad relacionada
    @Column(nullable = true)
    private Long referenciaId;

    // Usuario que recibe la notificación
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Hogar relacionado con la notificación
    @ManyToOne
    @JoinColumn(name = "hogar_id", nullable = true)
    private Hogar hogar;

    // Tarea relacionada, si existe
    @ManyToOne
    @JoinColumn(name = "tarea_id", nullable = true)
    private Tarea tareaRelacionada;

    // Incidencia relacionada, si existe
    @ManyToOne
    @JoinColumn(name = "incidencia_id", nullable = true)
    private Incidencia incidenciaRelacionada;

    // Mensaje relacionado, si existe
    @ManyToOne
    @JoinColumn(name = "mensaje_id", nullable = true)
    private Mensaje mensajeRelacionado;

    // Constructor vacío
    public Notificacion() {}
    //Getters y setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitulo() {
        return titulo;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    public String getMensaje() {
        return mensaje;
    }
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
    public TipoNotificacion getTipo() {
        return tipo;
    }
    public void setTipo(TipoNotificacion tipo) {
        this.tipo = tipo;
    }
    public Boolean getLeida() {
        return leida;
    }
    public void setLeida(Boolean leida) {
        this.leida = leida;
    }
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    public String getUrlOrigen() {
        return urlOrigen;
    }
    public void setUrlOrigen(String urlOrigen) {
        this.urlOrigen = urlOrigen;
    }
    public Long getReferenciaId() {
        return referenciaId;
    }
    public void setReferenciaId(Long referenciaId) {
        this.referenciaId = referenciaId;
    }
    public Usuario getUsuario() {
        return usuario;
    }
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    public Hogar getHogar() {
        return hogar;
    }
    public void setHogar(Hogar hogar) {
        this.hogar = hogar;
    }
    public Tarea getTareaRelacionada() {
        return tareaRelacionada;
    }
    public void setTareaRelacionada(Tarea tareaRelacionada) {
        this.tareaRelacionada = tareaRelacionada;
    }
    public Incidencia getIncidenciaRelacionada() {
        return incidenciaRelacionada;
    }
    public void setIncidenciaRelacionada(Incidencia incidenciaRelacionada) {this.incidenciaRelacionada = incidenciaRelacionada;}
    public Mensaje getMensajeRelacionado() {
        return mensajeRelacionado;
    }
    public void setMensajeRelacionado(Mensaje mensajeRelacionado) {
        this.mensajeRelacionado = mensajeRelacionado;
    }
}