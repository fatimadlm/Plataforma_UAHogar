package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.dto.IntercambioTareaDTO;
import com.fatima.UAHogar.modelo.IntercambioTarea;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import com.fatima.UAHogar.servicio.HogarServicio;
import com.fatima.UAHogar.servicio.IntercambioTareaServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/intercambios")
public class IntercambioTareaControlador {

    private final IntercambioTareaServicio intercambioTareaServicio;
    private final HogarServicio hogarServicio;

    public IntercambioTareaControlador(IntercambioTareaServicio intercambioTareaServicio, HogarServicio hogarServicio) {
        this.intercambioTareaServicio = intercambioTareaServicio;
        this.hogarServicio = hogarServicio;
    }

    // Datos necesarios para solicitar un intercambio
    public record SolicitarIntercambioRequest(Long registroTareaId, Long destinatarioId) {}

    // Solicitamos intercambiar una tarea propia con otro miembro
    @PostMapping("/solicitar")
    public ResponseEntity<?> solicitar(@RequestBody SolicitarIntercambioRequest request) {
        IntercambioTarea nuevo = intercambioTareaServicio.solicitarIntercambio(
                request.registroTareaId(), UsuarioActual.id(), request.destinatarioId());
        return ResponseEntity.status(HttpStatus.CREATED).body(new IntercambioTareaDTO(nuevo));
    }

    // Obtenemos los detalles de una solicitud verificando la pertenencia al hogar
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        IntercambioTarea intercambio = intercambioTareaServicio.obtenerPorId(id);
        hogarServicio.verificarPertenencia(
                UsuarioActual.id(), intercambio.getRegistroTarea().getHogar().getId());
        return ResponseEntity.ok(new IntercambioTareaDTO(intercambio));
    }

    // Aceptamos la solicitud de intercambio
    @PutMapping("/{id}/aceptar")
    public ResponseEntity<?> aceptar(@PathVariable Long id) {
        IntercambioTarea aceptado = intercambioTareaServicio.aceptarIntercambio(
                id, UsuarioActual.id());
        return ResponseEntity.ok(new IntercambioTareaDTO(aceptado));
    }

    // Rechazamos la solicitud de intercambio
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazar(@PathVariable Long id) {
        IntercambioTarea rechazado = intercambioTareaServicio.rechazarIntercambio(
                id, UsuarioActual.id());
        return ResponseEntity.ok(new IntercambioTareaDTO(rechazado));
    }

    // Obtenemos las solicitudes pendientes recibidas por el usuario actual
    @GetMapping("/recibidas/{usuarioId}")
    public ResponseEntity<?> obtenerRecibidas(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes ver las solicitudes de otro usuario.");
        }

        List<IntercambioTareaDTO> dtos = intercambioTareaServicio.obtenerRecibidasPendientes(usuarioId)
                .stream().map(IntercambioTareaDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Obtenemos las solicitudes enviadas por el usuario actual
    @GetMapping("/enviadas/{usuarioId}")
    public ResponseEntity<?> obtenerEnviadas(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes ver las solicitudes de otro usuario.");
        }

        List<IntercambioTareaDTO> dtos = intercambioTareaServicio.obtenerEnviadas(usuarioId)
                .stream().map(IntercambioTareaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
