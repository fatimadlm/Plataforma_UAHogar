import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginRegistro.module.css';
import { usuarioRegex, telefonoRegex, passwordRegex } from '../Seguridad/Validaciones';
import { API_URL } from '../Configuracion/apiConfig';

export default function Registro() {
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  
  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');

    // Comprueba que el usuario solo tenga letras y  números     
    if (!usuarioRegex.test(usuario)) {
      setError('El nombre de usuario solo puede contener letras, números y barra baja (_).');
      return;
    }
    
    const telefonoLimpio = telefono.replace(/\s+/g, '');
    
    // Expresion regular para comprobar que empiece por + seguido del código de país y de 6 a 14 números    
    if (!telefonoRegex.test(telefonoLimpio)) {
      setError('El teléfono debe incluir el prefijo (ej. +34) y tener una longitud válida.');
      return; 
    }

    // Comprueba que la contraseña tenga al menos 8 caracteres, una mayúscula, una minúscula y un número    
    if (!passwordRegex.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }
    
    try {
      //Apuntamos a registrar
      const respuesta = await fetch(`${API_URL}/api/usuarios/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre,
          usuario: usuario, 
          email: email,
          telefono: telefonoLimpio,
          password: password,
          imagenPerfil: `https://ui-avatars.com/api/?name=${nombre}&background=90b4ce&color=fff&size=150&length=1`
        })
      });

      if (respuesta.ok) { 
        console.log("¡Registro exitoso!");
        navigate('/login');
      } else {
        const mensajeError = await respuesta.text(); 
        setError(mensajeError);
      }

    } catch (error) {
      console.error("Error conectando con el servidor:", error);
      setError('Error al conectar con el servidor.');
    }
  };

  return (
    <div className={styles.contenedor}>
      
      <div className={styles.formaFondo1} />
      <div className={styles.formaFondo2} />

      <div className={`tarjeta-cristal ${styles.tarjetaAuth}`}>
        
        <h2 className={styles.titulo}>Crear Cuenta</h2>

        {error && <p className={styles.mensajeError}>{error}</p>}

        <form onSubmit={manejarRegistro} className={styles.formulario}>
          
          <input 
            type="text" 
            placeholder="Nombre completo (ej. Fátima)" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="input-estetico"
          />

          <input 
            type="text" 
            placeholder="Nombre de usuario (ej. Fatima99)" 
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            className="input-estetico"
          />

          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-estetico"
          />

          <input 
            type="tel" 
            placeholder="Teléfono (ej. +34 600123456)" 
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            className="input-estetico"
          />

          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-estetico"
          />

          <button type="submit" className={`boton-primario ${styles.btnAuth}`}>
            Registrarme
          </button>
        </form>

        <p className={styles.textoFooter}>
          ¿Ya tienes cuenta?{' '}
          <span onClick={() => navigate('/login')} className={styles.linkAccion}>
            Inicia sesión
          </span>
        </p>

      </div>
    </div>
  );
}