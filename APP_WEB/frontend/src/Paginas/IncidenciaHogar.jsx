import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../Seguridad/ContextoSesion';
import Sidebar from '../Componentes/Sidebar';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { getIncidenciasHogar, cerrarIncidencia } from '../Servicios/PeticionTarea';
import styles from './IncidenciaHogar.module.css';

export default function IncidenciasHogar() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const hogar = state?.hogarActivo;

  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cerrando, setCerrando] = useState(null);
  const [error, setError] = useState(null);

  // Cargamos las incidencias reportadas en el hogar
  const cargar = () => {
    if (!hogar?.id) return;
    getIncidenciasHogar(hogar.id)
      .then(setIncidencias)
      .catch(() => setIncidencias([]))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!hogar?.id) return;
    let activo = true;
    const cargarInicial = async () => {
      try {
        const datos = await getIncidenciasHogar(hogar.id);
        if (activo) setIncidencias(datos);
      } catch {
        if (activo) setIncidencias([]);
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargarInicial();
    return () => {activo = false; };}, [hogar?.id]
  );

  // Cierra una incidencia y recarga la lista
  const handleCerrar = async (incidenciaId) => {
    setCerrando(incidenciaId);
    setError(null);
    try {
      await cerrarIncidencia(incidenciaId);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCerrando(null);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!hogar) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="hogares" />
        <main className={`main-content ${styles.centroVacio}`}>
          <p className={styles.textoCargando}>No se ha seleccionado ningún hogar.</p>
        </main>
      </div>
    );
  }

  const abiertas = incidencias.filter(i => i.estado === 'OPEN');
  const cerradas = incidencias.filter(i => i.estado === 'CLOSED');

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="hogares" />

      <main className="main-content">
        <button onClick={() => navigate(-1)} className={styles.botonVolver}>
          <ArrowLeft size={18} /> Volver al panel
        </button>

        <h1 className={styles.tituloPrincipal}>Incidencias de {hogar.nombre}</h1>
        <p className={styles.subtituloPrincipal}>Revisa y cierra los problemas reportados sobre tareas completadas.</p>

        {error && <p className={styles.mensajeError}>{error}</p>}

        {cargando ? (
          <p className={styles.textoCargando}>Cargando incidencias...</p>
        ) : incidencias.length === 0 ? (
          <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>
            No hay incidencias en este hogar.
          </div>
        ) : (
          <>
            {abiertas.length > 0 && (
              <>
                <h2 className={styles.tituloSeccion}>Abiertas ({abiertas.length})</h2>
                <div className={styles.lista}>
                  {abiertas.map(i => (
                    <div key={i.id} className={`tarjeta-cristal ${styles.itemIncidencia}`}>
                      <div className={styles.itemIcono}>
                        <AlertTriangle size={22} color="#e76f51" />
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemNombre}>{i.nombreTarea}</div>
                        <div className={styles.itemMeta}>
                          Realizada por <strong>{i.nombreResponsable}</strong>
                        </div>
                        <p className={styles.itemDescripcion}>"{i.descripcion}"</p>
                        <div className={styles.itemFecha}>
                          <Clock size={12} /> {formatearFecha(i.fechaCreacion)}
                        </div>
                      </div>
                      <button
                        className={`boton-primario ${styles.botonCerrarIncidencia}`}
                        onClick={() => handleCerrar(i.id)}
                        disabled={cerrando === i.id}
                      >
                        {cerrando === i.id ? 'Cerrando...' : 'Cerrar incidencia'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {cerradas.length > 0 && (
              <>
                <h2 className={`${styles.tituloSeccion} ${styles.tituloSeccionCerradas}`}>
                  Cerradas ({cerradas.length})
                </h2>
                <div className={styles.lista}>
                  {cerradas.map(i => (
                    <div key={i.id} className={`tarjeta-cristal ${styles.itemIncidencia} ${styles.itemCerrada}`}>
                      <div className={styles.itemIcono}>
                        <CheckCircle2 size={22} color="#06d6a0" />
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemNombre}>{i.nombreTarea}</div>
                        <div className={styles.itemMeta}>
                          Reportada por <strong>{i.nombreReportante}</strong> · Realizada por <strong>{i.nombreResponsable}</strong>
                        </div>
                        <p className={styles.itemDescripcion}>"{i.descripcion}"</p>
                        <div className={styles.itemFecha}>
                          Cerrada por {i.nombreCerradaPor} el {formatearFecha(i.fechaCierre)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}