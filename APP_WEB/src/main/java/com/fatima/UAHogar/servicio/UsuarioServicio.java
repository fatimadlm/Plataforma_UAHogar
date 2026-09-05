package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.DAO.*;
import com.fatima.UAHogar.dto.*;
import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.Tarea;
import com.fatima.UAHogar.modelo.TipoAccionAuditoria;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioServicio {

    private final UsuarioDAO usuarioDAO;
    private final MiembroHogarDAO miembroHogarDAO;
    private final RegistroTareaDAO registrotareaDAO;
    private final TareaDAO tareaDAO;
    private final PasswordEncoder passwordEncoder;
    private final HogarServicio hogarServicio;
    private final AuditoriaServicio auditoriaServicio;

    public UsuarioServicio(UsuarioDAO usuarioDAO, MiembroHogarDAO miembroHogarDAO,
                           RegistroTareaDAO registrotareaDAO, TareaDAO tareaDAO, PasswordEncoder passwordEncoder,
                           HogarServicio hogarServicio, AuditoriaServicio auditoriaServicio) {
        this.usuarioDAO = usuarioDAO;
        this.miembroHogarDAO = miembroHogarDAO;
        this.registrotareaDAO = registrotareaDAO;
        this.tareaDAO = tareaDAO;
        this.passwordEncoder = passwordEncoder;
        this.hogarServicio = hogarServicio;
        this.auditoriaServicio = auditoriaServicio;
    }

    // Registra un nuevo usuario cifrando la contraseña.
    public Usuario registrarUsuario(RegistroRequest datos) {

        // Validamos que los datos no vengan vacíos
        if (datos.email() == null || datos.email().trim().isEmpty()) {
            throw new IllegalArgumentException("El email es obligatorio.");
        }
        if (datos.usuario() == null || datos.usuario().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario es obligatorio.");
        }
        if (datos.telefono() == null || datos.telefono().trim().isEmpty()) {
            throw new IllegalArgumentException("El teléfono es obligatorio.");
        }
        if (datos.password() == null || datos.password().trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es obligatoria.");
        }

        // Comprobamos que el email no esté repetido
        Optional<Usuario> emailExistente = usuarioDAO.findByEmail(datos.email());
        if (emailExistente.isPresent()) {
            throw new IllegalArgumentException("Ya existe un usuario con el email: " + datos.email());
        }

        // Comprobamos que el nombre de usuario no esté repetido
        Optional<Usuario> usuarioExistente = usuarioDAO.findByUsuario(datos.usuario());
        if (usuarioExistente.isPresent()) {
            throw new IllegalArgumentException("El nombre de usuario '" + datos.usuario() + "' ya está en uso. Por favor, elige otro.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(datos.nombre());
        nuevoUsuario.setUsuario(datos.usuario());
        nuevoUsuario.setEmail(datos.email());
        nuevoUsuario.setTelefono(datos.telefono());
        nuevoUsuario.setImagenPerfil(datos.imagenPerfil());

        // Cifrado de contraseña antes de guardar en base de datos
        nuevoUsuario.setPassword(passwordEncoder.encode(datos.password()));

        return usuarioDAO.save(nuevoUsuario);
    }

    // Comprueba credenciales comparando el texto plano con el hash
    public Usuario validarLogin(String nombreUsuario, String password) {

        // Buscamos al usuario en la base de datos
        Optional<Usuario> usuarioOpt = usuarioDAO.findByUsuario(nombreUsuario);

        // Si no existe, da error
        if (usuarioOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuario o contraseña incorrectos.");
        }

        Usuario usuario = usuarioOpt.get();

        // Verificación segura mediante matches
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new IllegalArgumentException("Usuario o contraseña incorrectos.");
        }

        // Si el supervisor ha bloqueado la cuenta, no puede iniciar sesión
        if (usuario.isBloqueado()) {
            throw new IllegalArgumentException("Cuenta bloqueada. Contacta con un supervisor de UAHogar.");
        }

        // Devuelve el usuario si todo está bien
        return usuario;
    }

    @Transactional
    public Usuario editarPerfil(Long usuarioId, String nombre, String username, String email,
                                String telefono, String imagenPerfil, String contrasenaActual, String nuevaContrasena) {

        //Buscamos al usuario
        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        //Actualizamos los datos
        usuario.setNombre(nombre);
        usuario.setUsuario(username);
        usuario.setEmail(email);
        usuario.setTelefono(telefono);

        if (imagenPerfil != null) {
            usuario.setImagenPerfil(imagenPerfil);
        }

        // Cambio de contraseña seguro
        if (nuevaContrasena != null && !nuevaContrasena.trim().isEmpty()) {
            if (contrasenaActual == null || !passwordEncoder.matches(contrasenaActual, usuario.getPassword())) {
                throw new IllegalArgumentException("La contraseña actual es incorrecta.");
            }
            usuario.setPassword(passwordEncoder.encode(nuevaContrasena));
        }

        return usuarioDAO.save(usuario);
    }

    public Usuario buscarPorId(Long id) {
        return usuarioDAO.findById(id).orElse(null);
    }

    // Comprueba la contrasena actual de un usuario
    public void verificarPassword(Long usuarioId, String password) {
        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (password == null || password.isBlank() || !passwordEncoder.matches(password, usuario.getPassword())) {
            throw new IllegalArgumentException("La contrasena es incorrecta.");
        }
    }

    public EstadisticasDTO obtenerEstadisticasCompartidas(Long usuarioId, Long miId) {
        // Buscamos los hogares comunes usando el miembroHogarDAO
        List<Long> hogaresComunes = miembroHogarDAO.findHogaresComunes(usuarioId, miId);

        // Si no comparten hogares, devolvemos 0 y 0
        if (hogaresComunes.isEmpty()) {
            return new EstadisticasDTO(0, 0);
        }

        //  Sumamos las tareas usando el tareaDAO
        long tareas = registrotareaDAO.countByUsuarioIdAndHogarIdIn(usuarioId, hogaresComunes);

        // Sumamos puntos usando el tareaDAO
        Long puntosResult = registrotareaDAO.sumPuntosByUsuarioIdAndHogarIdIn(usuarioId, hogaresComunes);
        long puntos = (puntosResult != null) ? puntosResult : 0L;

        return new EstadisticasDTO(puntos, tareas);
    }

    // Panel de Supervisor

    // Listado de usuarios con busqueda por nombre/usuario/email y filtro por estado
    public List<Usuario> buscarParaSupervision(String busqueda, String estado) {
        String texto = busqueda == null ? "" : busqueda.trim().toLowerCase();

        return usuarioDAO.findAll().stream()
                .filter(u -> texto.isEmpty()
                        || u.getNombre().toLowerCase().contains(texto)
                        || u.getUsuario().toLowerCase().contains(texto)
                        || u.getEmail().toLowerCase().contains(texto))
                .filter(u -> estado == null || estado.isBlank()
                        || ("bloqueado".equalsIgnoreCase(estado) && u.isBloqueado())
                        || ("activo".equalsIgnoreCase(estado) && !u.isBloqueado()))
                .toList();
    }

    // Alterna el bloqueo de un usuario
    @Transactional
    public Usuario alternarBloqueo(Long usuarioId) {
        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.setBloqueado(!usuario.isBloqueado());
        Usuario guardado = usuarioDAO.save(usuario);

        // Registramos si quedo bloqueado o desbloqueado, segun el estado final
        TipoAccionAuditoria accion = guardado.isBloqueado()
                ? TipoAccionAuditoria.BLOQUEAR_USUARIO
                : TipoAccionAuditoria.DESBLOQUEAR_USUARIO;
        String detalles = (guardado.isBloqueado() ? "Bloqueo" : "Desbloqueo") + " al usuario @" + guardado.getUsuario();
        auditoriaServicio.registrar(UsuarioActual.id(), accion, detalles);

        return guardado;
    }

    // Da permisos de SUPERVISOR o vuelve a USER
    @Transactional
    public Usuario cambiarRolGlobal(Long usuarioId, String nuevoRol) {
        if (!"USER".equals(nuevoRol) && !"SUPERVISOR".equals(nuevoRol)) {
            throw new IllegalArgumentException("El rol debe ser USER o SUPERVISOR");
        }

        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.setRolGlobal(nuevoRol);
        Usuario guardado = usuarioDAO.save(usuario);

        auditoriaServicio.registrar(UsuarioActual.id(), TipoAccionAuditoria.CAMBIAR_ROL,
                "Cambio el rol de @" + guardado.getUsuario() + " a " + nuevoRol);

        return guardado;
    }
//Saca a usuario de sus hogares
    @Transactional
    public void salirDeHogaresYPlantillas(Long usuarioId) {
        List<MiembroHogar> membresias = miembroHogarDAO.findByUsuarioId(usuarioId);
        for (MiembroHogar membresia : membresias) {
            hogarServicio.abandonarHogar(usuarioId, membresia.getHogar().getId());
        }

        List<Tarea> plantillasAsignadas = tareaDAO.findByUsuarioAsignadoId(usuarioId);
        for (Tarea plantilla : plantillasAsignadas) {
            plantilla.setUsuarioAsignado(null);
        }
        tareaDAO.saveAll(plantillasAsignadas);
    }

    // Intentamos borrar datos asociados de usuario
    @Transactional
    public void intentarBorrarFila(Long usuarioId) {
        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String nombreUsuario = usuario.getUsuario();

        usuarioDAO.delete(usuario);
        usuarioDAO.flush();

        auditoriaServicio.registrar(UsuarioActual.id(), TipoAccionAuditoria.ELIMINAR_USUARIO,
                "Elimino al usuario @" + nombreUsuario);
    }

//Anoniminzamos si el usuario tiene entidades pendientes
    @Transactional
    public void anonimizarComoAlternativaAlBorrado(Long usuarioId) {
        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String nombreOriginal = usuario.getUsuario();

        usuario.setNombre("Usuario eliminado");
        usuario.setUsuario("usuario_eliminado_" + usuarioId);
        usuario.setEmail("eliminado_" + usuarioId + "@uahogar.local");
        usuario.setTelefono("000000000");
        usuario.setImagenPerfil(null);
        usuario.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        usuario.setRolGlobal("USER");
        usuario.setBloqueado(true);

        usuarioDAO.save(usuario);

        auditoriaServicio.registrar(UsuarioActual.id(), TipoAccionAuditoria.ELIMINAR_USUARIO,
                "Anonimizo al usuario @" + nombreOriginal + " (no se pudo borrar del todo)");
    }

    // Comprueba si una cuenta fue anonimizada
    public boolean esUsuarioEliminado(Usuario usuario) {
        return usuario != null
                && usuario.getUsuario() != null
                && usuario.getUsuario().startsWith("usuario_eliminado_");
    }
}