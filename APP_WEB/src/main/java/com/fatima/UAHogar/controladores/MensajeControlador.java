package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.modelo.Mensaje;
import com.fatima.UAHogar.modelo.MensajeGrupo;
import com.fatima.UAHogar.modelo.MensajePrivado;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import com.fatima.UAHogar.servicio.HogarServicio;
import com.fatima.UAHogar.servicio.MensajeServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mensajes")
public class MensajeControlador {

    private final MensajeServicio mensajeServicio;
    private final HogarServicio hogarServicio;

    public MensajeControlador(MensajeServicio mensajeServicio, HogarServicio hogarServicio) {
        this.mensajeServicio = mensajeServicio;
        this.hogarServicio = hogarServicio;
    }

    // Grupo

    // Obtener los mensajes del grupo de un hogar
    @GetMapping("/grupo/{hogarId}")
    public ResponseEntity<?> getMensajesGrupo(@PathVariable Long hogarId) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), hogarId);
        List<MensajeGrupo> mensajes = mensajeServicio.getMensajesGrupo(hogarId);
        Map<Long, Map<String, Object>> reacciones = mensajeServicio.obtenerReaccionesPorMensajes(
                mensajes.stream().map(Mensaje::getId).toList(), UsuarioActual.id());
        List<Map<String, Object>> dtos = mensajes.stream()
                .map(m -> aMapa(m, "GRUPO", reacciones.get(m.getId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Enviar un mensaje al grupo del hogar
    @PostMapping("/grupo")
    public ResponseEntity<?> enviarGrupo(@RequestBody EnviarGrupoRequest req) {
        hogarServicio.verificarPertenencia(UsuarioActual.id(), req.hogarId());
        MensajeGrupo msg = mensajeServicio.enviarMensajeGrupo(
                req.hogarId(), UsuarioActual.id(), req.contenido());
        return ResponseEntity.status(HttpStatus.CREATED).body(aMapa(msg, "GRUPO"));
    }

    //Privado

    // Obtener la conversación privada con otro usuario
    @GetMapping("/privado")
    public ResponseEntity<?> getMensajesPrivados(@RequestParam Long otroId) {
        List<MensajePrivado> mensajes = mensajeServicio.getMensajesPrivados(
                UsuarioActual.id(), otroId);
        Map<Long, Map<String, Object>> reacciones = mensajeServicio.obtenerReaccionesPorMensajes(
                mensajes.stream().map(Mensaje::getId).toList(), UsuarioActual.id());
        List<Map<String, Object>> dtos = mensajes.stream()
                .map(m -> aMapa(m, "PRIVADO", reacciones.get(m.getId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Enviar un mensaje privado a otro usuario
    @PostMapping("/privado")
    public ResponseEntity<?> enviarPrivado(@RequestBody EnviarPrivadoRequest req) {
        MensajePrivado msg = mensajeServicio.enviarMensajePrivado(
                UsuarioActual.id(), req.receptorId(), req.contenido());
        return ResponseEntity.status(HttpStatus.CREATED).body(aMapa(msg, "PRIVADO"));
    }

    // Acciones sobre mensajes

    // Editar un mensaje
    @PutMapping("/{id}")
    public ResponseEntity<?> editarMensaje(@PathVariable Long id, @RequestBody EditarMensajeRequest req) {
        Mensaje msg = mensajeServicio.editarMensaje(id, UsuarioActual.id(), req.nuevoContenido());
        String tipo = (msg instanceof MensajeGrupo) ? "GRUPO" : "PRIVADO";
        return ResponseEntity.ok(aMapa(msg, tipo));
    }

    // Borrado de un mensaje propio
    @DeleteMapping("/{id}")
    public ResponseEntity<?> borrarMensaje(@PathVariable Long id) {
        mensajeServicio.borrarMensaje(id, UsuarioActual.id());
        return ResponseEntity.noContent().build();
    }

    // Reacciona a un mensaje
    @PutMapping("/{id}/reacciones")
    public ResponseEntity<?> reaccionar(@PathVariable Long id, @RequestBody ReaccionRequest req) {
        mensajeServicio.alternarReaccion(id, UsuarioActual.id(), req.tipoReaccion());
        Map<String, Object> resumen = mensajeServicio.obtenerReacciones(id, UsuarioActual.id());
        return ResponseEntity.ok(resumen);
    }

    // Convierte el mensaje a mapa
    private Map<String, Object> aMapa(Mensaje m, String tipo, Map<String, Object> reacciones) {
        Map<String, Object> mapa = new LinkedHashMap<>();
        mapa.put("id", m.getId());
        mapa.put("contenido", m.getContenido());
        mapa.put("fechaEnvio", m.getFechaEnvio().toString());
        mapa.put("remitenteId", m.getRemitente().getId());
        mapa.put("remitente", m.getRemitente().getNombre());
        mapa.put("avatar", m.getRemitente().getImagenPerfil() != null ? m.getRemitente().getImagenPerfil() : "");
        mapa.put("tipo", tipo);
        mapa.put("editadoEn", m.getEditadoEn() != null ? m.getEditadoEn().toString() : null);
        mapa.put("esEditado", m.esEditado());
        mapa.put("reacciones", reacciones);

        if (m instanceof MensajeGrupo mg) {
            mapa.put("hogarId", mg.getHogar().getId());
        } else if (m instanceof MensajePrivado mp) {
            mapa.put("receptorId", mp.getReceptor().getId());
        }
        return mapa;
    }

    // Consulta sus reacciones
    private Map<String, Object> aMapa(Mensaje m, String tipo) {
        Map<String, Object> reacciones = mensajeServicio.obtenerReacciones(m.getId(), UsuarioActual.id());
        return aMapa(m, tipo, reacciones);
    }

    // Records para los request bodies
    public record EnviarGrupoRequest(Long hogarId, String contenido) {}
    public record EnviarPrivadoRequest(Long receptorId, String contenido) {}
    public record EditarMensajeRequest(String nuevoContenido) {}
    public record ReaccionRequest(String tipoReaccion) {}
}
