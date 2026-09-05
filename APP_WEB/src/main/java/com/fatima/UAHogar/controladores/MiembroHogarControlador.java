package com.fatima.UAHogar.controladores;

import com.fatima.UAHogar.modelo.MiembroHogar;
import com.fatima.UAHogar.modelo.Usuario;
import com.fatima.UAHogar.DAO.MiembroHogarDAO;
import com.fatima.UAHogar.seguridad.UsuarioActual;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/miembros")
public class MiembroHogarControlador {

    private final MiembroHogarDAO miembroHogarDAO;

    public MiembroHogarControlador(MiembroHogarDAO miembroHogarDAO) {
        this.miembroHogarDAO = miembroHogarDAO;
    }

    public record CompiDTO(Long id, String nombre, String usuario, String imagenPerfil) {

        public CompiDTO(Usuario u) {
            this( u.getId(),u.getNombre(),
                    u.getUsuario().startsWith("usuario_eliminado_")? null : u.getUsuario(),
                    u.getImagenPerfil()
            );
        }
    }

    //Devuelve todos los usuarios que comparten al menos un hogar con el usuario autenticado
    @GetMapping("/compis/{usuarioId}")
    public ResponseEntity<?> obtenerCompis(@PathVariable Long usuarioId) {
        if (!usuarioId.equals(UsuarioActual.id())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No puedes ver los compis de otro usuario.");
        }
        // Buscamos los IDs de los hogares donde nuestro usuario está presente
        List<Long> listaIdsHogares = miembroHogarDAO.findByUsuarioId(usuarioId)
                .stream()
                .map(m -> m.getHogar().getId())
                .collect(Collectors.toList());

        // Si el usuario no está en ningún hogar, devolvemos una lista vacía directamente
        if (listaIdsHogares.isEmpty()) {
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        }

        // Buscamos todos los miembros de esas casas y extraemos los usuarios como DTO
        List<CompiDTO> compis = miembroHogarDAO.findByHogarIdIn(listaIdsHogares)
                .stream()
                .map(MiembroHogar::getUsuario)
                .filter(u -> !u.getId().equals(usuarioId)) // Quitamos al propio usuario
                .distinct() // Evitamos duplicados
                .map(CompiDTO::new)
                .collect(Collectors.toList());

        return new ResponseEntity<>(compis, HttpStatus.OK);
    }
}
