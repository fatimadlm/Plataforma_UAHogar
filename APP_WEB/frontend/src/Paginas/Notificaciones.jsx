import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { Bell, CheckCircle2, X, CheckCheck } from 'lucide-react';
import { obtenerConfiguracionNotificacion } from '../Configuracion/NotificacionesConfig';
import styles from './Notificaciones.module.css';
import {getNotificaciones,  marcarNotificacionLeida, marcarTodasLeidas, borrarNotificacion,borrarTodasNotificaciones} from '../Servicios/PeticionTarea';

export default function Notificaciones() {
  const navigate = useNavigate();
  const { usuario } = useSesion();

  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario?.id) return;
    let activo = true;
    const cargarInicial = async () => {
      try {
        const datos = await getNotificaciones(usuario.id);
        if (activo) setNotificaciones(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
        if (activo) setNotificaciones([]);
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargarInicial();
    return () => {activo = false; };}, [usuario?.id]
  );

  // Obtiene el icono configurado para cada tipo
  const renderizarIcono = (tipo) => {
    const configuracion = obtenerConfiguracionNotificacion(tipo);
    const Icono = configuracion.icono;
    return <Icono size={22} color={configuracion.color} />;
  };

  // Formatea la fecha de la notificación
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    if (Number.isNaN(d.getTime())) return '';

    const ahora = new Date();
    const diff = Math.floor((ahora - d) / 60000); // minutos
    if (diff < 1)   return 'Ahora mismo';
    if (diff < 60)  return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
    return `Hace ${Math.floor(diff / 1440)} días`;
  };

// Marca una notificación como leída y navega a su origen
const handleClic = async (notif) => {
  if (!notif) return;

  if (!notif.leida) {
    try {
      await marcarNotificacionLeida(notif.id);
      setNotificaciones(prev =>
        prev.map(n => n.id === notif.id ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }
  //para bienvenida
  if (notif.tipo === 'UNION_HOGAR') {
    navigate('/phogares');
    return;
  }
  //resto de notificaciones
  if (notif.urlOrigen) {
    navigate(notif.urlOrigen);
  }
};

  // Elimina una notificación concreta
  const handleBorrarUna = async (e, id) => {
    e.stopPropagation();
    try {
      await borrarNotificacion(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error borrando notificación:', error);
    }
  };

  // Marca todas las notificaciones como leídas
  const handleMarcarTodas = async () => {
    if (!usuario?.id) return;
    try {
      await marcarTodasLeidas(usuario.id);
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (error) {
      console.error('Error marcando todas las notificaciones:', error);
    }
  };

  // Elimina todas las notificaciones
  const handleBorrarTodas = async () => {
    if (!usuario?.id) return;
    try {
      await borrarTodasNotificaciones(usuario.id);
      setNotificaciones([]);
    } catch (error) {
      console.error('Error borrando todas las notificaciones:', error);
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="notificaciones" />

      <main className="main-content">
        <div className={styles.contenedorPrincipal}>
          {/* Cabecera */}
          <div className={styles.cabeceraPrincipal}>
            <header>
              <div className={styles.tituloContenedor}>
                <h1 className={styles.tituloPrincipal}>Notificaciones</h1>
                <Bell className={styles.iconoCabecera} size={28} />
                {noLeidas > 0 && (
                  <span className={styles.contadorNoLeidas}>
                    {noLeidas} nueva{noLeidas !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className={styles.subtituloPrincipal}>
                Entérate de todo lo que pasa en tus hogares.
              </p>
            </header>

            {notificaciones.length > 0 && (
              <div className={styles.botonesAcciones}>
                {noLeidas > 0 && (
                  <button
                    className={`${styles.btnBorrarTodas} ${styles.btnLeerTodas}`}
                    onClick={handleMarcarTodas}
                  >
                    <CheckCheck size={16} />
                    Leer todas
                  </button>
                )}
                <button
                  className={styles.btnBorrarTodas}
                  onClick={handleBorrarTodas}
                >
                  Limpiar todas
                </button>
              </div>
            )}
          </div>

          {/* Lista */}
          <div className={styles.contenedorNotificaciones}>
            {cargando ? (
              <p className={styles.mensajeCargando}>Cargando...</p>
            ) : notificaciones.length === 0 ? (
              <div className={`tarjeta-cristal ${styles.estadoVacio}`}>
                <CheckCircle2
                  className={styles.iconoEstadoVacio}
                  size={48}
                  strokeWidth={1.5}
                />
                <h3 className={styles.tituloEstadoVacio}>¡Todo al día!</h3>
                <p>No tienes notificaciones.</p>
              </div>
            ) : (
              notificaciones.map(notif => (
                <div
                  key={notif.id}
                  className={`tarjeta-cristal ${styles.notifCard} ${
                    notif.leida ? styles.notifLeida : styles.notifNoLeida
                  } ${
                    notif.urlOrigen ? styles.notifClickable : styles.notifNoClickable
                  }`}
                  onClick={() => handleClic(notif)}
                >
                  <div className={styles.iconoNotif}>
                    {renderizarIcono(notif.tipo)}
                  </div>

                  <div className={styles.contenidoNotif}>
                    <p
                      className={`${styles.tituloNotif} ${
                        notif.leida ? styles.tituloNotifLeida : styles.tituloNotifNoLeida
                      }`}
                    >
                      {notif.titulo}
                    </p>
                    <p className={styles.mensajeNotif}>{notif.mensaje}</p>
                    <span className={styles.fechaNotif}>
                      {formatearFecha(notif.fechaCreacion)}
                    </span>
                  </div>

                  <button
                    className={styles.btnCerrarUna}
                    onClick={(e) => handleBorrarUna(e, notif.id)}
                    title="Eliminar"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}