package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.util.ZonaHorariaApp;

import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.DAO.RegistroTareaDAO;
import com.fatima.UAHogar.DAO.TareaDAO;
import com.fatima.UAHogar.DAO.UsuarioDAO;
import com.fatima.UAHogar.modelo.Hogar;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.RegistroTarea;
import com.fatima.UAHogar.modelo.Tarea;
import com.fatima.UAHogar.modelo.TipoNotificacion;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.util.PlazosUtil;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegistroTareaServicio {

    private final RegistroTareaDAO registroTareaDAO;
    private final TareaDAO tareaDAO;
    private final UsuarioDAO usuarioDAO;
    private final MiembroHogarDAO miembroHogarDAO;
    private final CargaServicio cargaServicio;
    private final NotificacionServicio notificacionServicio;

    public RegistroTareaServicio(
            RegistroTareaDAO registroTareaDAO,
            TareaDAO tareaDAO,
            UsuarioDAO usuarioDAO,
            MiembroHogarDAO miembroHogarDAO,
            CargaServicio cargaServicio,
            NotificacionServicio notificacionServicio) {
        this.registroTareaDAO = registroTareaDAO;
        this.tareaDAO = tareaDAO;
        this.usuarioDAO = usuarioDAO;
        this.miembroHogarDAO = miembroHogarDAO;
        this.cargaServicio = cargaServicio;
        this.notificacionServicio = notificacionServicio;
    }

    // Marca una tarea como completada y genera la siguiente instancia
    @Transactional
    public RegistroTarea completarTarea(Long tareaId, Long usuarioId, String imagenUrl) {
        Tarea tarea = tareaDAO.findById(tareaId)
                .orElseThrow(() -> new IllegalArgumentException("La tarea no existe"));

        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));

        MiembroHogar perfilMiembro = miembroHogarDAO.findByUsuarioIdAndHogarId(usuarioId, tarea.getHogar().getId())
                .orElseThrow(() -> new IllegalArgumentException("El usuario no pertenece al hogar de esta tarea"));

        // Buscamos la instancia pendiente de esta tarea para este usuario
        List<RegistroTarea> pendientes = registroTareaDAO.findByUsuarioAsignadoIdAndHogarIdAndEstado(
                usuarioId, tarea.getHogar().getId(), "PENDIENTE");

        RegistroTarea instancia = pendientes.stream()
                .filter(r -> r.getTarea().getId().equals(tareaId))
                .findFirst()
                .orElse(null);

        // Si no hay instancia pendiente buscamos una vencida dentro del margen de gracia
        if (instancia == null) {
            List<RegistroTarea> enMargen = registroTareaDAO.findByUsuarioAsignadoIdAndHogarIdAndEstado(
                    usuarioId, tarea.getHogar().getId(), "VENCIDA");

            instancia = enMargen.stream()
                    .filter(r -> r.getTarea().getId().equals(tareaId))
                    .filter(r -> r.getFechaLimite() != null && LocalDateTime.now(ZonaHorariaApp.ZONA).isBefore(
                            r.getFechaLimite().plusHours(PlazosUtil.margenGraciaHoras(tarea.getFrecuencia()))))
                    .findFirst()
                    .orElse(null);
        }

// Si no es suya, comprueba si la tarea está en la bolsa
        if (instancia == null) {
            List<RegistroTarea> enBolsa = registroTareaDAO
                    .findByHogarIdAndUsuarioAsignadoIsNullAndEstado(tarea.getHogar().getId(), "PENDIENTE");

            instancia = enBolsa.stream()
                    .filter(r -> r.getTarea().getId().equals(tareaId))
                    .findFirst()
                    .orElse(null);}


        //  Si no es suya ni está libre, RECHAZA la petición
        if (instancia == null) {
            throw new IllegalArgumentException(
                    "Esta tarea no está asignada a este usuario ni disponible para completar.");
        }

        // Comprobamos si está dentro del margen de gracia
        long margenHoras = PlazosUtil.margenGraciaHoras(tarea.getFrecuencia());
        boolean dentroDelMargen = instancia.getFechaLimite() != null
                && LocalDateTime.now(ZonaHorariaApp.ZONA).isAfter(instancia.getFechaLimite())
                && LocalDateTime.now(ZonaHorariaApp.ZONA).isBefore(instancia.getFechaLimite().plusHours(margenHoras));

        // En plazo: 100% — margen de gracia: 70%
        int puntosFinales = dentroDelMargen ? (int) Math.round(tarea.getPuntos() * 0.70) : tarea.getPuntos();
        int penalizacion = tarea.getPuntos() - puntosFinales;

        // Actualizamos la instancia
        instancia.setUsuario(usuario);
        instancia.setEstado("COMPLETADA");
        instancia.setFechaCompletada(LocalDateTime.now(ZonaHorariaApp.ZONA));
        instancia.setPuntosSumados(puntosFinales);
        instancia.setPenalizacion(penalizacion);
        instancia.setImagenUrl(imagenUrl);
        registroTareaDAO.save(instancia);

        // Creamos la siguiente instancia
        generarSiguienteInstancia(tarea, tarea.getHogar());

        // Avisamos al resto del hogar
        notificarCompletada(instancia, usuario, penalizacion, dentroDelMargen);

        return instancia;
    }

    // Crea la siguiente instancia pendiente cuando se completa la anterior
    private void generarSiguienteInstancia(Tarea tarea, Hogar hogar) {
        if (tarea.getActiva() == null || !tarea.getActiva()) return;
        if ("OCASIONAL".equalsIgnoreCase(tarea.getFrecuencia())) return;

        if (registroTareaDAO.existsByTareaIdAndHogarIdAndEstado(tarea.getId(), hogar.getId(), "PENDIENTE")) {
            return;
        }

        LocalDateTime nuevaFechaLimite = calcularSiguienteFechaLimite(tarea.getFrecuencia());
        Usuario siguienteAsignado = cargaServicio.buscarMiembroConMenosCarga(hogar.getId());

        RegistroTarea nueva = new RegistroTarea(tarea, hogar, siguienteAsignado, nuevaFechaLimite);
        registroTareaDAO.save(nueva);

        if (siguienteAsignado != null) {
            notificarAsignacion(nueva, siguienteAsignado);
        }
    }

    // Revisa cada hora las instancias cuyo margen de gracia ya se ha agotado
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void procesarVencidas() {
        LocalDateTime ahora = LocalDateTime.now(ZonaHorariaApp.ZONA);
        List<RegistroTarea> vencidasPorFecha = registroTareaDAO.findByEstadoAndFechaLimiteBefore("PENDIENTE", ahora);

        List<RegistroTarea> vencidas = vencidasPorFecha.stream()
                .filter(r -> {
                    if (r.getFechaLimite() == null) return false;
                    long margenHoras = PlazosUtil.margenGraciaHoras(r.getTarea().getFrecuencia());
                    return ahora.isAfter(r.getFechaLimite().plusHours(margenHoras));
                })
                .collect(Collectors.toList());

        for (RegistroTarea registro : vencidas) {
            int penalizacion = calcularPenalizacionVencimiento(registro.getTarea().getPuntos());

            registro.setEstado("VENCIDA");
            registro.setPenalizacion(penalizacion);
            registroTareaDAO.save(registro);

// resta directamente desde este registro
            if (registro.getUsuarioAsignado() != null) {
                notificarVencimiento(registro, penalizacion);
            }
        }
    }

    // Puntos de un usuario en un hogar durante un mes y año concreto
    public Integer obtenerPuntosPorMesYAnio(Long usuarioId, Long hogarId, int mes, int anio) {
        YearMonth mesSeleccionado = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = mesSeleccionado.atDay(1).atStartOfDay();
        LocalDateTime finMes = mesSeleccionado.atEndOfMonth().atTime(23, 59, 59);

        return registroTareaDAO.sumarPuntosPorMes(usuarioId, hogarId, inicioMes, finMes);
    }

    // Puntos de un usuario en un hogar durante el mes actual
    public Integer obtenerPuntosMesActual(Long usuarioId, Long hogarId) {
        YearMonth ahora = YearMonth.now();
        return obtenerPuntosPorMesYAnio(usuarioId, hogarId, ahora.getMonthValue(), ahora.getYear());
    }

    // Puntos totales del mes actual sumando todos los hogares
    public Integer obtenerPuntosTotalesMesActual(Long usuarioId) {
        YearMonth ahora = YearMonth.now();
        LocalDateTime inicioMes = ahora.atDay(1).atStartOfDay();
        LocalDateTime finMes = ahora.atEndOfMonth().atTime(23, 59, 59);

        return registroTareaDAO.sumarPuntosTotalesPorMes(usuarioId, inicioMes, finMes);
    }

    // Total de tareas completadas por un usuario
    public Integer obtenerTotalTareasCompletadas(Long usuarioId) {
        return registroTareaDAO.contarTareasCompletadasTotales(usuarioId);
    }

    // Tareas completadas en hogares que dos usuarios comparten
    public List<RegistroTarea> obtenerTareasRecientesEntreUsuarios(Long usuarioId, Long miId) {
        return registroTareaDAO.findTareasComunes(usuarioId, miId, PageRequest.of(0, 20));
    }

    // Historial paginado de tareas completadas en un hogar
    public List<RegistroTarea> obtenerHistorialHogar(Long hogarId, int pagina, int limite) {
        List<RegistroTarea> todos = registroTareaDAO.findByHogarIdAndEstadoOrderByFechaCompletadaDesc(hogarId, "COMPLETADA");
        int desde = pagina * limite;

        if (desde >= todos.size()) {
            return Collections.emptyList();
        }

        return todos.subList(desde, Math.min(desde + limite, todos.size()));
    }

    // Instancias pendientes de un usuario ordenadas por fecha límite
    public List<RegistroTarea> obtenerPendientesDeUsuario(Long usuarioId) {
        return registroTareaDAO.findByUsuarioAsignadoIdAndEstadoOrderByFechaLimiteAsc(usuarioId, "PENDIENTE");
    }

    // Libera las tareas de un miembro y las redistribuye
    @Transactional
    public void redistribuirTareasDeMiembro(Long usuarioId, Long hogarId) {
        List<RegistroTarea> pendientes = registroTareaDAO.findByUsuarioAsignadoIdAndHogarIdAndEstado(usuarioId, hogarId, "PENDIENTE");
        List<RegistroTarea> vencidas = registroTareaDAO.findByUsuarioAsignadoIdAndHogarIdAndEstado(usuarioId, hogarId, "VENCIDA");

        List<RegistroTarea> aRedistribuir = new ArrayList<>();
        aRedistribuir.addAll(pendientes);
        aRedistribuir.addAll(vencidas);

        if (aRedistribuir.isEmpty()) return;

        // Las liberamos primero
        for (RegistroTarea registro : aRedistribuir) {
            registro.setUsuarioAsignado(null);
        }
        registroTareaDAO.saveAll(aRedistribuir);

        // Miembros restantes ordenados por carga
        List<Usuario> miembrosRestantes = cargaServicio.ordenarMiembrosPorCarga(hogarId);
        if (miembrosRestantes.isEmpty()) return;

        int indice = 0;
        for (RegistroTarea registro : aRedistribuir) {
            Usuario nuevoAsignado = miembrosRestantes.get(indice % miembrosRestantes.size());
            indice++;
            registro.setUsuarioAsignado(nuevoAsignado);
            registroTareaDAO.save(registro);
            notificarAsignacion(registro, nuevoAsignado);
        }
    }

    // Recalcula la carga cuando entra un nuevo miembro
    @Transactional
    public void recalcularCargaPorNuevoMiembro(Long hogarId) {
        List<RegistroTarea> pendientes = registroTareaDAO.findByHogarIdAndEstado(hogarId, "PENDIENTE");
        if (pendientes.isEmpty()) return;

        List<Usuario> miembros = cargaServicio.ordenarMiembrosPorCarga(hogarId);
        if (miembros.isEmpty()) return;

        int indice = 0;
        for (RegistroTarea registro : pendientes) {
            Usuario nuevoAsignado = miembros.get(indice % miembros.size());
            indice++;

            Usuario asignadoActual = registro.getUsuarioAsignado();
            if (asignadoActual != null && asignadoActual.getId().equals(nuevoAsignado.getId())) {
                continue;
            }

            registro.setUsuarioAsignado(nuevoAsignado);
            registroTareaDAO.save(registro);
            notificarAsignacion(registro, nuevoAsignado);
        }
    }

    // Penalización por vencimiento definitivo
    private int calcularPenalizacionVencimiento(int puntosTarea) {
        return Math.max(1, (int) Math.round(puntosTarea * 0.30));
    }

    // Calcula la fecha límite de la siguiente instancia
    private LocalDateTime calcularSiguienteFechaLimite(String frecuencia) {
        LocalDateTime ahora = LocalDateTime.now(ZonaHorariaApp.ZONA);
        switch ((frecuencia != null ? frecuencia : "").toUpperCase()) {
            case "DIARIA": return ahora.plusHours(36);
            case "SEMANAL": return ahora.plusDays(7);
            case "MENSUAL": return ahora.plusDays(30);
            default: return ahora.plusDays(14);
        }
    }

    // Notifica al resto del hogar cuando alguien completa una tarea
    private void notificarCompletada(RegistroTarea registro, Usuario usuario, int penalizacion, boolean conMargen) {
        try {
            List<MiembroHogar> miembros = miembroHogarDAO.findByHogarId(registro.getHogar().getId());

            for (MiembroHogar miembro : miembros) {
                Long miembroId = miembro.getUsuario().getId();
                Long usuarioId = usuario.getId();
                if (miembroId.equals(usuarioId)) continue;

                String mensaje = usuario.getNombre() + " ha completado " + registro.getTarea().getNombre()
                        + " (+" + registro.getPuntosSumados() + " pts)";

                if (conMargen) {
                    mensaje += " con retraso dentro del margen de gracia";
                }

                notificacionServicio.crear(
                        miembro.getUsuario(),
                        registro.getHogar(),
                        TipoNotificacion.TAREA_COMPLETADA,
                        "Tarea completada",
                        mensaje,
                        registro.getId(),
                        "/feed"
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Notifica al usuario asignado cuando se le asigna una nueva tarea
    private void notificarAsignacion(RegistroTarea registro, Usuario asignado) {
        if (registro == null || asignado == null) return;

        try {
            String fechaLimite = registro.getFechaLimite() != null
                    ? registro.getFechaLimite().toLocalDate().toString()
                    : "sin fecha";

            notificacionServicio.crear(
                    asignado,
                    registro.getHogar(),
                    TipoNotificacion.TAREA_ASIGNADA,
                    "Nueva tarea asignada",
                    "Tienes una nueva tarea asignada: " + registro.getTarea().getNombre() + ". Fecha límite: " + fechaLimite,
                    registro.getId(),
                    "/feed"
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Notifica al usuario cuando su tarea ha vencido definitivamente tras el margen de gracia
    private void notificarVencimiento(RegistroTarea registro, int penalizacion) {
        if (registro == null || registro.getUsuarioAsignado() == null) return;

        try {
            notificacionServicio.crear(
                    registro.getUsuarioAsignado(),
                    registro.getHogar(),
                    TipoNotificacion.TAREA_VENCIDA,
                    "Tarea vencida",
                    "Se te ha pasado el plazo de " + registro.getTarea().getNombre() + ". Penalización de " + penalizacion + " pts.",
                    registro.getId(),
                    "/feed"
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}