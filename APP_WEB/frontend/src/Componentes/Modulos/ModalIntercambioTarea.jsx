import { useState, useEffect } from 'react';
import { ArrowLeftRight, X, Loader2, ShieldAlert } from 'lucide-react';
import { getPanelHogar, solicitarIntercambio } from '../../Servicios/PeticionTarea';
import styles from './ModalIntercambioTarea.module.css';

export default function ModalIntercambioTarea({ tarea, usuario, onCerrar, onSolicitado }) {

  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [destinatarioId, setDestinatarioId] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Cargamos los compañeros del hogar excluyendo al usuario actual
  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const datos = await getPanelHogar(tarea.hogarId);
        const compis = (datos.miembros || []).filter(m => Number(m.id) !== Number(usuario.id));
        if (activo) setMiembros(compis);
      } catch {
        if (activo) setError('No se pudieron cargar los miembros del hogar');
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => { activo = false; };
  }, [tarea.hogarId, usuario.id]);

  // Enviamos la petición de intercambio y notificamos al componente padre
  const manejarSolicitar = async () => {
    if (!destinatarioId) return;
    setEnviando(true);
    setError('');
    try {
      await solicitarIntercambio(tarea.id, destinatarioId);
      onSolicitado();
    } catch (err) {
      setError(err.message || 'No se pudo solicitar el intercambio');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <div className={styles.titulo}>
            <div className={styles.icono}>
              <ArrowLeftRight size={20} />
            </div>
            <div>
              <span className={styles.etiqueta}>Intercambiar tarea</span>
              <h2>{tarea.nombre}</h2>
            </div>
          </div>
          <button className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className={styles.contenido}>

          {cargando ? (
            <div className={styles.cargando}>
              <Loader2 size={26} className={styles.iconoCargando} />
              <p>Cargando compañeros de hogar...</p>
            </div>
          ) : miembros.length === 0 ? (
            <p className={styles.sinCompis}>No hay más miembros en este hogar con quien intercambiar.</p>
          ) : (
            <>
              <p className={styles.instrucciones}>Elige con quién quieres intercambiar esta tarea:</p>

              <div className={styles.listaCompis}>
                {miembros.map(m => (
                  <label
                    key={m.id}
                    className={`${styles.opcionCompi} ${destinatarioId === m.id ? styles.opcionSeleccionada : ''}`}
                  >
                    <input
                      type="radio"
                      name="destinatario"
                      value={m.id}
                      checked={destinatarioId === m.id}
                      onChange={() => setDestinatarioId(m.id)}
                    />
                    <span className={styles.flechaCambio}>
                      Tú <ArrowLeftRight size={14} /> {m.nombre}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className={styles.error}>
              <ShieldAlert size={17} />
              <p>{error}</p>
            </div>
          )}

          <div className={styles.acciones}>
            <button className={styles.botonCancelar} onClick={onCerrar} disabled={enviando}>
              Cancelar
            </button>
            <button
              className={`boton-primario ${styles.botonSolicitar}`}
              onClick={manejarSolicitar}
              disabled={!destinatarioId || enviando}
            >
              {enviando ? 'Enviando...' : 'Solicitar intercambio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}