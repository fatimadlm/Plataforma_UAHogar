import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginRegistro.module.css'; 
import { useSesion } from '../Seguridad/ContextoSesion';
import { API_URL } from '../Configuracion/apiConfig';

export default function Login() {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const { iniciarSesion } = useSesion();

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reiniciamos errores antes de intentar entrar
    
    try {
      // Petición al backend
      const respuesta = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario, password: password })
      });

      // Redirección si las credenciales son correctas
      if (respuesta.ok) {
        
        // Extraemos los datos del usuario y el token
        const { usuario: datosUsuario, token } = await respuesta.json();
        
        iniciarSesion(datosUsuario, token);
        
        navigate('/feed');
      } else {
        //Contraseña incorrecta o bloqueada cuenta
        const mensaje = await respuesta.text();
        setError(mensaje || 'Usuario o contraseña incorrectos');
      }

    } catch (error) {
      console.error(error);
      setError('Error al conectar con el servidor.');
    }
  };

  return (
    <div className={styles.contenedor}>
      
      {/* Formas de fondo */}
      <div className={styles.formaFondo1} />
      <div className={styles.formaFondo2} />
      <div className={styles.formaFondo3} />

      {/* Tarjeta principal */}
      <div className={`tarjeta-cristal ${styles.tarjetaAuth}`}>
        
        <h2 className={styles.titulo}>Iniciar Sesión</h2>

        {/* Alerta de error*/}
        {error && <p className={styles.mensajeError}>{error}</p>}

        <form onSubmit={manejarLogin} className={styles.formulario}>
          
          <input 
            type="text" 
            placeholder="Nombre de usuario" 
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
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
            Entrar
          </button>
        </form>

        {/* Enlace al registro */}
        <p className={styles.textoFooter}>
          ¿No tienes cuenta?{' '}
          <span onClick={() => navigate('/registro')} className={styles.linkAccion}>
            Regístrate
          </span>
        </p>

      </div>
    </div>
  );
}