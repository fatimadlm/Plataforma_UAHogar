import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSesion } from '../Seguridad/ContextoSesion';
import Sidebar from '../Componentes/Sidebar';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { getIncidencia, cerrarIncidencia, getHogaresPorUsuario } from '../Servicios/PeticionTarea';
import styles from './DetalleIncidencia.module.css';

export default function DetalleIncidencia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useSesion();

  const [incidencia, setIncidencia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [esAdminDelHogar, setEsAdminDelHogar] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const cargar = async () => {
    try {
      const datos = await getIncidencia(id);
      setIncidencia(datos);
      // Comprobamos si el usuario logueado es ADMIN del hogar de esta incidencia
      if (usuario?.id && datos.hogarId) {
        const hogares = await getHogaresPorUsuario(usuario.id);
        const hogar = hogares.find(h => Number(h.id) === Number(datos.hogarId));
        setEsAdminDelHogar(hogar?.rol === 'ADMIN');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!id || !usuario?.id) return;
    let activo = true;
    const cargarInicial = async () => {
      try {
        const datos = await getIncidencia(id);
        if (!activo) return;
        setIncidencia(datos);
        if (datos.hogarId) {
          const hogares = await getHogaresPorUsuario(usuario.id);
          if (!activo) return;
          const hogar = hogares.find(h => Number(h.id) === Number(datos.hogarId));
          setEsAdminDelHogar(hogar?.rol === 'ADMIN');
        }
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargarInicial();
    return () => {activo = false; }; }, [id, usuario?.id]
  );

  const handleCerrar = async () => {
    setCerrando(true);
    setError(null);
    try {
      await cerrarIncidencia(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCerrando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (cargando) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="notificaciones" />
        <main className="main-content"><p className={styles.textoCargando}>Cargando incidencia...</p></main>
      </div>
    );
  }

  if (error && !incidencia) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="notificaciones" />
        <main className="main-content">
          <p className={styles.textoError}>{error}</p>
        </main>
      </div>
    );
  }

  const abierta = incidencia.estado === 'OPEN';

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="notificaciones" />

      <main className="main-content">
        <button onClick={() => navigate(-1)} className={styles.botonVolver}>
          <ArrowLeft size={18} /> Volver
        </button>

        <div className={`tarjeta-cristal ${styles.tarjeta}`}>
          <div className={styles.cabecera}>
            {abierta
              ? <AlertTriangle size={28} color="#e76f51" />
              : <CheckCircle2 size={28} color="#06d6a0" />}
            <div>
              <h1 className={styles.titulo}>{incidencia.nombreTarea}</h1>
              <span className={abierta ? styles.badgeAbierta : styles.badgeCerrada}>
                {abierta ? 'Abierta' : 'Cerrada'}
              </span>
            </div>
          </div>

          <p className={styles.meta}>
            Hogar <strong>{incidencia.nombreHogar}</strong>
            {' '}· Realizada por <strong>{incidencia.nombreResponsable}</strong>
          </p>

          <div className={styles.bloqueDescripcion}>
            <p className={styles.descripcion}>"{incidencia.descripcion}"</p>
            <div className={styles.fecha}>
              <Clock size={13} /> Reportada el {formatearFecha(incidencia.fechaCreacion)}
            </div>
          </div>

          {error && (
            <p className={styles.mensajeError}>{error}</p>
          )}

          {/* Datos de cierre */}
          {!abierta && (
            <p className={`${styles.fecha} ${styles.fechaCierre}`}>
              Cerrada por {incidencia.nombreCerradaPor} el {formatearFecha(incidencia.fechaCierre)}
            </p>
          )}

          {esAdminDelHogar && abierta && (
            <button
              className={`boton-primario ${styles.botonCerrar}`}
              onClick={handleCerrar}
              disabled={cerrando}
            >
              {cerrando ? 'Cerrando...' : 'Cerrar incidencia'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}