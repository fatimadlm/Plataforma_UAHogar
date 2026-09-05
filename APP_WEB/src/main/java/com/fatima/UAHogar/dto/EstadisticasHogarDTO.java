package com.fatima.UAHogar.dto;

import java.util.List;
import java.util.Map;

public class EstadisticasHogarDTO {

    private List<Map<String, Object>> rankingMensual;
    private String masLimpio;
    private String masPelotas;
    private String masNuevo;
    private String masAntiguo;
    private Integer totalCompletadas;
    private Integer totalMiembros;
    private Integer totalPuntos;
    private String tipoTareaFavorita;
    private String tareaEstrella;
    private String fechaCreacion;

    public EstadisticasHogarDTO() {}

    public List<Map<String, Object>> getRankingMensual() { return rankingMensual; }
    public void setRankingMensual(List<Map<String, Object>> r) { this.rankingMensual = r; }

    public String getMasLimpio() { return masLimpio; }
    public void setMasLimpio(String m) { this.masLimpio = m; }

    public String getMasPelotas() { return masPelotas; }
    public void setMasPelotas(String m) { this.masPelotas = m; }

    public String getMasNuevo() { return masNuevo; }
    public void setMasNuevo(String m) { this.masNuevo = m; }

    public String getMasAntiguo() { return masAntiguo; }
    public void setMasAntiguo(String m) { this.masAntiguo = m; }

    public Integer getTotalCompletadas() { return totalCompletadas; }
    public void setTotalCompletadas(Integer t) { this.totalCompletadas = t; }

    public Integer getTotalMiembros() { return totalMiembros; }
    public void setTotalMiembros(Integer t) { this.totalMiembros = t; }

    public Integer getTotalPuntos() { return totalPuntos; }
    public void setTotalPuntos(Integer t) { this.totalPuntos = t; }

    public String getTipoTareaFavorita() { return tipoTareaFavorita; }
    public void setTipoTareaFavorita(String t) { this.tipoTareaFavorita = t; }

    public String getTareaEstrella() { return tareaEstrella; }
    public void setTareaEstrella(String t) { this.tareaEstrella = t; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String f) { this.fechaCreacion = f; }
}