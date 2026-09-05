package com.fatima.UAHogar.servicio;

import com.fatima.UAHogar.DAO.AuditoriaSupervisorDAO;
import com.fatima.UAHogar.DAO.UsuarioDAO;
import com.fatima.UAHogar.dto.AuditoriaSupervisionDTO;
import com.fatima.UAHogar.modelo.AuditoriaSupervisor;
import com.fatima.UAHogar.modelo.TipoAccionAuditoria;
import com.fatima.UAHogar.modelo.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;

// historial de acciones de los supervisores
@Service
public class AuditoriaServicio {

    private final AuditoriaSupervisorDAO auditoriaDAO;
    private final UsuarioDAO usuarioDAO;

    public AuditoriaServicio(AuditoriaSupervisorDAO auditoriaDAO, UsuarioDAO usuarioDAO) {
        this.auditoriaDAO = auditoriaDAO;
        this.usuarioDAO = usuarioDAO;
    }

    // Guarda una entrada de auditoria
    public void registrar(Long supervisorId, TipoAccionAuditoria accion, String detalles) {
        if (supervisorId == null) return;

        Usuario supervisor = usuarioDAO.findById(supervisorId).orElse(null);
        if (supervisor == null) return;

        AuditoriaSupervisor entrada = new AuditoriaSupervisor(supervisor, accion.name(), detalles);
        auditoriaDAO.save(entrada);
    }

    // Ultimas acciones
    public List<AuditoriaSupervisionDTO> obtenerUltimasAcciones(String busqueda, String accion) {
        String texto = busqueda == null ? "" : busqueda.trim().toLowerCase();

        return auditoriaDAO.findAllByOrderByFechaDesc().stream()
                .filter(a -> texto.isEmpty()
                        || (a.getDetalles() != null && a.getDetalles().toLowerCase().contains(texto))
                        || (a.getSupervisor().getNombre() != null && a.getSupervisor().getNombre().toLowerCase().contains(texto))
                        || (a.getSupervisor().getUsuario() != null && a.getSupervisor().getUsuario().toLowerCase().contains(texto)))
                .filter(a -> accion == null || accion.isBlank() || accion.equalsIgnoreCase(a.getAccion()))
                .map(this::aDTO)
                .toList();
    }

    private AuditoriaSupervisionDTO aDTO(AuditoriaSupervisor a) {
        return new AuditoriaSupervisionDTO(
                a.getId(),
                a.getSupervisor().getNombre(),
                a.getSupervisor().getUsuario(),
                a.getAccion(),
                a.getDetalles(),
                a.getFecha()
        );
    }
}