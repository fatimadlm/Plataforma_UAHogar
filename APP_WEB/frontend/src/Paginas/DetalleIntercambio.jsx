import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSesion } from '../Seguridad/ContextoSesion';
import Sidebar from '../Componentes/Sidebar';
import { ArrowLeft, ArrowLeftRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getIntercambio, aceptarIntercambio, rechazarIntercambio } from '../Servicios/PeticionTarea';
import styles from './DetalleIntercambio.module.css';

export default function DetalleIntercambio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useSesion();

  const [intercambio, setIntercambio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [respondiendo, setRespondiendo] = useState(false);

  // Cargamos los datos de la solicitud de intercambio
  const cargar = async () => {
    try {
      const datos = await getIntercambio(id);
      setIntercambio(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (id && usuario?.id) cargar();
  }, [id, usuario]);

  // Enviamos la respuesta (aceptar o rechazar) y refrescamos los datos
  const responder = async (aceptar) => {
    setRespondiendo(true);
    setError(null);
    try {
      if (aceptar) await aceptarIntercambio(id);
      else await rechazarIntercambio(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setRespondiendo(false);
    }
  };

  // Damos formato a la fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (cargando) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="notificaciones" />
        <main className="main-content">
          <p className={styles.textoCargando}>Cargando solicitud...</p>
        </main>
      </div>
    );
  }

  if (error && !intercambio) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="notificaciones" />
        <main className="main-content">
          <p className={styles.textoError}>{error}</p>
        </main>
      </div>
    );
  }

  const pendiente = intercambio.estado === 'PENDIENTE';
  const aceptada = intercambio.estado === 'ACEPTADA';
  const caducada = intercambio.estado === 'CADUCADA';
  const esDestinatario = Number(usuario?.id) === Number(intercambio.destinatarioId);

  // Verificamos si la tarea supera su fecha límite
  const posiblementeNoIntercambiable = pendiente && intercambio.fechaLimite && new Date() > new Date(intercambio.fechaLimite);

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="notificaciones" />

      <main className="main-content">
        <button onClick={() => navigate(-1)} className={styles.botonVolver}>
          <ArrowLeft size={18} /> Volver
        </button>

        <div className={`tarjeta-cristal ${styles.tarjeta}`}>
          <div className={styles.cabecera}>
            {pendiente ? (
              <ArrowLeftRight size={28} color="#3d5a80" />
            ) : aceptada ? (
              <CheckCircle2 size={28} color="#06d6a0" />
            ) : (
              <XCircle size={28} color="#e76f51" />
            )}
            <div>
              <h1 className={styles.titulo}>{intercambio.nombreTarea}</h1>
              <span className={
                pendiente ? styles.badgePendiente 
                : aceptada ? styles.badgeAceptada 
                : styles.badgeRechazada
              }>
                {pendiente ? 'Pendiente de respuesta' : aceptada ? 'Aceptada' : caducada ? 'Caducada' : 'Rechazada'}
              </span>
            </div>
          </div>

          <p className={styles.meta}>
            Hogar <strong>{intercambio.nombreHogar}</strong>
            {intercambio.puntos != null && <> · {intercambio.puntos} pts</>}
          </p>

          <div className={styles.bloqueCambio}>
            <span className={styles.nombreUsuario}>{intercambio.nombreSolicitante}</span>
            <ArrowLeftRight size={18} className={styles.flechaBloque} />
            <span className={styles.nombreUsuario}>{intercambio.nombreDestinatario}</span>
          </div>

          <div className={styles.fecha}>
            <Clock size={13} /> Solicitado el {formatearFecha(intercambio.fechaSolicitud)}
          </div>

          {error && <p className={styles.mensajeError}>{error}</p>}

          {/* Mensaje de caducidad */}
          {caducada && (
            <p className={`${styles.fecha} ${styles.fechaRespuesta}`}>
              Esta solicitud ha caducado: la tarea no se pudo intercambiar mientras esperaba respuesta.
            </p>
          )}

          {/* Fecha de respuesta si la solicitud ya fue gestionada */}
          {!pendiente && !caducada && (
            <p className={`${styles.fecha} ${styles.fechaRespuesta}`}>
              Respondido el {formatearFecha(intercambio.fechaRespuesta)}
            </p>
          )}

          {/* Aviso si tarea  vencida o en margen de gracia */}
          {posiblementeNoIntercambiable && esDestinatario && (
            <p className={styles.avisoVencida}>
              Esta tarea ha pasado su tiempo límite.
            </p>
          )}

          {/* Botones de aeptar o rechazar*/}
          {pendiente && esDestinatario && (
            <div className={styles.acciones}>
              <button
                className={styles.botonRechazar}
                onClick={() => responder(false)}
                disabled={respondiendo}
              >
                Rechazar
              </button>
              <button
                className={`boton-primario ${styles.botonAceptar}`}
                onClick={() => responder(true)}
                disabled={respondiendo}
              >
                {respondiendo ? 'Enviando...' : 'Aceptar'}
              </button>
            </div>
          )}

          {/* Mensaje  espera */}
          {pendiente && !esDestinatario && (
            <p className={styles.esperando}>
              Esperando a que {intercambio.nombreDestinatario} responda.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}