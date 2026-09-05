import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSesion } from '../Seguridad/ContextoSesion';
import { getPerfilAjeno, getTareasRecientesComunes } from '../Servicios/PeticionTarea';
import { API_URL } from '../Configuracion/apiConfig';
import styles from './Perfil.module.css';
import Sidebar from '../Componentes/Sidebar';

export default function PerfilAjeno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario: usuarioLogueado } = useSesion();
  
  const [usuarioVisitado, setUsuarioVisitado] = useState(null);
  const [tareasRecientes, setTareasRecientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuarioLogueado?.id) return;

      try {
        setCargando(true);
        setError(null);

        const datosPerfil = await getPerfilAjeno(id, usuarioLogueado.id);
        setUsuarioVisitado(datosPerfil);

        const datosTareas = await getTareasRecientesComunes(id, usuarioLogueado.id);
        setTareasRecientes(datosTareas);
        
      } catch (err) {

        // El usuario puede haber eliminado su cuenta
        if (err.status === 404) {
          setError('Este usuario ya no está disponible.');
        } else {
          setError(err.message || 'No se ha podido cargar el perfil.');
        }

        setUsuarioVisitado(null);
        setTareasRecientes([]);

      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id, usuarioLogueado]);

  // Comprueba si el usuario está anonimizado
  const usuarioEliminado =
    usuarioVisitado?.nombre === 'Usuario eliminado' ||
    usuarioVisitado?.usuario?.startsWith('usuario_eliminado_');

  // Abre el chat privado con este usuario
  const abrirChatConEsteUsuario = () => {

    // No se puede iniciar un chat con una cuenta eliminada
    if (!usuarioVisitado || usuarioEliminado) return;

    navigate('/mensajes', {
      state: {
        abrirChatCon: {
          otroUsuarioId: usuarioVisitado.id,
          nombre: usuarioVisitado.nombre,
          imagenPerfil: usuarioVisitado.imagenPerfil
        }
      }
    });
  };

  if (cargando || !usuarioLogueado) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="perfil" />
        <main className={`main-content ${styles.centroVacio}`}>
          <div className={styles.contenedorCentrado}>Cargando el perfil...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="perfil" />
        <main className={`main-content ${styles.centroVacio}`}>
          <div className={styles.contenedorCentrado}>
            <p className={styles.errorText}>{error}</p>
            <button className={styles.botonVolver} onClick={() => navigate(-1)}>Volver</button>
          </div>
        </main>
      </div>
    );
  }

  if (!usuarioVisitado) {
    return null;
  }

  // Nunca mostramos un identificador interno de una cuenta eliminada
  const nombreVisible = usuarioEliminado
    ? 'Usuario eliminado'
    : usuarioVisitado.nombre;

  const usuarioVisible = usuarioEliminado
    ? null
    : usuarioVisitado.usuario;

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="perfil" />

      <main className={`main-content ${styles.mainCentrado}`}>
        <div className={styles.perfilContenedorVisita}>
          <button className={styles.botonVolver} onClick={() => navigate(-1)}>← Volver</button>

          <div className={styles.tarjetaPerfil}>

            {/* Avatar y nombre */}
            <div className={styles.avatarSeccion}>
              <div className={styles.avatarContenedor}>
                <img
                  src={
                    usuarioVisitado.imagenPerfil
                      ? (
                        usuarioVisitado.imagenPerfil.startsWith('http')
                          ? usuarioVisitado.imagenPerfil
                          : `${API_URL}${usuarioVisitado.imagenPerfil}`
                      )
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreVisible)}`
                  }
                  alt={nombreVisible}
                  className={styles.avatarImg}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerText =
                      nombreVisible.charAt(0).toUpperCase();
                  }}
                />
              </div>
              <h2 className={styles.nombreUsuario}>{nombreVisible}</h2>
              {!usuarioEliminado && usuarioVisible && (<p className={styles.tagUsuario}> @{usuarioVisible} </p> )}
            </div>
            {/* Estadísticas compartidas */}
            <div className={styles.seccionEstadisticas}>
              <h3 className={styles.tituloSeccion}>Estadísticas Compartidas</h3>
              <div className={styles.gridEstadisticasVisitas}>
                <div className={styles.tarjetaStat}>
                  <span className={styles.statValor}>{usuarioVisitado.tareasComunes}</span>
                  <span className={styles.statEtiqueta}>Tareas junto a ti</span>
                </div>
                <div className={styles.tarjetaStat}>
                  <span className={styles.statValor}>{usuarioVisitado.puntosComunes}</span>
                  <span className={styles.statEtiqueta}>Puntos junto a ti</span>
                </div>
              </div>
            </div>
            {/* Tareas recientes en común */}
            <div className={`${styles.seccionEstadisticas} ${styles.seccionEstadisticasSeparada}`}>
              <h3 className={styles.tituloSeccion}>Tareas Recientes en Común</h3>
              {tareasRecientes.length > 0 ? (
                <ul className={styles.listaTareasRecientes}>
                  {tareasRecientes.map((tarea) => (
                    <li key={tarea.id} className={styles.tareaItemVisita}>
                      <span className={styles.tareaNombre}>{tarea.nombre}</span>
                      <span className={styles.tareaHogar}>{tarea.nombreHogar || 'Hogar'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.sinTareasComunes}>
                  <p className={styles.sinTareasComunesTexto}>Aún no habéis completado tareas juntos.</p>
                </div>
              )}
            </div>
            {/* Botón chat */}
            {!usuarioEliminado && (
              <button className={`boton-primario ${styles.botonChat}`}
                      onClick={abrirChatConEsteUsuario}>Abrir Chat 
            </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
