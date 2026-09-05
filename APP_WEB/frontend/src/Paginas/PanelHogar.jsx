import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../Seguridad/ContextoSesion';
import Sidebar from '../Componentes/Sidebar';
import TareasHogar from './TareasHogar';
import { Calendar, Users, History, PlusCircle, ArrowLeft, Clock, UserPlus, UserX, LogOut, X, Trophy, Medal, ClipboardList, AlertTriangle } from 'lucide-react';
import { getApariencia } from '../Configuracion/AparienciasHogar';
import { podiumConfig } from '../Configuracion/TareaConfig';
import { getPanelHogar, expulsarMiembro, abandonarHogar } from '../Servicios/PeticionTarea';
import { API_URL } from '../Configuracion/apiConfig';
import styles from './PanelHogar.module.css';

export default function PanelHogar() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const hogar      = state?.hogarActivo;
  const apariencia = getApariencia(hogar?.aparienciaId);
  const { Icono }  = apariencia;
  const { usuario: usuarioLogueado } = useSesion();

  const [miembros, setMiembros]     = useState([]);
  const [actividad, setActividad]   = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [mostrarModalInvitacion, setMostrarModalInvitacion] = useState(false);
  const [mostrarTodosMiembros, setMostrarTodosMiembros]     = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [miembroAExpulsar, setMiembroAExpulsar] = useState(null);
  const [expulsando, setExpulsando]         = useState(false);
  const [errorExpulsion, setErrorExpulsion] = useState(null);
  const [mostrarConfirmSalir, setMostrarConfirmSalir] = useState(false); // modal de "salir del hogar"
  const [saliendo, setSaliendo]     = useState(false);
  const [errorSalir, setErrorSalir] = useState(null);

  // Referencia al bloque de tareas para el scroll automatico
  const refTareas = useRef(null);

  const LIMITE_MIEMBROS = 5;

  // Solo el ADMIN del hogar puede expulsar miembros
  const esAdmin = hogar?.rol === 'ADMIN';

  const cargarPanel = () => {
    if (!hogar?.id) return;
    getPanelHogar(hogar.id)
      .then(datos => {
        setMiembros(datos.miembros || []);
        setActividad(datos.actividad || []);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarPanel();
  }, [hogar]);

  // Expulsa al miembro seleccionado y recarga el panel
  const confirmarExpulsion = async () => {
    if (!miembroAExpulsar) return;
    setExpulsando(true);
    setErrorExpulsion(null);
    try {
      await expulsarMiembro(hogar.id, miembroAExpulsar.id);
      setMiembroAExpulsar(null);
      cargarPanel();
    } catch (err) {
      setErrorExpulsion(err.message);
    } finally {
      setExpulsando(false);
    }
  };

  // Sale del hogar y vuelve al listado de hogares
  const confirmarSalida = async () => {
    setSaliendo(true);
    setErrorSalir(null);
    try {
      await abandonarHogar(hogar.id);
      navigate('/phogares');
    } catch (err) {
      setErrorSalir(err.message);
      setSaliendo(false);
    }
  };

  // Alternamos la seccion de tareas y hacemos scroll hasta ella
  const toggleTareas = () => {
    setSeccionActiva(prev => {
      const nueva = prev === 'tareas' ? 'inicio' : 'tareas';
      if (nueva === 'tareas') {
        setTimeout(() => {
          refTareas.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      return nueva;
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const ahora = new Date();
    const diffDias = Math.floor((ahora - d) / (1000 * 60 * 60 * 24));
    if (diffDias === 0) return `Hoy, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (diffDias === 1) return `Ayer, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `Hace ${diffDias} días`;
  };

  if (!hogar) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="hogares" />
        <main className={`main-content ${styles.mainVacio}`}>
          <p className={styles.textoVacio}>No se ha seleccionado ningún hogar.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="hogares" />

      <main className="main-content">
        <button
          className={styles.btnVolver}
          onClick={() => navigate('/phogares')}
        >
          <ArrowLeft size={18} /> Volver a mis hogares
        </button>

        {/* Cabecera */}
        <div className={styles.headerPanel} style={{ background: apariencia.gradiente }}>
          <div className={styles.headerIcono}>
            <Icono size={60} color="rgba(255,255,255,0.25)" strokeWidth={1.2} />
          </div>
          <div className={styles.headerTexto}>
            <h1 className={styles.headerTitulo}>{hogar.nombre}</h1>
            <p className={styles.headerSubtitulo}>
              Código de acceso: #{hogar.codigoInvitacion}
            </p>
          </div>
        </div>

        <div className={styles.gridDashboard}>

          {/* Acciones rápidas */}
          <div className={`tarjeta-cristal ${styles.seccionPanel}`}>
            <div className={styles.tituloSeccion}>
              <span className={styles.tituloSeccionTexto}><PlusCircle size={20} /> Acciones Rápidas</span>
            </div>
            <div className={styles.accionesLista}>
              <button
                className={`boton-primario ${styles.btnAccionPrimaria}`}
                onClick={() => navigate('/calendariohogar', { state: { hogarActivo: hogar } })}
              >
                <Calendar size={20} /> Ver Calendario del Hogar
              </button>
              <button
                className={`${styles.btnAccionSecundaria} ${seccionActiva === 'tareas' ? styles.btnAccionActiva : ''}`}
                onClick={toggleTareas}
              >
                <ClipboardList size={20} /> Gestionar Tareas
              </button>
              {esAdmin && (
                <button
                  className={styles.btnAccionSecundaria}
                  onClick={() => navigate('/incidenciahogar', { state: { hogarActivo: hogar } })}
                >
                  <AlertTriangle size={20} /> Ver Incidencias
                </button>
              )}
              <button
                className={styles.btnSalir}
                onClick={() => { setErrorSalir(null); setMostrarConfirmSalir(true); }}
              >
                <LogOut size={20} /> Salir del Hogar
              </button>
            </div>
          </div>

          {/* Miembros */}
          <div className={`tarjeta-cristal ${styles.seccionPanel}`}>
            <div className={styles.tituloSeccion}>
              <span className={styles.tituloSeccionTexto}><Users size={20} /> Miembros</span>
              <button className={styles.btnAddMini} onClick={() => setMostrarModalInvitacion(true)} title="Invitar miembro">
                <UserPlus size={16} strokeWidth={2.5} />
              </button>
            </div>
            {cargando ? (
              <p className={styles.textoEstado}>Cargando...</p>
            ) : (
              <>
                <div className={styles.listaMiembros}>
                  {miembros.slice(0, LIMITE_MIEMBROS).map(m => {
                    const esMiMismo = m.id === usuarioLogueado?.id;
                    return (
                      <div
                        key={m.id}
                        className={`${styles.miembroFila} ${!esMiMismo ? styles.miembroClickable : ''}`}
                        onClick={() => !esMiMismo && navigate(`/perfil-ajeno/${m.id}`)}
                        title={esMiMismo ? 'Eres tú' : `Ver perfil de ${m.nombre}`}
                      >
                        <div className={styles.avatarMini}>
                          {m.imagenPerfil
                            ? <img src={m.imagenPerfil.startsWith('http') ? m.imagenPerfil : `${API_URL}${m.imagenPerfil}`} alt={m.nombre} className={styles.avatarImg} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = m.nombre.charAt(0).toUpperCase(); }} />
                            : m.nombre.charAt(0).toUpperCase()
                          }
                        </div>
                        <div className={styles.flex1}>
                          <div className={styles.miembroNombre}>
                            {m.nombre} {esMiMismo && <span className={styles.miembroTu}>(tú)</span>}
                          </div>
                          <div className={styles.miembroMeta}>{m.rol} · {m.puntos} pts</div>
                        </div>
                        {esAdmin && !esMiMismo && (
                          <button
                            className={styles.btnExpulsar}
                            title={`Expulsar a ${m.nombre}`}
                            onClick={(e) => { e.stopPropagation(); setErrorExpulsion(null); setMiembroAExpulsar(m); }}
                          >
                            <UserX size={15} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {miembros.length > LIMITE_MIEMBROS && (
                  <button
                    className={styles.btnVerTodos}
                    onClick={() => setMostrarTodosMiembros(true)}
                  >
                    Ver todos ({miembros.length}) →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Ranking */}
          <div className={`tarjeta-cristal ${styles.seccionPanel}`}>
            <div className={`${styles.tituloSeccion} ${styles.tituloSeccionClickable}`} onClick={() => navigate('/rankinghogar', { state: { hogarActivo: hogar } })}>
              <span className={styles.tituloSeccionTexto}><Trophy size={20} /> Ranking del Hogar</span>
              <span className={styles.verMas}>Ver más →</span>
            </div>
            {cargando ? (
              <p className={styles.textoEstado}>Cargando...</p>
            ) : miembros.length === 0 ? (
              <p className={styles.textoEstado}>Sin datos aún.</p>
            ) : (
              <div className={styles.listaRanking}>
                {miembros.map((m, i) => {
                  const config = podiumConfig[i] || { color: '#90b4ce', label: `${i + 1}º`, icono: Medal };
                  const IconoPodium = config.icono;
                  return (
                    <div key={m.id} className={`${styles.rankingFila} ${i === 0 ? styles.rankingFilaPrimero : ''}`}>
                      <IconoPodium size={i === 0 ? 22 : 18} color={config.color} />
                      <span className={styles.rankingPos} style={{ color: config.color }}>{config.label}º</span>
                      <div className={`${styles.avatarMini} ${i === 0 ? styles.avatarOro : ''}`}>
                        {m.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.flex1}>
                        <div className={styles.rankingNombre}>{m.nombre}</div>
                      </div>
                      <span className={styles.rankingPuntos} style={{ color: config.color }}>{m.puntos} pts</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actividad reciente */}
          <div className={`tarjeta-cristal ${styles.seccionPanel}`}>
            <div className={`${styles.tituloSeccion} ${styles.tituloSeccionClickable}`} onClick={() => navigate('/feedhogar', { state: { hogar } })}>
              <span className={styles.tituloSeccionTexto}><History size={20} /> Actividad Reciente</span>
              <span className={styles.verMas}>Ver todo →</span>
            </div>
            {cargando ? (
              <p className={styles.textoEstado}>Cargando...</p>
            ) : actividad.length === 0 ? (
              <p className={styles.textoEstado}>Aún no hay actividad en este hogar.</p>
            ) : (
              <div className={styles.listaActividad}>
                {actividad.map(a => (
                  <div key={a.id} className={styles.hItem}>
                    <Clock size={16} className={styles.hIcono} />
                    <div>
                      <span className={styles.actividadUsuario}>{a.nombreUsuario}</span> completó "{a.nombreTarea}"
                      <div className={styles.actividadMeta}>{formatearFecha(a.fechaCompletada)} · +{a.puntosSumados} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Seccion de tareas con scroll automatico */}
        {seccionActiva === 'tareas' && (
          <div ref={refTareas} className={styles.seccionTareas}>
            <TareasHogar hogar={hogar} miembros={miembros} />
          </div>
        )}

      </main>

      {/* Modal invitación */}
      {mostrarModalInvitacion && (
        <div className="modal-overlay" onClick={() => setMostrarModalInvitacion(false)}>
          <div className="tarjeta-cristal modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar-modal" onClick={() => setMostrarModalInvitacion(false)}>
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 className={styles.modalTituloGrande}>
              Invitar a un compañero
            </h2>
            <p className={styles.modalParrafo}>
              Comparte este código con la persona que quieres añadir a <strong>{hogar.nombre}</strong>.
            </p>
            <div className={styles.codigoCaja}>
              <p className={styles.codigoLabel}>
                Código de invitación
              </p>
              <span className={styles.codigoValor}>
                {hogar.codigoInvitacion}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal todos los miembros */}
      {mostrarTodosMiembros && (
        <div className="modal-overlay" onClick={() => setMostrarTodosMiembros(false)}>
          <div className="tarjeta-cristal modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar-modal" onClick={() => setMostrarTodosMiembros(false)}>
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 className={styles.modalTituloLista}>
              Miembros de {hogar.nombre}
            </h2>
            <p className={styles.modalConteo}>
              {miembros.length} miembro{miembros.length !== 1 ? 's' : ''}
            </p>
            <div className={styles.listaMiembrosModal}>
              {miembros.map(m => {
                const esMiMismo = m.id === usuarioLogueado?.id;
                return (
                  <div
                    key={m.id}
                    className={`${styles.miembroFila} ${!esMiMismo ? styles.miembroClickable : ''}`}
                    onClick={() => { if (esMiMismo) return; setMostrarTodosMiembros(false); navigate(`/perfil-ajeno/${m.id}`); }}
                    title={esMiMismo ? 'Eres tú' : `Ver perfil de ${m.nombre}`}
                  >
                    <div className={styles.avatarMini}>
                      {m.imagenPerfil
                        ? <img src={m.imagenPerfil.startsWith('http') ? m.imagenPerfil : `${API_URL}${m.imagenPerfil}`} alt={m.nombre} className={styles.avatarImg} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = m.nombre.charAt(0).toUpperCase(); }} />
                        : m.nombre.charAt(0).toUpperCase()
                      }
                    </div>
                    <div className={styles.flex1}>
                      <div className={styles.miembroNombre}>
                        {m.nombre} {esMiMismo && <span className={styles.miembroTu}>(tú)</span>}
                      </div>
                      <div className={styles.miembroMeta}>{m.rol} · {m.puntos} pts</div>
                    </div>
                    {esAdmin && !esMiMismo && (
                      <button
                        className={styles.btnExpulsar}
                        title={`Expulsar a ${m.nombre}`}
                        onClick={(e) => { e.stopPropagation(); setErrorExpulsion(null); setMiembroAExpulsar(m); }}
                      >
                        <UserX size={15} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación de expulsión */}
      {miembroAExpulsar && (
        <div className="modal-overlay" onClick={() => !expulsando && setMiembroAExpulsar(null)}>
          <div className="tarjeta-cristal modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar-modal" onClick={() => setMiembroAExpulsar(null)} disabled={expulsando}>
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 className={styles.modalTitulo}>
              ¿Expulsar a {miembroAExpulsar.nombre}?
            </h2>
            <p className={styles.modalTexto}>
              {miembroAExpulsar.nombre} dejará de formar parte de <strong>{hogar.nombre}</strong>.
              Sus tareas pendientes se liberarán y se redistribuirán automáticamente entre el resto de miembros.
            </p>
            {errorExpulsion && (
              <p className={styles.modalError}>{errorExpulsion}</p>
            )}
            <div className={styles.modalAcciones}>
              <button
                className={styles.btnCancelar}
                onClick={() => setMiembroAExpulsar(null)}
                disabled={expulsando}
              >
                Cancelar
              </button>
              <button
                className={styles.btnConfirmarPeligro}
                onClick={confirmarExpulsion}
                disabled={expulsando}
              >
                {expulsando ? 'Expulsando...' : 'Sí, expulsar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación de salida del hogar */}
      {mostrarConfirmSalir && (
        <div className="modal-overlay" onClick={() => !saliendo && setMostrarConfirmSalir(false)}>
          <div className="tarjeta-cristal modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar-modal" onClick={() => setMostrarConfirmSalir(false)} disabled={saliendo}>
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 className={styles.modalTitulo}>
              ¿Salir de {hogar.nombre}?
            </h2>
            <p className={styles.modalTexto}>
              Dejarás de formar parte de este hogar. Tus tareas pendientes se liberarán
              y se redistribuirán automáticamente entre el resto de miembros.
            </p>
            {errorSalir && (
              <p className={styles.modalError}>{errorSalir}</p>
            )}
            <div className={styles.modalAcciones}>
              <button
                className={styles.btnCancelar}
                onClick={() => setMostrarConfirmSalir(false)}
                disabled={saliendo}
              >
                Cancelar
              </button>
              <button
                className={styles.btnConfirmarPeligro}
                onClick={confirmarSalida}
                disabled={saliendo}
              >
                {saliendo ? 'Saliendo...' : 'Sí, salir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}