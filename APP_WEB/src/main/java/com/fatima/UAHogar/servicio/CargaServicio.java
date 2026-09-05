package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.Usuario;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

// Calcula y compara la carga de trabajo de cada miembro para repartir tareas de forma equilibrada
@Service
public class CargaServicio {

    private final RegistroTareaDAO registroTareaDAO;
    private final MiembroHogarDAO miembroHogarDAO;

    public CargaServicio(RegistroTareaDAO registroTareaDAO, MiembroHogarDAO miembroHogarDAO) {
        this.registroTareaDAO = registroTareaDAO;
        this.miembroHogarDAO = miembroHogarDAO;
    }

    // Primer dia de la quincena
    public LocalDate inicioQuincena(LocalDate fecha) {
        return fecha.getDayOfMonth() <= 15 ? fecha.withDayOfMonth(1) : fecha.withDayOfMonth(16);
    }

    // Ultimo dia de la quincena
    public LocalDate finQuincena(LocalDate fecha) {
        return fecha.getDayOfMonth() <= 15
                ? fecha.withDayOfMonth(15)
                : fecha.withDayOfMonth(fecha.lengthOfMonth());
    }

    // Carga acumulada de un usuario en un hogar: pendientes/vencidas ya asignadas (aunque no esten completadas) + completadas dentro de la quincena actual
    public int calcularCargaAcumulada(Long usuarioId, Long hogarId) {
        LocalDateTime inicio = inicioQuincena(LocalDate.now()).atStartOfDay();
        LocalDateTime fin = finQuincena(LocalDate.now()).atTime(23, 59, 59);

        int cargaPendiente = registroTareaDAO.sumarCargaPendienteAsignada(usuarioId, hogarId);
        int cargaCompletada = registroTareaDAO.sumarCargaCompletadaEnPeriodo(usuarioId, hogarId, inicio, fin);
        return cargaPendiente + cargaCompletada;
    }

    // Carga objetivo por mienro ->carga total planificada de la quincena entre los miembros activos.

    public double calcularCargaObjetivo(Long hogarId) {
        LocalDateTime inicio = inicioQuincena(LocalDate.now()).atStartOfDay();
        LocalDateTime fin = finQuincena(LocalDate.now()).atTime(23, 59, 59);

        int cargaTotal = registroTareaDAO.sumarCargaPlanificadaHogarEnPeriodo(hogarId, inicio, fin);
        int numMiembros = miembroHogarDAO.findByHogarId(hogarId).size();

        return numMiembros == 0 ? 0 : (double) cargaTotal / numMiembros;
    }

    // Miembro cuya carga acumulada esta mas por debajo de su carga objetivo
    public Usuario buscarMiembroConMenosCarga(Long hogarId) {
        double cargaObjetivo = calcularCargaObjetivo(hogarId);

        return miembroHogarDAO.findByHogarId(hogarId)
                .stream()
                .min(Comparator.comparingDouble(m ->
                        calcularCargaAcumulada(m.getUsuario().getId(), hogarId) - cargaObjetivo))
                .map(MiembroHogar::getUsuario)
                .orElse(null);
    }

    // Miembros de un hogar ordenados de menos a mas carga
    public List<Usuario> ordenarMiembrosPorCarga(Long hogarId) {
        double cargaObjetivo = calcularCargaObjetivo(hogarId);

        return miembroHogarDAO.findByHogarId(hogarId)
                .stream()
                .sorted(Comparator.comparingDouble(m ->
                        calcularCargaAcumulada(m.getUsuario().getId(), hogarId) - cargaObjetivo))
                .map(MiembroHogar::getUsuario)
                .collect(Collectors.toList());
    }
}