import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { apiFetch } from '../Servicios/apiFetch';
import { Plus, Users, X } from 'lucide-react';
import { getApariencia } from '../Configuracion/AparienciasHogar';
import { API_URL } from '../Configuracion/apiConfig';
import styles from './PHogares.module.css';

export default function PHogares() {
  const navigate = useNavigate();
  const { usuario } = useSesion();

  const [hogares, setHogares] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    if (!usuario?.id) return;

    apiFetch(`${API_URL}/api/hogares/usuario/${usuario.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar los hogares');
        return res.json();
      })
      .then(datos => {
        setHogares(datos);
        setCargando(false);
      })
      .catch(err => {
        setError(err.message);
        setCargando(false);
      });
  }, [usuario]);

  const irAlPanel = (hogar) => {
    navigate('/panelhogar', { state: { hogarActivo: hogar } });
  };

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="hogares" />

      <main className="main-content">
        <header>
          <h1 className={styles.tituloPrincipal}>Mis Hogares</h1>
          <p className={styles.subtituloPrincipal}>Gestiona los pisos y comunidades a los que perteneces.</p>
        </header>

        {cargando ? (
          <p className={styles.textoCargando}>Cargando hogares...</p>
        ) : error ? (
          <p className={styles.textoError}>{error}</p>
        ) : (
          <div className={styles.gridHogares}>

            {/* Botón añadir hogar */}
            <div
              className={`tarjeta-cristal ${styles.tarjetaHogar} ${styles.btnAdd}`}
              onClick={() => setMostrarForm(true)}
            >
              <Plus size={48} strokeWidth={1.5} />
              <span className={styles.textoAdd}>Añadir Hogar</span>
            </div>

            {/* Lista de hogares */}
            {hogares.map(h => {
              const apariencia = getApariencia(h.aparienciaId);
              const { Icono } = apariencia;
              return (
                <div
                  key={h.id}
                  className={`tarjeta-cristal ${styles.tarjetaHogar}`}
                  onClick={() => irAlPanel(h)}
                >
                  {/* Cabecera con gradiente e icono */}
                  <div className={styles.cabeceraTarjeta} style={{ background: apariencia.gradiente }}>
                    {Icono && <Icono size={36} color="white" strokeWidth={1.5} />}
                  </div>

                  {/* Contenido */}
                  <div className={styles.cuerpoTarjeta}>
                    <div className={styles.filaTituloHogar}>
                      <h3 className={styles.nombreHogar}>{h.nombre}</h3>
                      <span className={styles.badgeCodigo}>#{h.codigoInvitacion}</span>
                    </div>
                    <p className={styles.miembrosHogar}>
                      <Users size={16} /> {h.miembros} miembro{h.miembros !== 1 ? 's' : ''} activo{h.miembros !== 1 ? 's' : ''}
                    </p>
                    <button className={`boton-primario ${styles.btnEntrarTablon}`}>
                      Entrar al tablón
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal añadir hogar */}
      {mostrarForm && (
        <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="tarjeta-cristal modal-contenido" onClick={(e) => e.stopPropagation()}>

            <button className="btn-cerrar-modal" onClick={() => setMostrarForm(false)}>
              <X size={20} strokeWidth={2.5} />
            </button>

            <h2 className={styles.tituloModal}>Añadir Hogar</h2>
            <p className={styles.subtituloModal}>¿Qué te gustaría hacer?</p>

            <div className={styles.accionesModal}>
              <button className={`boton-primario ${styles.btnCrearHogar}`} onClick={() => navigate('/pcrearhogar')}>
                Crear un hogar nuevo
              </button>

              <div className={styles.separadorModal}>
                <div className={styles.lineaSeparador} />
                <span className={styles.textoSeparador}>O</span>
                <div className={styles.lineaSeparador} />
              </div>

              <button
                className={styles.btnUnirseCodigo}
                onClick={() => navigate('/punirsehogar')}
              >
                Unirse con un Código
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}