import { useState, useEffect } from 'react';
import { Users, ClipboardList, ListChecks, X, UserCircle2, Crown, Award } from 'lucide-react';
import { getDetalleAmpliadoHogarSupervision } from '../../Servicios/PeticionSupervisor';
import { API_URL, manejarErrorImagen } from '../../Configuracion/apiConfig';
import styles from './ModalDetalleHogar.module.css';


export default function DetalleHogarModal({ hogarId, nombreHogar, onCerrar }) {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
//Modal que muestra el detalle del hogar al supervisor
  const [pestana, setPestana] = useState('plantillas');

  useEffect(() => {
    getDetalleAmpliadoHogarSupervision(hogarId)
      .then(setDetalle)
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, [hogarId]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha límite';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className={`tarjeta-cristal modal-contenido ${styles.modalDetalleHogar}`} onClick={e => e.stopPropagation()}>
        <button className="btn-cerrar-modal" onClick={onCerrar}>
          <X size={20} strokeWidth={2.5} />
        </button>

        <h2 className={styles.modalTitulo}>{nombreHogar}</h2>
        <p className={styles.modalTexto}>Vista lector</p>

        {cargando ? (
          <p className={styles.textoEstado}>Cargando...</p>
        ) : error ? (
          <p className={styles.mensajeError}>{error}</p>
        ) : (
          <div className={styles.detalleHogarScroll}>
            <h3 className={styles.detalleSubtitulo}><Users size={16} /> Miembros ({detalle.miembros.length})</h3>
            <div className={styles.lista}>
              {detalle.miembros.map(m => (
                <div key={m.usuarioId} className={`tarjeta-cristal ${styles.filaUsuario}`}>
                  <div className={styles.avatarMini}>
                    {m.imagenPerfil
                      ? <img src={m.imagenPerfil.startsWith('http') ? m.imagenPerfil : `${API_URL}${m.imagenPerfil}`} alt={m.nombre} className={styles.avatarImg} onError={manejarErrorImagen} />
                      : <UserCircle2 size={20} color="#90b4ce" />}
                  </div>
                  <div className={styles.flex1}>
                    <div className={styles.filaTitulo}>
                      {m.nombre}
                      {m.rol === 'ADMIN' && <span className={styles.badgeSupervisor}><Crown size={12} /> Admin</span>}
                    </div>
                    <div className={styles.filaMeta}>@{m.usuario}</div>
                  </div>
                  <span className={styles.badgePuntos}><Award size={12} /> {m.puntos} pts</span>
                </div>
              ))}
            </div>

            <div className={styles.subTabs}>
              <button
                className={`${styles.subTabBtn} ${pestana === 'plantillas' ? styles.subTabActiva : ''}`}
                onClick={() => setPestana('plantillas')}
              >
                <ClipboardList size={14} /> Plantillas ({detalle.plantillas.length})
              </button>
              <button
                className={`${styles.subTabBtn} ${pestana === 'activas' ? styles.subTabActiva : ''}`}
                onClick={() => setPestana('activas')}
              >
                <ListChecks size={14} /> Tareas activas ({detalle.tareasActivas.length})
              </button>
            </div>

            {pestana === 'plantillas' && (
              detalle.plantillas.length === 0 ? (
                <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>Este hogar no tiene plantillas de tarea.</div>
              ) : (
                <div className={styles.lista}>
                  {detalle.plantillas.map(p => (
                    <div key={p.id} className={`tarjeta-cristal ${styles.filaUsuario}`}>
                      <div className={styles.avatarMini}><ClipboardList size={16} color="#90b4ce" /></div>
                      <div className={styles.flex1}>
                        <div className={styles.filaTitulo}>{p.nombre}</div>
                        <div className={styles.filaMeta}>{p.tipo} · {p.frecuencia}</div>
                      </div>
                      <span className={styles.badgePuntos}><Award size={12} /> {p.puntos} pts</span>
                    </div>
                  ))}
                </div>
              )
            )}

            {pestana === 'activas' && (
              detalle.tareasActivas.length === 0 ? (
                <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>Este hogar no tiene tareas activas.</div>
              ) : (
                <div className={styles.lista}>
                  {detalle.tareasActivas.map(t => (
                    <div key={t.id} className={`tarjeta-cristal ${styles.filaUsuario}`}>
                      <div className={styles.avatarMini}><ListChecks size={16} color="#90b4ce" /></div>
                      <div className={styles.flex1}>
                        <div className={styles.filaTitulo}>
                          {t.nombreTarea}
                          <span className={styles.badgeEstado}>{t.estado}</span>
                        </div>
                        <div className={styles.filaMeta}>
                          {t.tipo} · {t.nombreAsignado} · {formatearFecha(t.fechaLimite)}
                        </div>
                      </div>
                      <span className={styles.badgePuntos}><Award size={12} /> {t.puntos} pts</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}