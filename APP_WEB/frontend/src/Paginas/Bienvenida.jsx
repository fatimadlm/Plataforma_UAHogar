import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import styles from './Bienvenida.module.css';

export default function Bienvenida() {
  const navigate = useNavigate();

  return (
    <div className={styles.contenedor}>
      
      <div className={`tarjeta-cristal ${styles.tarjetaCentral}`}>
        
        <img 
          src= {logo}
          alt="Logo UAHogar" 
          className={styles.logo}
        />
        
        <p className={styles.subtitulo}>
          La organización de tu hogar, <br/>más fácil que nunca.
        </p>

        <button 
          className="boton-primario"
          onClick={() => navigate('/login')}
        >
          Comenzar
        </button>

      </div>
    </div>
  );
}