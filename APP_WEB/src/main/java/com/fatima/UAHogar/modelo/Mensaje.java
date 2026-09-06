package com.fatima.UAHogar.modelo;

import com.fatima.UAHogar.util.ZonaHorariaApp;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_mensaje", discriminatorType = DiscriminatorType.STRING)
public abstract class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String contenido;

    @Column(nullable = false)
    private LocalDateTime fechaEnvio;

    @ManyToOne
    @JoinColumn(name = "remitente_id", nullable = false)
    private Usuario remitente;

    // Editar propio mensaje
    @Column(name = "contenido_original", length = 1000, nullable = true)
    private String contenidoOriginal;

    @Column(name = "editado_en", nullable = true)
    private LocalDateTime editadoEn;
   // delete de mensaje propio
    @Column(nullable = false)
    @ColumnDefault("false")
    private Boolean eliminado = false;

    @Column(name = "eliminado_en", nullable = true)
    private LocalDateTime eliminadoEn;

    public Mensaje() {

    }

    public Mensaje(String contenido, Usuario remitente) {
        this.contenido = contenido;
        this.remitente = remitente;
        this.fechaEnvio = LocalDateTime.now(ZonaHorariaApp.ZONA);
        this.eliminado = false;
    }

    // Getters y Setters de id, contenido, fechaEnvio y remitente...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    public Usuario getRemitente() { return remitente; }
    public void setRemitente(Usuario remitente) { this.remitente = remitente; }
    public String getContenidoOriginal() { return contenidoOriginal; }
    public void setContenidoOriginal(String contenidoOriginal) { this.contenidoOriginal = contenidoOriginal; }

    public LocalDateTime getEditadoEn() { return editadoEn; }
    public void setEditadoEn(LocalDateTime editadoEn) { this.editadoEn = editadoEn; }

    public Boolean getEliminado() { return eliminado; }
    public void setEliminado(Boolean eliminado) { this.eliminado = eliminado; }

    public LocalDateTime getEliminadoEn() { return eliminadoEn; }
    public void setEliminadoEn(LocalDateTime eliminadoEn) { this.eliminadoEn = eliminadoEn; }

    // Helpers
    public boolean esEditado() { return editadoEn != null; }
    public boolean esEliminado() { return Boolean.TRUE.equals(eliminado); }
}