package com.fatima.UAHogar.util;

// Calcula el margen de gracia posterior al vencimiento, proporcional al ciclo base de cada

public class PlazosUtil {
    private PlazosUtil() {}

    // Horas de margen de gracia segun la frecuencia de la tarea
    public static long margenGraciaHoras(String frecuencia) {
        switch ((frecuencia != null ? frecuencia : "").toUpperCase()) {
            case "DIARIA":    return 8;        // ciclo base 36h
            case "SEMANAL":   return 36;       // ciclo base 7 dias
            case "MENSUAL":   return 24 * 6;   // ciclo base 30 dias, 6 dias de margen
            case "OCASIONAL": return 24 * 3;   // ciclo base 15 dias, 3 dias de margen
            default:          return 24;
        }
    }
}