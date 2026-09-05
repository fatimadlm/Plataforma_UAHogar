import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../Seguridad/ContextoSesion';
import Sidebar from '../Componentes/Sidebar';
import { Shield, Users, Home as HomeIcon, ClipboardList, Search, Lock, Unlock, Trash2, ShieldCheck, ShieldOff, UserCircle2, Building2, AlertTriangle, MessageSquare, Ghost, CheckCircle2, Eye, History } from 'lucide-react';
import { TIPOS, ESTADOS_TAREA } from '../Configuracion/TareaConfig';
import { getMetricasGlobales,getUsuariosSupervision, alternarBloqueoUsuario, cambiarRolUsuario, eliminarUsuarioSupervision,getHogaresSupervision, eliminarHogarSupervision, limpiarHogaresFantasma,getTareasSupervision, eliminarTareaSupervision, getIncidenciasSupervision, cerrarIncidenciaSupervision, getAuditoriaSupervision} from '../Servicios/PeticionSupervisor';
import ModalConfirmacion from '../Componentes/Modulos/ModalConfirmacion';
import ModalDetalleHogar from '../Componentes/Modulos/ModalDetalleHogar';
import styles from './PanelSupervisor.module.css';
import {ACCIONES_AUDITORIA} from '../Configuracion/SupervisorConfig';
import { API_URL, manejarErrorImagen } from '../Configuracion/apiConfig';


export default function PanelSupervisor() {
  const [pestana, setPestana] = useState('metricas');

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="supervisor" />

      <main className="main-content">
        <div className={styles.headerPanel}>
          <div className={styles.headerIcono}>
            <Shield size={60} color="rgba(255,255,255,0.25)" strokeWidth={1.2} />
          </div>
          <div>
            <h1 className={styles.headerTitulo}>Panel de Supervisión</h1>
            <p className={styles.headerSubtitulo}>
              Gestión de la plataforma UAHogar
            </p>
          </div>
        </div>

        {/* Pestañas */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${pestana === 'metricas' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('metricas')}
          >
            <Shield size={18} /> Métricas
          </button>

          <button
            className={`${styles.tabBtn} ${pestana === 'usuarios' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('usuarios')}
          >
            <Users size={18} /> Usuarios
          </button>

          <button
            className={`${styles.tabBtn} ${pestana === 'hogares' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('hogares')}
          >
            <HomeIcon size={18} /> Hogares
          </button>

          <button
            className={`${styles.tabBtn} ${pestana === 'tareas' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('tareas')}
          >
            <ClipboardList size={18} /> Tareas
          </button>

          <button
            className={`${styles.tabBtn} ${pestana === 'incidencias' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('incidencias')}
          >
            <AlertTriangle size={18} /> Incidencias
          </button>
          <button
            className={`${styles.tabBtn} ${pestana === 'auditoria' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('auditoria')}
          >
            <History size={18} /> Auditoría
          </button>
        </div>

        {pestana === 'metricas' && <PestanaMetricas />}
        {pestana === 'usuarios' && <PestanaUsuarios />}
        {pestana === 'hogares' && <PestanaHogares />}
        {pestana === 'tareas' && <PestanaTareas />}
        {pestana === 'incidencias' && <PestanaIncidencias />}
        {pestana === 'auditoria' && <PestanaAuditoria />}
      </main>
    </div>
  );
}

// Métricas

function PestanaMetricas() {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMetricasGlobales()
      .then(setMetricas)
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <p className={styles.textoEstado}>Cargando métricas...</p>;
  }

  if (error) {
    return <p className={styles.mensajeError}>{error}</p>;
  }

  const tarjetas = [
    {
      label: 'Usuarios registrados',
      valor: metricas.totalUsuarios,
      icono: Users,
      color: '#90b4ce'
    },
    {
      label: 'Hogares creados',
      valor: metricas.totalHogares,
      icono: Building2,
      color: '#2a9d8f'
    },
    {
      label: 'Tareas activas',
      valor: metricas.tareasActivas,
      icono: ClipboardList,
      color: '#f4a261'
    },
    {
      label: 'Incidencias abiertas',
      valor: metricas.incidenciasAbiertas,
      icono: AlertTriangle,
      color: '#e76f51'
    }
  ];

  return (
    <div className={styles.gridMetricas}>
      {tarjetas.map(t => {
        const Icono = t.icono;

        return (
          <div
            key={t.label}
            className={`tarjeta-cristal ${styles.tarjetaMetrica}`}
          >
            <div
              className={styles.metricaIcono}
              style={{ background: `${t.color}22` }}
            >
              <Icono size={26} color={t.color} />
            </div>

            <div>
              <div className={styles.metricaValor}>{t.valor}</div>
              <div className={styles.metricaLabel}>{t.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

//Usuarios

function PestanaUsuarios() {
  const navigate = useNavigate();
  const { usuario: usuarioSesion, cerrarSesion } = useSesion();
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Guardamos la acción pendiente de confirmar
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(() => {
    setCargando(true);

    getUsuariosSupervision(busqueda, estado)
      .then(setUsuarios)
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, [busqueda, estado]);

  useEffect(() => {
    const temporizador = setTimeout(cargar, 300);

    return () => clearTimeout(temporizador);
  }, [cargar]);

  const confirmarAccion = async () => {
    if (!accionPendiente) return;

    setProcesando(true);
    setError(null);

    try {
      const { tipo, usuario } = accionPendiente;

      if (tipo === 'bloquear') {
        await alternarBloqueoUsuario(usuario.id);
      }

      if (tipo === 'rol') {
        await cambiarRolUsuario(
          usuario.id,
          usuario.rolGlobal === 'SUPERVISOR'
            ? 'USER'
            : 'SUPERVISOR'
        );
      }

      if (tipo === 'eliminar') {
        await eliminarUsuarioSupervision(usuario.id);
      }

      //Cierra sesion y te lleva a login
      if (tipo === 'rol' && usuarioSesion?.id === usuario.id) {
        cerrarSesion();
        navigate('/login');
        return;
      }

      setAccionPendiente(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div>
      {/* Buscador y filtro */}
      <div className={styles.barraFiltros}>
        <div className={styles.campoBusqueda}>
          <Search size={18} color="#90b4ce" />

          <input
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={styles.inputBusqueda}
          />
        </div>

        <select
          value={estado}
          onChange={e => setEstado(e.target.value)}
          className={styles.selectFiltro}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
      </div>

      {error && <p className={styles.mensajeError}>{error}</p>}

      {cargando ? (
        <p className={styles.textoEstado}>Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>
          No se han encontrado usuarios.
        </div>
      ) : (
        <div className={styles.lista}>
          {usuarios.map(u => (
            <div
              key={u.id}
              className={`tarjeta-cristal ${styles.filaUsuario}`}
            >
              <div className={styles.avatarMini}>
                {u.imagenPerfil ? (
                  <img
                    src={
                      u.imagenPerfil.startsWith('http')
                        ? u.imagenPerfil
                        : `${API_URL}${u.imagenPerfil}`
                    }
                    alt={u.nombre}
                    className={styles.avatarImg}
                    onError={manejarErrorImagen}
                  />
                ) : (
                  <UserCircle2 size={22} color="#90b4ce" />
                )}
              </div>

              <div className={styles.flex1}>
                <div className={styles.filaTitulo}>
                  {u.nombre}

                  {u.rolGlobal === 'SUPERVISOR' && (
                    <span className={styles.badgeSupervisor}>
                      Supervisor
                    </span>
                  )}

                  {u.bloqueado && (
                    <span className={styles.badgeBloqueado}>
                      Bloqueado
                    </span>
                  )}
                </div>

                <div className={styles.filaMeta}>
                  @{u.usuario} · {u.email}
                </div>
              </div>

              <div className={styles.filaAcciones}>
                <button
                  className={styles.btnAccionMini}
                  title={`Escribir a ${u.nombre}`}
                  onClick={() =>
                    navigate('/mensajes', {
                      state: {
                        abrirChatCon: {
                          otroUsuarioId: u.id,
                          nombre: u.nombre,
                          imagenPerfil: u.imagenPerfil
                        }
                      }
                    })
                  }
                >
                  <MessageSquare size={16} />
                </button>

                <button
                  className={styles.btnAccionMini}
                  title={
                    u.rolGlobal === 'SUPERVISOR'
                      ? 'Revocar supervisor'
                      : 'Promover a supervisor'
                  }
                  onClick={() =>
                    setAccionPendiente({
                      tipo: 'rol',
                      usuario: u
                    })
                  }
                >
                  {u.rolGlobal === 'SUPERVISOR' ? (
                    <ShieldOff size={16} />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                </button>

                <button
                  className={styles.btnAccionMini}
                  title={u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                  onClick={() =>
                    setAccionPendiente({
                      tipo: 'bloquear',
                      usuario: u
                    })
                  }
                >
                  {u.bloqueado ? (
                    <Unlock size={16} />
                  ) : (
                    <Lock size={16} />
                  )}
                </button>

                <button
                  className={`${styles.btnAccionMini} ${styles.btnAccionPeligro}`}
                  title="Eliminar usuario"
                  onClick={() =>
                    setAccionPendiente({
                      tipo: 'eliminar',
                      usuario: u
                    })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {accionPendiente && (
        <ModalConfirmacion
          titulo={tituloAccionUsuario(accionPendiente)}
          texto={textoAccionUsuario(accionPendiente, usuarioSesion?.id === accionPendiente.usuario.id)}
          procesando={procesando}
          onCancelar={() => setAccionPendiente(null)}
          onConfirmar={confirmarAccion}
        />
      )}
    </div>
  );
}

function tituloAccionUsuario({ tipo, usuario }) {
  if (tipo === 'bloquear') {
    return usuario.bloqueado
      ? `¿Desbloquear a ${usuario.nombre}?`
      : `¿Bloquear a ${usuario.nombre}?`;
  }

  if (tipo === 'rol') {
    return usuario.rolGlobal === 'SUPERVISOR'
      ? `¿Revocar supervisor a ${usuario.nombre}?`
      : `¿Promover a ${usuario.nombre} a supervisor?`;
  }

  return `¿Eliminar a ${usuario.nombre}?`;
}

function textoAccionUsuario({ tipo, usuario }, esUnoMismo = false) {
  if (tipo === 'bloquear') {
    return usuario.bloqueado
      ? 'El usuario podrá volver a iniciar sesión con normalidad.'
      : 'El usuario no podrá iniciar sesión hasta que se le desbloquee.';
  }

  if (tipo === 'rol') {
    if (esUnoMismo && usuario.rolGlobal === 'SUPERVISOR') {
      return 'Perderás el acceso al panel de supervisión y se cerrará tu sesión ahora mismo. Tendrás que volver a iniciar sesión.';
    }
    return usuario.rolGlobal === 'SUPERVISOR'
      ? 'Dejará de tener acceso al panel de supervisión y volverá a ser un usuario normal.'
      : 'Tendrá acceso al panel de supervisión con los mismos privilegios que tú.';
  }

  return 'Se intentará borrar al usuario. Si tiene tareas u hogares asociados que lo impiden, se bloqueará en su lugar.';
}

// Hogares
function PestanaHogares() {
  const [hogares, setHogares] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [hogarAEliminar, setHogarAEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [confirmarLimpieza, setConfirmarLimpieza] = useState(false);
  const [limpiando, setLimpiando] = useState(false);
  const [avisoLimpieza, setAvisoLimpieza] = useState(null);
  const [hogarAVer, setHogarAVer] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);

    getHogaresSupervision(busqueda)
      .then(setHogares)
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, [busqueda]);

  useEffect(() => {
    const temporizador = setTimeout(cargar, 300);

    return () => clearTimeout(temporizador);
  }, [cargar]);

  const confirmarEliminar = async () => {
    if (!hogarAEliminar) return;

    setProcesando(true);
    setError(null);

    try {
      await eliminarHogarSupervision(hogarAEliminar.id);

      setHogarAEliminar(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const numFantasmas = hogares.filter(h => h.fantasma).length;

  const confirmarLimpiarFantasmas = async () => {
    setLimpiando(true);
    setError(null);
    setAvisoLimpieza(null);

    try {
      const mensaje = await limpiarHogaresFantasma();
      setAvisoLimpieza(mensaje);
      setConfirmarLimpieza(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setLimpiando(false);
    }
  };

  return (
    <div>
      <div className={styles.barraFiltros}>
        <div className={styles.campoBusqueda}>
          <Search size={18} color="#90b4ce" />

          <input
            type="text"
            placeholder="Buscar por nombre o código de invitación..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={styles.inputBusqueda}
          />
        </div>

        {numFantasmas > 0 && (
          <button
            className={styles.btnLimpiarFantasmas}
            onClick={() => setConfirmarLimpieza(true)}
            title="Borra de golpe todos los hogares cuyos miembros son solo cuentas eliminadas"
          >
            <Ghost size={16} /> Limpiar {numFantasmas} fantasma{numFantasmas !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {avisoLimpieza && <p className={styles.textoEstado}>{avisoLimpieza}</p>}

      {error && <p className={styles.mensajeError}>{error}</p>}

      {cargando ? (
        <p className={styles.textoEstado}>Cargando hogares...</p>
      ) : hogares.length === 0 ? (
        <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>
          No se han encontrado hogares.
        </div>
      ) : (
        <div className={styles.lista}>
          {hogares.map(h => (
            <div
              key={h.id}
              className={`tarjeta-cristal ${styles.filaUsuario}`}
            >
              <div className={styles.avatarMini}>
                <Building2 size={20} color="#90b4ce" />
              </div>

              <div className={styles.flex1}>
                <div className={styles.filaTitulo}>
                  {h.nombre}
                  {h.fantasma && (
                    <span className={styles.badgeFantasma}>
                      <Ghost size={12} /> Fantasma
                    </span>
                  )}
                </div>

                <div className={styles.filaMeta}>
                  Código #{h.codigoInvitacion} · {h.numMiembros}{' '}
                  miembro{h.numMiembros !== 1 ? 's' : ''}
                  {h.fantasma && ' · Todos sus miembros son cuentas eliminadas'}
                </div>
              </div>

              <div className={styles.filaAcciones}>
                <button
                  className={styles.btnAccionMini}
                  title="Ver panel del hogar (solo lectura)"
                  onClick={() => setHogarAVer(h)}
                >
                  <Eye size={16} />
                </button>
                <button
                  className={`${styles.btnAccionMini} ${styles.btnAccionPeligro}`}
                  title="Eliminar hogar"
                  onClick={() => setHogarAEliminar(h)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hogarAEliminar && (
        <ModalConfirmacion
          titulo={`¿Eliminar el hogar "${hogarAEliminar.nombre}"?`}
          texto="Se borrarán también sus miembros, tareas y estancias. Esta acción no se puede deshacer."
          procesando={procesando}
          onCancelar={() => setHogarAEliminar(null)}
          onConfirmar={confirmarEliminar}
        />
      )}

      {hogarAVer && (
        <ModalDetalleHogar
          hogarId={hogarAVer.id}
          nombreHogar={hogarAVer.nombre}
          onCerrar={() => setHogarAVer(null)}
        />
      )}

      {confirmarLimpieza && (
        <ModalConfirmacion
          titulo={`¿Limpiar ${numFantasmas} hogar${numFantasmas !== 1 ? 'es' : ''} fantasma?`}
          texto="Son hogares cuyos miembros son todo cuentas ya eliminadas por un supervisor: nadie real puede volver a entrar en ellos. Se borrarán por completo y no se puede deshacer."
          procesando={limpiando}
          onCancelar={() => setConfirmarLimpieza(false)}
          onConfirmar={confirmarLimpiarFantasmas}
        />
      )}
    </div>
  );
}

// Tareas

function PestanaTareas() {
  const [tareas, setTareas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [orden, setOrden] = useState('fecha-asc');
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tareaAEliminar, setTareaAEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Cargamos la lista de usuarios 
  useEffect(() => {
    getUsuariosSupervision('', '')
      .then(setUsuarios)
      .catch(() => setUsuarios([]));
  }, []);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);

    getTareasSupervision(
      busqueda,
      estado,
      tipo,
      usuarioId,
      orden
    )
      .then(setTareas)
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, [busqueda, estado, tipo, usuarioId, orden]);

  useEffect(() => {
    const temporizador = setTimeout(cargar, 300);

    return () => clearTimeout(temporizador);
  }, [cargar]);

  const confirmarEliminar = async () => {
    if (!tareaAEliminar) return;

    setProcesando(true);
    setError(null);

    try {
      await eliminarTareaSupervision(tareaAEliminar.id);

      setTareaAEliminar(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = fecha => {
    if (!fecha) return 'Sin fecha límite';

    return new Date(fecha).toLocaleDateString(
      'es-ES',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  return (
    <div>
      <div className={styles.barraFiltros}>
        <div className={styles.campoBusqueda}>
          <Search size={18} color="#90b4ce" />

          <input
            type="text"
            placeholder="Buscar por nombre de tarea..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={styles.inputBusqueda}
          />
        </div>

        <select
          value={estado}
          onChange={e => setEstado(e.target.value)}
          className={styles.selectFiltro}
        >
          <option value="">Todos los estados</option>

          {ESTADOS_TAREA.map(e => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          className={styles.selectFiltro}
        >
          <option value="">Todos los tipos</option>

          {TIPOS.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={usuarioId}
          onChange={e => setUsuarioId(e.target.value)}
          className={styles.selectFiltro}
        >
          <option value="">Todos los usuarios</option>

          {usuarios.map(u => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>

        <select
          value={orden}
          onChange={e => setOrden(e.target.value)}
          className={styles.selectFiltro}
        >
          <option value="fecha-asc">
            Fecha límite (más próxima)
          </option>

          <option value="fecha-desc">
            Fecha límite (más lejana)
          </option>

          <option value="puntos-desc">
            Puntos (mayor a menor)
          </option>

          <option value="puntos-asc">
            Puntos (menor a mayor)
          </option>
        </select>
      </div>

      {error && (
        <p className={styles.mensajeError}>
          {error}
        </p>
      )}

      {cargando ? (
        <p className={styles.textoEstado}>
          Cargando tareas...
        </p>
      ) : tareas.length === 0 ? (
        <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>
          No se han encontrado tareas con esos filtros.
        </div>
      ) : (
        <div className={styles.lista}>
          {tareas.map(t => (
            <div
              key={t.id}
              className={`tarjeta-cristal ${styles.filaUsuario}`}
            >
              <div className={styles.avatarMini}>
                <ClipboardList
                  size={18}
                  color="#90b4ce"
                />
              </div>

              <div className={styles.flex1}>
                <div className={styles.filaTitulo}>
                  {t.nombreTarea}

                  <span className={styles.badgeEstado}>
                    {t.estado}
                  </span>

                  <span className={styles.badgePuntos}>
                    {t.puntos} pts
                  </span>
                </div>

                <div className={styles.filaMeta}>
                  {t.tipo} · {t.nombreHogar} · Asignada a{' '}
                  {t.nombreAsignado} ·{' '}
                  {formatearFecha(t.fechaLimite)}
                </div>
              </div>

              <div className={styles.filaAcciones}>
                <button
                  className={`${styles.btnAccionMini} ${styles.btnAccionPeligro}`}
                  title="Eliminar tarea"
                  onClick={() => setTareaAEliminar(t)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tareaAEliminar && (
        <ModalConfirmacion
          titulo={`¿Eliminar la tarea "${tareaAEliminar.nombreTarea}"?`}
          texto="Esta instancia de la tarea se borrará. La plantilla y el resto de instancias no se ven afectadas."
          procesando={procesando}
          onCancelar={() => setTareaAEliminar(null)}
          onConfirmar={confirmarEliminar}
        />
      )}
    </div>
  );
}

// Incidencias

function PestanaIncidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [incidenciaACerrar, setIncidenciaACerrar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(() => {
    setCargando(true);

    getIncidenciasSupervision(busqueda, estado)
      .then(setIncidencias)
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, [busqueda, estado]);

  // La búsqueda por texto lleva un pequeño retraso para no lanzar una petición en cada tecla
  useEffect(() => {
    const temporizador = setTimeout(cargar, 300);
    return () => clearTimeout(temporizador);
  }, [cargar]);

  const confirmarCerrar = async () => {
    if (!incidenciaACerrar) return;

    setProcesando(true);
    setError(null);

    try {
      await cerrarIncidenciaSupervision(incidenciaACerrar.id);

      setIncidenciaACerrar(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className={styles.barraFiltros}>
        <div className={styles.campoBusqueda}>
          <Search size={18} color="#90b4ce" />
          <input
            type="text"
            placeholder="Buscar por descripción o nombre de tarea..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={styles.inputBusqueda}
          />
        </div>
        <select value={estado} onChange={e => setEstado(e.target.value)} className={styles.selectFiltro}>
          <option value="">Todos los estados</option>
          <option value="OPEN">Abiertas</option>
          <option value="CLOSED">Cerradas</option>
        </select>
      </div>

      {error && <p className={styles.mensajeError}>{error}</p>}

      {cargando ? (
        <p className={styles.textoEstado}>Cargando incidencias...</p>
      ) : incidencias.length === 0 ? (
        <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>
          No se han encontrado incidencias.
        </div>
      ) : (
        <div className={styles.lista}>
          {incidencias.map(i => (
            <div
              key={i.id}
              className={`tarjeta-cristal ${styles.filaUsuario}`}
            >
              <div className={styles.avatarMini}>
                <AlertTriangle size={18} color={i.estado === 'OPEN' ? '#e76f51' : '#90b4ce'} />
              </div>

              <div className={styles.flex1}>
                <div className={styles.filaTitulo}>
                  {i.descripcion}
                  <span className={styles.badgeEstado}>{i.estado === 'OPEN' ? 'ABIERTA' : 'CERRADA'}</span>
                </div>

                <div className={styles.filaMeta}>
                  Tarea: {i.nombreTarea} · {i.nombreHogar} · Reportada por {i.nombreReportante} · Responsable: {i.nombreResponsable} · {formatearFecha(i.fechaCreacion)}
                  {i.estado === 'CLOSED' && i.fechaCierre && ` · Cerrada el ${formatearFecha(i.fechaCierre)}`}
                </div>
              </div>

              {i.estado === 'OPEN' && (
                <div className={styles.filaAcciones}>
                  <button
                    className={styles.btnAccionMini}
                    title="Cerrar incidencia"
                    onClick={() => setIncidenciaACerrar(i)}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {incidenciaACerrar && (
        <ModalConfirmacion
          titulo="¿Cerrar esta incidencia?"
          texto="Se marcará como resuelta. El reportante recibirá un aviso del cierre."
          procesando={procesando}
          onCancelar={() => setIncidenciaACerrar(null)}
          onConfirmar={confirmarCerrar}
        />
      )}
    </div>
  );
}

// Auditoria
function PestanaAuditoria() {
  const [auditoria, setAuditoria] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [accion, setAccion] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);

    getAuditoriaSupervision(busqueda, accion)
      .then(setAuditoria)
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, [busqueda, accion]);

  useEffect(() => {
    const temporizador = setTimeout(cargar, 300);
    return () => clearTimeout(temporizador);
  }, [cargar]);

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Traduce el nombre del enum a una etiqueta legible
  const etiquetaAccion = (valor) => {
    const encontrada = ACCIONES_AUDITORIA.find(a => a.valor === valor);
    return encontrada ? encontrada.etiqueta : valor;
  };

  return (
    <div>
      <div className={styles.barraFiltros}>
        <div className={styles.campoBusqueda}>
          <Search size={18} color="#90b4ce" />
          <input
            type="text"
            placeholder="Buscar por supervisor o descripción..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={styles.inputBusqueda}
          />
        </div>
        <select value={accion} onChange={e => setAccion(e.target.value)} className={styles.selectFiltro}>
          <option value="">Todas las acciones</option>
          {ACCIONES_AUDITORIA.map(a => (
            <option key={a.valor} value={a.valor}>{a.etiqueta}</option>
          ))}
        </select>
      </div>

      {error && <p className={styles.mensajeError}>{error}</p>}

      {cargando ? (
        <p className={styles.textoEstado}>Cargando auditoría...</p>
      ) : auditoria.length === 0 ? (
        <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>No se han encontrado acciones con esos filtros.</div>
      ) : (
        <div className={styles.lista}>
          {auditoria.map(a => (
            <div key={a.id} className={`tarjeta-cristal ${styles.filaUsuario}`}>
              <div className={styles.avatarMini}><History size={16} color="#90b4ce" /></div>
              <div className={styles.flex1}>
                <div className={styles.filaTitulo}>
                  {etiquetaAccion(a.accion)}
                  <span className={styles.badgeEstado}>@{a.usuarioSupervisor}</span>
                </div>
                <div className={styles.filaMeta}>
                  {a.detalles} · {formatearFechaHora(a.fecha)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}