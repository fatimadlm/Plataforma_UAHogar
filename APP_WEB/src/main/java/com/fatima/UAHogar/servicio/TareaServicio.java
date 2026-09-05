package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.DAO.HogarDAO;
import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.DAO.TareaDAO;
import com.fatima.UAHogar.DAO.UsuarioDAO;
import com.fatima.UAHogar.dto.InstanciaTareaDTO;
import com.fatima.UAHogar.modelo.Hogar;
import com.fatima.UAHogar.modelo.Notificacion;
import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.modelo.Tarea;
import com.fatima.UAHogar.modelo.TipoNotificacion;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.util.PlazosUtil;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TareaServicio {

    private final TareaDAO tareaDAO;
    private final HogarDAO hogarDAO;
    private final RegistroTareaDAO registroTareaDAO;
    private final UsuarioDAO usuarioDAO;
    private final CargaServicio cargaServicio;
    private final NotificacionServicio notificacionServicio;

    public TareaServicio(
            TareaDAO tareaDAO,
            HogarDAO hogarDAO,
            RegistroTareaDAO registroTareaDAO,
            UsuarioDAO usuarioDAO,
            CargaServicio cargaServicio,
            NotificacionServicio notificacionServicio) {

        this.tareaDAO = tareaDAO;
        this.hogarDAO = hogarDAO;
        this.registroTareaDAO = registroTareaDAO;
        this.usuarioDAO = usuarioDAO;
        this.cargaServicio = cargaServicio;
        this.notificacionServicio = notificacionServicio;
    }

    // Creamos una nueva plantilla y generamos su primera instancia si la fecha de inicio es hoy
    @Transactional
    public Tarea crearTarea(
            Tarea nuevaTarea,
            Long hogarId,
            String fechaInicioStr,
            Long usuarioAsignadoId) {

        Hogar hogar = hogarDAO.findById(hogarId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "El hogar especificado no existe"
                        ));

        nuevaTarea.setHogar(hogar);

        if (nuevaTarea.getNombre() == null
                || nuevaTarea.getNombre().isBlank()) {

            throw new IllegalArgumentException(
                    "El nombre de la tarea es obligatorio"
            );
        }

        if (nuevaTarea.getTiempoEstimado() == null
                || nuevaTarea.getTiempoEstimado().isBlank()) {

            throw new IllegalArgumentException(
                    "El tiempo estimado es obligatorio"
            );
        }

        int minutos;

        try {

            minutos = Integer.parseInt(
                    nuevaTarea.getTiempoEstimado()
            );

        } catch (NumberFormatException e) {

            throw new IllegalArgumentException(
                    "El tiempo estimado debe ser un número"
            );
        }

        if (minutos < 5 || minutos > 240) {

            throw new IllegalArgumentException(
                    "El tiempo estimado debe estar entre 5 y 240 minutos"
            );
        }

        // Convertimos los minutos en puntos de forma determinista
        nuevaTarea.setPuntos(
                calcularPuntos(minutos)
        );

        // Validamos que la fecha de inicio es obligatoria y no es anterior a hoy
        if (fechaInicioStr == null
                || fechaInicioStr.isBlank()) {

            throw new IllegalArgumentException(
                    "La fecha de inicio es obligatoria"
            );
        }

        LocalDate fechaInicio;

        try {

            fechaInicio =
                    LocalDate.parse(fechaInicioStr);

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "La fecha de inicio no tiene un formato válido"
            );
        }

        if (fechaInicio.isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "La fecha de inicio no puede ser anterior a hoy"
            );
        }

        nuevaTarea.setFechaInicio(fechaInicio);

        // Si la fecha de inicio es hoy la activamos directamente
        boolean activaYa =
                !fechaInicio.isAfter(LocalDate.now());

        nuevaTarea.setActiva(activaYa);

        Tarea guardada =
                tareaDAO.save(nuevaTarea);

        // Solo generamos la primera instancia si la tarea ya está activa
        if (activaYa) {

            Usuario asignado =
                    usuarioAsignadoId != null
                            ? usuarioDAO
                            .findById(usuarioAsignadoId)
                            .orElse(null)
                            : cargaServicio
                            .buscarMiembroConMenosCarga(
                                    hogarId
                            );

            LocalDateTime fechaLimite =
                    calcularFechaLimiteInicial(
                            fechaInicioStr,
                            nuevaTarea.getFrecuencia()
                    );

            RegistroTarea primera =
                    new RegistroTarea(
                            guardada,
                            hogar,
                            asignado,
                            fechaLimite
                    );

            registroTareaDAO.save(primera);

            if (asignado != null) {
                notificarAsignacion(
                        primera,
                        asignado
                );
            }
        }

        return guardada;
    }

    // Convertimos los minutos en puntos
    public int calcularPuntos(int minutos) {

        if (minutos <= 10) return 10;
        if (minutos <= 20) return 20;
        if (minutos <= 30) return 30;
        if (minutos <= 45) return 40;
        if (minutos <= 60) return 50;
        if (minutos <= 90) return 70;
        if (minutos <= 120) return 90;

        return 100;
    }

    // Devuelve el id del hogar al que pertenece una tarea
    public Long obtenerHogarIdDeTarea(Long tareaId) {
        Tarea tarea = tareaDAO.findById(tareaId)
                .orElseThrow(() -> new IllegalArgumentException("La tarea no existe"));
        return tarea.getHogar().getId();
    }

    // Devuelve las plantillas activas de un hogar para el bloque de plantillas
    public List<Tarea> obtenerTareasDelHogar(Long hogarId) {
        return tareaDAO.findByHogarId(hogarId)
                .stream()
                .filter(t ->
                        t.getActiva() == null
                                || t.getActiva()
                )
                .collect(Collectors.toList());
    }

    // Devuelve las instancias pendientes del usuario como DTOs para el feed
    public List<InstanciaTareaDTO> obtenerTareasPorUsuario(
            Long usuarioId) {

        List<RegistroTarea> pendientes =
                registroTareaDAO
                        .findByUsuarioAsignadoIdAndEstadoOrderByFechaLimiteAsc(
                                usuarioId,
                                "PENDIENTE"
                        );

        List<RegistroTarea> enMargen =
                registroTareaDAO
                        .findByUsuarioAsignadoIdAndEstadoOrderByFechaLimiteAsc(
                                usuarioId,
                                "VENCIDA"
                        )
                        .stream()
                        .filter(r ->
                                r.getFechaLimite() != null
                                        && LocalDateTime.now()
                                        .isBefore(
                                                r.getFechaLimite()
                                                        .plusHours(
                                                                PlazosUtil.margenGraciaHoras(
                                                                        r.getTarea().getFrecuencia()
                                                                )
                                                        )
                                        )
                        )
                        .collect(Collectors.toList());

        List<RegistroTarea> todas =
                new ArrayList<>();

        todas.addAll(enMargen);
        todas.addAll(pendientes);

        return todas.stream()
                .map(InstanciaTareaDTO::new)
                .collect(Collectors.toList());
    }

    // Devuelve las instancias activas de un hogar en los próximos 15 días para TareasHogar
    public List<InstanciaTareaDTO> obtenerInstanciasActivasDelHogar(
            Long hogarId) {

        LocalDateTime limite =
                LocalDateTime.now().plusDays(15);

        return registroTareaDAO
                .findByHogarIdOrderByFechaLimiteAsc(hogarId)
                .stream()
                .filter(r ->
                        "PENDIENTE".equals(r.getEstado())
                                || "VENCIDA".equals(r.getEstado())
                )
                .filter(r ->
                        r.getFechaLimite() == null
                                || r.getFechaLimite()
                                .isBefore(limite)
                )
                .map(InstanciaTareaDTO::new)
                .collect(Collectors.toList());
    }

    // Eliminamos la plantilla y todos sus registros y notificaciones asociadas
    @Transactional
    public void eliminarPlantillaAhora(Long tareaId) {

        // Buscamos todos los registros de la plantilla
        List<RegistroTarea> registros =
                registroTareaDAO.findByTareaId(tareaId);

        // Eliminamos las notificaciones de cada registro
        for (RegistroTarea registro : registros) {

            if (registro.getId() != null) {

                notificacionServicio
                        .eliminarPorReferenciaId(
                                registro.getId());
            }
        }

        // Eliminamos todos los registros
        registroTareaDAO.deleteAll(registros);
        registroTareaDAO.flush();

        // Eliminamos la plantilla
        tareaDAO.deleteById(tareaId);
    }

    // Marcamos la plantilla como inactiva para que no se regenere al completarse el ciclo actual
    @Transactional
    public void eliminarPlantillaAlCompletarse(
            Long tareaId) {

        Tarea tarea =
                tareaDAO.findById(tareaId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "La tarea no existe"
                                ));

        tarea.setActiva(false);
        tareaDAO.save(tarea);
    }

    // Revisamos cada dia a las 6am las tareas inactivas cuya fecha de inicio ya llegó
    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void activarTareasPorFechaInicio() {

        tareaDAO
                .findByActivaFalseAndFechaInicioLessThanEqual(
                        LocalDate.now()
                )
                .forEach(tarea -> {

                    tarea.setActiva(true);
                    tareaDAO.save(tarea);

                    Usuario asignado =
                            tarea.getUsuarioAsignado() != null
                                    ? tarea.getUsuarioAsignado()
                                    : cargaServicio
                                    .buscarMiembroConMenosCarga(
                                            tarea.getHogar().getId()
                                    );

                    LocalDateTime fechaLimite =
                            calcularFechaLimiteInicial(
                                    tarea.getFechaInicio().toString(),
                                    tarea.getFrecuencia()
                            );

                    RegistroTarea primera =
                            new RegistroTarea(
                                    tarea,
                                    tarea.getHogar(),
                                    asignado,
                                    fechaLimite
                            );

                    registroTareaDAO.save(primera);

                    if (asignado != null) {
                        notificarAsignacion(
                                primera,
                                asignado
                        );
                    }
                });
    }

    // Calculamos la fecha límite de la primera instancia según la fecha de inicio y la frecuencia.
    // Las diarias usan su margen de 36 horas ya desde el primer ciclo. El resto de frecuencias con
    // repetición arrancan con un primer ciclo corto (vence mañana) para que se pueda hacer ya mismo;
    // el intervalo completo se aplica a partir del segundo ciclo.
    private LocalDateTime calcularFechaLimiteInicial(
            String fechaInicioStr,
            String frecuencia) {

        LocalDateTime base =
                (fechaInicioStr != null
                        && !fechaInicioStr.isBlank())
                        ? LocalDate
                        .parse(fechaInicioStr)
                        .atStartOfDay()
                        : LocalDateTime.now();

        String frec =
                (frecuencia != null
                        ? frecuencia
                        : "").toUpperCase();

        if (frec.equals("OCASIONAL")) {
            return base.plusDays(15);
        }

        if (frec.equals("DIARIA")) {
            return base.plusHours(36);
        }

        return base.plusDays(1);
    }

    // Notificamos al usuario cuando se le asigna una nueva instancia
    private void notificarAsignacion(
            RegistroTarea registro,
            Usuario asignado) {

        if (asignado == null || registro == null) {
            return;
        }

        try {

            String fechaLimite =
                    registro.getFechaLimite() != null
                            ? registro.getFechaLimite()
                            .toLocalDate()
                            .toString()
                            : "sin fecha";

            notificacionServicio.crear(
                    asignado,
                    registro.getHogar(),
                    TipoNotificacion.TAREA_ASIGNADA,
                    "Nueva tarea asignada",
                    "Tienes una nueva tarea asignada: "
                            + registro.getTarea().getNombre()
                            + ". Fecha límite: "
                            + fechaLimite,
                    registro.getId(),
                    "/feed"
            );

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}