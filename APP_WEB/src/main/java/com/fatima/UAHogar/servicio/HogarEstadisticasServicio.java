package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.DAO.HogarDAO;
import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.dto.EstadisticasHogarDTO;
import com.fatima.UAHogar.modelo.Hogar;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.RegistroTarea;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HogarEstadisticasServicio {

    private final RegistroTareaDAO registroTareaDAO;
    private final MiembroHogarDAO miembroHogarDAO;
    private final HogarDAO hogarDAO;

    public HogarEstadisticasServicio(RegistroTareaDAO registroTareaDAO,
                                     MiembroHogarDAO miembroHogarDAO,
                                     HogarDAO hogarDAO) {
        this.registroTareaDAO = registroTareaDAO;
        this.miembroHogarDAO = miembroHogarDAO;
        this.hogarDAO = hogarDAO;
    }

    public EstadisticasHogarDTO calcular(Long hogarId) {
        EstadisticasHogarDTO dto = new EstadisticasHogarDTO();

        Hogar hogar = hogarDAO.findById(hogarId).orElse(null);
        List<RegistroTarea> completadas = registroTareaDAO
                .findByHogarIdAndEstadoOrderByFechaCompletadaDesc(hogarId, "COMPLETADA");
        List<MiembroHogar> miembros = miembroHogarDAO.findByHogarId(hogarId);

        // Tareas vencidas de este hogar (se usan tanto para "más puntos" como para "más pelotas")
        List<RegistroTarea> vencidas = registroTareaDAO
                .findByEstadoAndFechaLimiteBefore("VENCIDA", LocalDateTime.now())
                .stream()
                .filter(r -> r.getHogar().getId().equals(hogarId))
                .collect(Collectors.toList());

        if (hogar != null && hogar.getFechaCreacion() != null) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy",
                    Locale.of("es"));
            dto.setFechaCreacion(hogar.getFechaCreacion().format(fmt));
        }

        // Ranking mensual de los ultimos 6 meses
        dto.setRankingMensual(calcularRankingMensual(completadas, miembros));

        // Quien mas  tiene mas puntos totales
        Map<Long, Integer> puntosCompletados = completadas.stream()
                .filter(r -> r.getUsuario() != null)
                .collect(Collectors.groupingBy(r -> r.getUsuario().getId(),
                        Collectors.summingInt(r -> r.getPuntosSumados() != null ? r.getPuntosSumados() : 0)));

        Map<Long, Integer> penalizacionesVencidas = vencidas.stream()
                .filter(r -> r.getUsuarioAsignado() != null)
                .collect(Collectors.groupingBy(r -> r.getUsuarioAsignado().getId(),
                        Collectors.summingInt(r -> r.getPenalizacion() != null ? r.getPenalizacion() : 0)));

        miembros.stream()
                .max(Comparator.comparingInt(m ->
                        puntosCompletados.getOrDefault(m.getUsuario().getId(), 0)
                                - penalizacionesVencidas.getOrDefault(m.getUsuario().getId(), 0)))
                .ifPresent(m -> dto.setMasLimpio(m.getUsuario().getNombre()));

        // Quien mas tareas vencidas acumula
        vencidas.stream()
                .filter(r -> r.getUsuarioAsignado() != null)
                .collect(Collectors.groupingBy(r -> r.getUsuarioAsignado().getNombre(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(e -> dto.setMasPelotas(e.getKey()));

        // Miembro mas nuevo y mas antiguo por id de membresia
        miembros.stream()
                .max(Comparator.comparing(MiembroHogar::getId))
                .ifPresent(m -> dto.setMasNuevo(m.getUsuario().getNombre()));
        miembros.stream()
                .min(Comparator.comparing(MiembroHogar::getId))
                .ifPresent(m -> dto.setMasAntiguo(m.getUsuario().getNombre()));

        // Totales del hogar
        dto.setTotalCompletadas(completadas.size());
        dto.setTotalMiembros(miembros.size());
        dto.setTotalPuntos(completadas.stream()
                .mapToInt(r -> r.getPuntosSumados() != null ? r.getPuntosSumados() : 0)
                .sum());

        // Tipo de tarea que mas veces se ha completado
        completadas.stream()
                .filter(r -> r.getTarea() != null && r.getTarea().getTipo() != null)
                .collect(Collectors.groupingBy(r -> r.getTarea().getTipo(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(e -> dto.setTipoTareaFavorita(e.getKey()));

        // Tarea que mas puntos ha generado en total
        completadas.stream()
                .filter(r -> r.getTarea() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getTarea().getNombre(),
                        Collectors.summingInt(r -> r.getPuntosSumados() != null ? r.getPuntosSumados() : 0)
                ))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(e -> dto.setTareaEstrella(e.getKey()));

        return dto;
    }

    // Calcula el ranking de puntos mes a mes para los ultimos 6 meses
    private List<Map<String, Object>> calcularRankingMensual(
            List<RegistroTarea> completadas, List<MiembroHogar> miembros) {

        List<Map<String, Object>> ranking = new ArrayList<>();
        YearMonth actual = YearMonth.now();

        for (int i = 0; i < 6; i++) {
            YearMonth mes = actual.minusMonths(i);
            LocalDateTime inicio = mes.atDay(1).atStartOfDay();
            LocalDateTime fin = mes.atEndOfMonth().atTime(23, 59, 59);

            List<Map<String, Object>> puntosMes = new ArrayList<>();
            for (MiembroHogar m : miembros) {
                int pts = completadas.stream()
                        .filter(r -> r.getUsuario() != null &&
                                r.getUsuario().getId().equals(m.getUsuario().getId()) &&
                                r.getFechaCompletada() != null &&
                                !r.getFechaCompletada().isBefore(inicio) &&
                                !r.getFechaCompletada().isAfter(fin))
                        .mapToInt(r -> r.getPuntosSumados() != null ? r.getPuntosSumados() : 0)
                        .sum();

                Map<String, Object> entrada = new HashMap<>();
                entrada.put("nombre", m.getUsuario().getNombre());
                entrada.put("puntos", pts);
                puntosMes.add(entrada);
            }

            puntosMes.sort((a, b) -> (int) b.get("puntos") - (int) a.get("puntos"));

            Map<String, Object> filaMes = new HashMap<>();
            filaMes.put("mes", mes.getMonthValue());
            filaMes.put("anio", mes.getYear());
            filaMes.put("nombreMes", mes.getMonth().getDisplayName(TextStyle.FULL, Locale.of("es")));
            filaMes.put("miembros", puntosMes);
            ranking.add(filaMes);
        }

        return ranking;
    }
}