package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.dto.EstadisticasDTO;
import com.fatima.UAHogar.dto.LoginRequest;
import com.fatima.UAHogar.dto.PerfilAjeno;
import com.fatima.UAHogar.dto.RegistroRequest;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.seguridad.JwtServicio;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import com.fatima.UAHogar.servicio.UsuarioServicio;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

    private final UsuarioServicio usuarioServicio;
    private final JwtServicio jwtServicio;

    public UsuarioControlador(UsuarioServicio usuarioService, JwtServicio jwtServicio) {
        this.usuarioServicio = usuarioService;
        this.jwtServicio = jwtServicio;
    }

//Para registrar un usuario nuevo
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegistroRequest datos) {
        Usuario usuarioCreado = usuarioServicio.registrarUsuario(datos);
        return new ResponseEntity<>(usuarioCreado, HttpStatus.CREATED);
    }

    // La respuesta del login incluye el usuario y el token
    public record LoginResponse(Usuario usuario, String token) {}

    @PostMapping("/login")
    public ResponseEntity<?> loginUsuario(@RequestBody LoginRequest request) {
        try {
            Usuario usuarioLogueado = usuarioServicio.validarLogin(
                    request.getUsuario(), request.getPassword());
            String token = jwtServicio.generarToken(
                    usuarioLogueado.getId(),
                    usuarioLogueado.getUsuario(),
                    usuarioLogueado.getRolGlobal());
            return new ResponseEntity<>(
                    new LoginResponse(usuarioLogueado, token), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            //401 para credencial incorrecto o cuenta bloqueada
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    //Devuelve los datos de un usuario concreto para cargar su perfil/feed
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable Long id) {
        Usuario usuario = usuarioServicio.buscarPorId(id);

        if (usuario != null) {
            return new ResponseEntity<>(usuario, HttpStatus.OK);
        }

        return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
    }

    public record EditarPerfilRequest(
            String nombre,
            String usuario,
            String email,
            String telefono,
            String imagenPerfil,
            String contrasenaActual,
            String nuevaContrasena
    ) {}

    //Actualiza el perfil de un usuario y devuelve el usuario actualizado
    @PutMapping("/{id}/editar")
    public ResponseEntity<?> editarPerfilUsuario(
            @PathVariable Long id,
            @RequestBody EditarPerfilRequest request) {

        if (!id.equals(UsuarioActual.id())) {
            throw new SecurityException("No puedes editar el perfil de otro usuario.");
        }

        try {
            Usuario usuarioActualizado = usuarioServicio.editarPerfil(
                    id,
                    request.nombre(),
                    request.usuario(),
                    request.email(),
                    request.telefono(),
                    request.imagenPerfil(),
                    request.contrasenaActual(),
                    request.nuevaContrasena()
            );

            usuarioActualizado.setPassword(null);

            // Devolvemos el usuario actualizado
            return new ResponseEntity<>(usuarioActualizado, HttpStatus.OK);

        } catch (DataIntegrityViolationException e) {
            // Error si el usuario o email ya existen en la BD
            return new ResponseEntity<>(
                    "El nombre de usuario o email ya están en uso.",
                    HttpStatus.CONFLICT);
        }
    }

    //Devuelve info del usuario que visitas
    @GetMapping("/{id}/perfil-ajeno")
    public ResponseEntity<?> obtenerPerfilAjeno(
            @PathVariable Long id,
            @RequestParam Long miId) {

        if (!miId.equals(UsuarioActual.id())) {
            throw new SecurityException(
                    "No puedes consultar estadísticas compartidas en nombre de otro usuario.");
        }

        Usuario usuarioVisitado = usuarioServicio.buscarPorId(id);

        if (usuarioVisitado == null || usuarioServicio.esUsuarioEliminado(usuarioVisitado)) {
            return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
        }

        EstadisticasDTO estadisticas =
                usuarioServicio.obtenerEstadisticasCompartidas(id, miId);

        PerfilAjeno respuesta = new PerfilAjeno(
                usuarioVisitado.getId(),
                usuarioVisitado.getNombre(),
                usuarioVisitado.getUsuario(),
                usuarioVisitado.getImagenPerfil(),
                estadisticas.getPuntosComunes(),
                estadisticas.getTareasComunes()
        );

        return new ResponseEntity<>(respuesta, HttpStatus.OK);
    }

    public record EliminarCuentaRequest(String password) {}

    // Elimina la propia cuenta del usuario
    @DeleteMapping("/cuenta")
    public ResponseEntity<?> eliminarMiCuenta(@RequestBody EliminarCuentaRequest request) {
        Long usuarioId = UsuarioActual.id();

        try {
            usuarioServicio.verificarPassword(usuarioId, request.password());
            usuarioServicio.salirDeHogaresYPlantillas(usuarioId);
            usuarioServicio.intentarBorrarFila(usuarioId);
            return ResponseEntity.ok("Tu cuenta ha sido eliminada correctamente.");

        } catch (DataAccessException e) {
            // No se pudo borrar del todo por tener datos asociados
            usuarioServicio.anonimizarComoAlternativaAlBorrado(usuarioId);
            return ResponseEntity.ok(
                    "Tu cuenta ha sido eliminada. Como tenías datos asociados que no se pueden borrar sin afectar a otras personas (mensajes, tareas completadas...), se han borrado tus datos personales y la cuenta ha quedado bloqueada.");
        }
    }
}
