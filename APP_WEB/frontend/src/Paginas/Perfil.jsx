import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { User, Star, CheckCircle, Mail, Phone, Award, AlertTriangle, Trash2 } from 'lucide-react';
import styles from './Perfil.module.css';
import { getEstadisticasUsuario, getCompis } from '../Servicios/PeticionTarea'; 
import ModalCompis from '../Componentes/Modulos/ModalCompis';
import ModalEliminarCuenta from '../Componentes/Modulos/ModalEliminarCuenta';
import { API_URL } from '../Configuracion/apiConfig';

export default function Perfil() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useSesion();

  // Estados para datos dinámicos
  const [puntosMes, setPuntosMes] = useState(0);
  const [tareasCompletadas, setTareasCompletadas] = useState(0);
  const [cargando, setCargando] = useState(true);
  
  // Estados para la lógica de compis
  const [compis, setCompis] = useState([]);
  const [mostrandoCompis, setMostrandoCompis] = useState(false);

  const [mostrandoEliminarCuenta, setMostrandoEliminarCuenta] = useState(false);

  // Petición para obtener las estadísticas del usuario
  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario) return;
      try {
        const datos = await getEstadisticasUsuario(usuario.id); 
        setPuntosMes(datos.puntosMes);
        setTareasCompletadas(datos.tareasCompletadas);
      } catch (error) {
        console.error("Error al cargar las estadísticas:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [usuario]);

  // Manejador para cargar compis 
  const manejarToggleCompis = async () => {
    if (!mostrandoCompis && compis.length === 0) {
      const datos = await getCompis(usuario.id);
      setCompis(datos);
    }
    setMostrandoCompis(!mostrandoCompis);
  };

  // Cálculo del rango según los puntos del mes actual
  const calcularRango = (puntos) => {
    if (puntos < 70) return 'Asistente de Innovación en Desorden';
    if (puntos >= 70 && puntos <= 180) return 'Coordinador/a de Operaciones de Mantenimiento';
    return 'Director/a de Estrategia de Higiene Doméstica';
  };

  const alEliminarCuentaConfirmado = () => {
    cerrarSesion();
    alert(`¡Gracias por haber formado parte de UAHogar!`);
    navigate('/');
  };

  if (!usuario) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="perfil" />
        <main className={`main-content ${styles.centroVacio}`}>
          <h2>Cargando perfil...</h2>
        </main>
      </div>
    );
  }

  const rangoActual = calcularRango(puntosMes);

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="perfil" />

      <main className={`main-content ${styles.mainCentrado}`}>
        <header className={styles.cabeceraPrincipal}>
          <h1 className={styles.tituloPrincipal}>Mi Perfil</h1>
          <User size={32} color="#3d5a80" strokeWidth={2.5} />
        </header>

        <div className={`tarjeta-cristal ${styles.perfilContainer}`}>
          <div className={styles.avatarContenedor}>
            <img
              src={
                usuario.imagenPerfil 
                  ? (usuario.imagenPerfil.startsWith('http') ? usuario.imagenPerfil : `${API_URL}${usuario.imagenPerfil}`)
                  : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(usuario.nombre)
              }
              alt={usuario.nombre}
              className={styles.avatarImg}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerText = usuario.nombre.charAt(0).toUpperCase();
              }}
            />
          </div>
          
          <h2 className={styles.nombreUsuario}>{usuario.nombre}</h2>
          <p className={styles.tagUsuario}>@{usuario.usuario}</p>

          <div className={styles.statsPanel}>
            <div className={styles.statBox}>
              <span className={styles.statValor}>
                <Star size={24} color="#e76f51" fill="#e76f51" /> 
                {cargando ? '...' : puntosMes}
              </span>
              <span className={styles.statEtiqueta}>Puntos del mes</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValor}>
                <CheckCircle size={24} color="#90b4ce" /> 
                {cargando ? '...' : tareasCompletadas}
              </span>
              <span className={styles.statEtiqueta}>Tareas Totales</span>
            </div>
          </div>

          <div className={styles.datosLista}>
            <div className={styles.datoItem}>
              <span className={styles.datoLabel}><Mail size={18} /> Email</span>
              <span className={styles.datoValor}>{usuario.email}</span>
            </div>
            <div className={styles.datoItem}>
              <span className={styles.datoLabel}><Phone size={18} /> Teléfono</span>
              <span className={styles.datoValor}>{usuario.telefono}</span>
            </div>
            <div className={`${styles.datoItem} ${styles.datoItemSinBorde}`}>
              <span className={styles.datoLabel}><Award size={18} /> Rango</span>
              <span className={`${styles.datoValor} ${styles.datoValorRango}`}>
                {cargando ? 'Calculando...' : rangoActual}
              </span>
            </div>
          </div>

          <button 
            className={`boton-primario ${styles.btnEditar}`}
            onClick={() => navigate('/editarperfil')}
          >
            Editar Información
          </button>

          <button 
            className={styles.btnCompis}
            onClick={manejarToggleCompis}
          >
            Ver mis Compis
          </button>

          <button className={styles.botonIncidencias} onClick={() => navigate('/misincidencias')}>
            <AlertTriangle size={18} /> Mis Incidencias
          </button>

          <ModalCompis 
            isOpen={mostrandoCompis} 
            onClose={() => setMostrandoCompis(false)} 
            compis={compis} 
            onNavigate={(id) => navigate(`/perfil-ajeno/${id}`)}
          />
          {/* Zona de borrado */}
          <div className={styles.zonaBorrado}>
            <button
              className={styles.btnEliminarCuenta}
              onClick={() => setMostrandoEliminarCuenta(true)}
            >
              <Trash2 size={18} /> Eliminar mi cuenta
            </button>
          </div>

          {mostrandoEliminarCuenta && (
            <ModalEliminarCuenta
              onCancelar={() => setMostrandoEliminarCuenta(false)}
              onConfirmado={alEliminarCuentaConfirmado}
            />
          )}
        </div>
      </main>
    </div>
  );
}