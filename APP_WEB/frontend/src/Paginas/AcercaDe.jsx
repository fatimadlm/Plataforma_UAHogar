import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, GraduationCap, Scale, Server, MonitorSmartphone,
  Brain, Cloud, ExternalLink, GitBranch, HeartHandshake
} from 'lucide-react';
import logo from '../assets/logo.png';
import styles from './AcercaDe.module.css';

const URL_FRONTEND = 'https://app-uahogar-frontend-fabrcyccb9fqhzg5.spaincentral-01.azurewebsites.net/';
const URL_GITHUB = 'https://github.com/fatimadlm/Plataforma_UAHogar';

export default function AcercaDe() {
  const navigate = useNavigate();

  return (
    <div className={styles.contenedor}>
      <button className={styles.botonVolver} onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Volver
      </button>

      <div className={`tarjeta-cristal ${styles.tarjetaCabecera}`}>
        <img src={logo} alt="Logo UAHogar" className={styles.logo} />
        <p className={styles.eslogan}>
        Aplicación web para la gestión colaborativa y equitativa de tareas del hogar
        </p>
        <div className={styles.etiquetaTfg}>
          <GraduationCap size={18} />
         Autora : Fátima C. de la Morena <br />
         Tutor : Roberto Barchino Plata 
        </div>
      </div>

      <div className={`tarjeta-cristal ${styles.tarjetaSeccion}`}>
        <h2 className={styles.tituloSeccion}>
         Introducción
        </h2>
        <p className={styles.parrafo}>
          El reparto de las tareas del hogar es un desafío presente en casi cualquier situación  de convivencia: familias, parejas, pisos de estudiantes o incluso en vacaciones.Siempre surge la necesidad de organizar quién limpia, cocina, hace las compras y un sin fin de tareas.
        </p>
        <p className={styles.parrafo}>
        Muchas veces, la falta de organización o de una herramienta común hace que algunas personas asuman más responsabilidades que otras, lo que puede generar conflictos o sensación de injusticia.        </p>
      </div>

      <div className={`tarjeta-cristal ${styles.tarjetaSeccion}`}>
        <h2 className={styles.tituloSeccion}>
          <Scale size={22} /> Descripción
        </h2>
        <p className={styles.parrafo}>
          UAHogar es una aplicación web colaborativa diseñada para facilitar
          la gestión de las tareas domésticas entre compañeros de piso.
        </p>
        <p className={styles.parrafo}>
          El objetivo principal es conseguir una distribución equitativa de
          la carga de trabajo, evitando que las tareas se asignen únicamente
          en función del número de puntos históricos de cada usuario.
        </p>
        <p className={styles.parrafo}>
          La aplicación permite organizar las tareas del hogar, realizar un
          seguimiento de su estado, fomentar la comunicación entre los
          miembros y mantener un sistema de puntos y ranking.
        </p>
      </div>

      <div className={`tarjeta-cristal ${styles.tarjetaSeccion}`}>
        <h2 className={styles.tituloSeccion}>Tecnologías</h2>

        <div className={styles.gridTecnologias}>
          <div className={styles.bloqueTecnologia}>
            <div className={styles.iconoBloque}>
              <Server size={24} />
            </div>
            <h3 className={styles.subtituloBloque}>Backend</h3>
            <ul className={styles.listaTecnologias}>
              <li>Java 21</li>
              <li>Spring Boot</li>
              <li>Spring Data JPA</li>
              <li>Spring Security & JWT</li>
              <li>MySQL</li>
            </ul>
          </div>

          <div className={styles.bloqueTecnologia}>
            <div className={styles.iconoBloque}>
              <MonitorSmartphone size={24} />
            </div>
            <h3 className={styles.subtituloBloque}>Frontend</h3>
            <ul className={styles.listaTecnologias}>
              <li>React</li>
              <li>Vite</li>
              <li>JavaScript (ES6+)</li>
              <li>CSS Modules</li>
            </ul>
          </div>

          <div className={styles.bloqueTecnologia}>
            <div className={styles.iconoBloque}>
              <Brain size={24} />
            </div>
            <h3 className={styles.subtituloBloque}>Inteligencia Artificial</h3>
            <p className={styles.textoBloque}>
              Se implementa una API de Inteligencia Artificial para la estimación automatizada de
              la duración de las tareas y la generación de recomendaciones prácticas para completarlas.
            </p>
          </div>
        </div>
      </div>

      <div className={`tarjeta-cristal ${styles.tarjetaSeccion}`}>
        <h2 className={styles.tituloSeccion}>
          <Cloud size={22} /> Despliegue y Código Fuente
        </h2>
        <p className={styles.parrafo}>
          Infraestructura en la nube alojada en Microsoft Azure, con control de versiones y trazabilidad completa del proyecto gestionados en GitHub.
        </p>
        <div className={styles.enlacesDespliegue}>
          <a href={URL_FRONTEND} target="_blank" rel="noopener noreferrer" className={styles.enlaceDespliegue}>
            <MonitorSmartphone size={18} />
            Aplicación web
            <ExternalLink size={14} />
          </a>

          <a href={URL_GITHUB} target="_blank" rel="noopener noreferrer" className={styles.enlaceDespliegue}>
            <GitBranch size={18} />
            Repositorio en GitHub
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}