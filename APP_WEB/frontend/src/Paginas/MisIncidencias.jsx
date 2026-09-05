import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../Seguridad/ContextoSesion';
import Sidebar from '../Componentes/Sidebar';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { getIncidenciasReportante, getIncidenciasResponsable } from '../Servicios/PeticionTarea';
import styles from './MisIncidencias.module.css';

export default function MisIncidencias() {
  const navigate = useNavigate();
  const { usuario } = useSesion();

  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario?.id) return;
    Promise.all([
      getIncidenciasReportante(usuario.id),
      getIncidenciasResponsable(usuario.id)
    ])
      .then(([reportadas, sobreMisTareas]) => {
        const mapa = new Map();
        reportadas.forEach(i => mapa.set(i.id, { ...i, rol: 'reportante' }));
        sobreMisTareas.forEach(i => {
          const existente = mapa.get(i.id);
          mapa.set(i.id, { ...i, rol: existente ? 'ambos' : 'responsable' });
        });

        const combinadas = Array.from(mapa.values())
          .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
        setIncidencias(combinadas);
      })
      .catch(() => setIncidencias([]))
      .finally(() => setCargando(false));
  }, [usuario]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const etiquetaRol = (rol) => {
    if (rol === 'reportante') return 'Reportada por ti';
    if (rol === 'responsable') return 'Sobre una tarea tuya';
    return 'Reportada por ti · Sobre una tarea tuya';
  };

  const abiertas = incidencias.filter(i => i.estado === 'OPEN');
  const cerradas = incidencias.filter(i => i.estado === 'CLOSED');

  const Tarjeta = ({ i, cerrada }) => (
    <div
      className={`tarjeta-cristal ${styles.itemIncidencia} ${cerrada ? styles.itemCerrada : ''} ${styles.itemClickable}`}
      onClick={() => navigate(`/incidencias/${i.id}`)}
      title="Ver detalle de la incidencia"
    >
      <div className={styles.itemIcono}>
        {cerrada
          ? <CheckCircle2 size={22} color="#06d6a0" />
          : <AlertTriangle size={22} color="#e76f51" />}
      </div>
      <div className={styles.itemInfo}>
        <div className={styles.itemNombre}>{i.nombreTarea}</div>
        <div className={styles.itemMeta}>
          {i.nombreHogar}
          {i.rol !== 'responsable' && <> ·</>}
          {' '}· Realizada por <strong>{i.nombreResponsable}</strong>
        </div>
        <span className={styles.badgeRol}>{etiquetaRol(i.rol)}</span>
        <p className={styles.itemDescripcion}>"{i.descripcion}"</p>

        <div className={styles.itemFecha}>
          {cerrada
            ? `Revisada el ${formatearFecha(i.fechaCierre)}`
            : <><Clock size={12} /> {formatearFecha(i.fechaCreacion)}</>}
        </div>
      </div>
      {!cerrada && <span className={styles.badgeAbierta}>Pendiente de revisión</span>}
      <ChevronRight size={18} color="#90b4ce" className={styles.itemFlecha} />
    </div>
  );

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="perfil" />

      <main className="main-content">
        <button onClick={() => navigate('/perfil')} className={styles.botonVolver}>
          <ArrowLeft size={18} /> Volver a mi perfil
        </button>

        <h1 className={styles.tituloPrincipal}>Mis incidencias</h1>
        <p className={styles.subtituloPrincipal}>
          Incidencias que has reportado y las que han reportado sobre tus tareas.
        </p>

        {cargando ? (
          <p className={styles.textoCargando}>Cargando incidencias...</p>
        ) : incidencias.length === 0 ? (
          <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>
            No tienes ninguna incidencia, ni reportada ni recibida.
          </div>
        ) : (
          <>
            {abiertas.length > 0 && (
              <>
                <h2 className={styles.tituloSeccion}>Abiertas ({abiertas.length})</h2>
                <div className={styles.lista}>
                  {abiertas.map(i => <Tarjeta key={i.id} i={i} cerrada={false} />)}
                </div>
              </>
            )}

            {cerradas.length > 0 && (
              <>
                <h2 className={`${styles.tituloSeccion} ${styles.tituloSeccionCerradas}`}>
                  Cerradas ({cerradas.length})
                </h2>
                <div className={styles.lista}>
                  {cerradas.map(i => <Tarjeta key={i.id} i={i} cerrada={true} />)}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}