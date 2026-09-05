package com.fatima.UAHogar.dto;

public class EstadisticasDTO {
    private long puntosComunes;
    private long tareasComunes;

    // Constructor
    public EstadisticasDTO(long puntosComunes, long tareasComunes) {
        this.puntosComunes = puntosComunes;
        this.tareasComunes = tareasComunes;
    }

    // Getters necesarios para que el controlador pueda extraer los valores
    public long getPuntosComunes() { return puntosComunes; }
    public long getTareasComunes() { return tareasComunes; }
}