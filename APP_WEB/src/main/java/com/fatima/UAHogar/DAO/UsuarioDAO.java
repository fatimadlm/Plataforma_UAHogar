package com.fatima.UAHogar.DAO;


import com.fatima.UAHogar.modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioDAO extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByUsuario(String usuario);
    Optional<Usuario> findByTelefono(String telefono);
}