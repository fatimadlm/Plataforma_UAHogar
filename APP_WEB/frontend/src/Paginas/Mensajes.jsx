import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { apiFetch } from '../Servicios/apiFetch';
import { Send, MessageSquare, Link2, X, CheckCircle2, Trash2, Edit2, Search, Shield } from 'lucide-react';
import { getApariencia } from '../Configuracion/AparienciasHogar';
import { REACCIONES } from '../Configuracion/ReaccionesConfig';
import { getUsuariosSupervision } from '../Servicios/PeticionSupervisor';
import { API_URL } from '../Configuracion/apiConfig';
import styles from './Mensajes.module.css';

const BASE = API_URL;

export default function Mensajes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useSesion();

  // Listas del panel izquierdo
  const [hogaresChat, setHogaresChat] = useState([]);    // chats de grupo
  const [chatsPrivados, setChatsPrivados] = useState([]); // conversaciones privadas abiertas
  const [sugerencias, setSugerencias] = useState([]);     // compis sin chat abierto

  // Chat activo: { tipo: 'grupo'|'privado', hogarId?, otroUsuarioId?, nombre, aparienciaId? }
  const [chatActivo, setChatActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [texto, setTexto] = useState('');
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const historialRef = useRef(null);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaCompis, setBusquedaCompis] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  // Buscador de SUPERVISOR
  const esSupervisor = usuario?.rolGlobal === 'SUPERVISOR';
  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  const [resultadosGlobal, setResultadosGlobal] = useState([]);

  useEffect(() => {
    if (!usuario?.id) return;

    const cargarInicial = async () => {
      const resH = await apiFetch(`${BASE}/api/hogares/usuario/${usuario.id}`);
      const hogares = resH.ok ? await resH.json() : [];
      setHogaresChat(hogares);

      const resC = await apiFetch(`${BASE}/api/miembros/compis/${usuario.id}`);
      const compis = resC.ok ? await resC.json() : [];

      const conMensajes = [];
      const sinMensajes = [];

      for (const compi of compis) {
        const resM = await apiFetch(`${BASE}/api/mensajes/privado?otroId=${compi.id}`);
        const msgs = resM.ok ? await resM.json() : [];

        if (msgs.length > 0) {
          const ultimo = msgs[msgs.length - 1];
          conMensajes.push({
            ...compi,
            ultimoMensaje: ultimo.contenido,
            ultimaHora: ultimo.fechaEnvio
          });
        } else {
          sinMensajes.push(compi);
        }
      }

      setChatsPrivados(conMensajes);
      setSugerencias(sinMensajes);
    };

    cargarInicial();
  }, [usuario?.id]);

  // Para abrir chats desde su perfil
  useEffect(() => {
    const datos = location.state?.abrirChatCon;
    if (!usuario?.id || !datos?.otroUsuarioId) return;

    const abrirChatInicial = async () => {
      const res = await apiFetch(`${BASE}/api/mensajes/privado?otroId=${datos.otroUsuarioId}`);
      const msgs = res.ok ? await res.json() : [];

      setChatActivo({ tipo: 'privado', ...datos });
      setMostrarPicker(false);
      setBusqueda('');
      setBusquedaCompis('');
      setEditandoId(null);
      setMensajes(msgs);
      setTareasPendientes([]);
    };

    abrirChatInicial();
    navigate(location.pathname, { replace: true, state: {} });
  }, [usuario?.id, location.state, location.pathname, navigate]);

  // Supervisor: chat a cualquier usuario
  useEffect(() => {
    if (!esSupervisor || !busquedaGlobal.trim()) return;

    const temporizador = setTimeout(() => {
      getUsuariosSupervision(busquedaGlobal)
        .then(lista => setResultadosGlobal(lista.filter(u => Number(u.id) !== Number(usuario?.id))))
        .catch(() => setResultadosGlobal([]));
    }, 300);

    return () => clearTimeout(temporizador);
  }, [busquedaGlobal, esSupervisor, usuario?.id]);

  const cargarPanel = async () => {
    // Hogares del usuario
    const resH = await apiFetch(`${BASE}/api/hogares/usuario/${usuario.id}`);
    const hogares = resH.ok ? await resH.json() : [];
    setHogaresChat(hogares);

    // Compis del usuario
    const resC = await apiFetch(`${BASE}/api/miembros/compis/${usuario.id}`);
    const compis = resC.ok ? await resC.json() : [];

    // Buscamos quiénes tienen mensajes privados con nosotros
    const conMensajes = [];
    const sinMensajes = [];

    for (const compi of compis) {
      const resM = await apiFetch(`${BASE}/api/mensajes/privado?otroId=${compi.id}`);
      const msgs = resM.ok ? await resM.json() : [];
      if (msgs.length > 0) {
        const ultimo = msgs[msgs.length - 1];
        conMensajes.push({ ...compi, ultimoMensaje: ultimo.contenido, ultimaHora: ultimo.fechaEnvio });
      } else {
        sinMensajes.push(compi);
      }
    }

    setChatsPrivados(conMensajes);
    setSugerencias(sinMensajes);
  };

  //Abrir un chat
  const abrirChat = async (tipo, datos) => {
    setChatActivo({ tipo, ...datos });
    setMostrarPicker(false);
    setBusqueda('');
    setBusquedaCompis('');
    setEditandoId(null);

    if (tipo === 'grupo') {
      const res = await apiFetch(`${BASE}/api/mensajes/grupo/${datos.hogarId}`);
      const msgs = res.ok ? await res.json() : [];
      setMensajes(msgs);
      // Tareas pendientes del hogar para poder enlazar
      const resT = await apiFetch(`${BASE}/api/tareas/usuario/${usuario.id}`);
      const tareas = resT.ok ? await resT.json() : [];
      setTareasPendientes(tareas.filter(t => t.estado === 'PENDIENTE' && t.hogarId === datos.hogarId));
    } else {
      const res = await apiFetch(`${BASE}/api/mensajes/privado?otroId=${datos.otroUsuarioId}`);
      const msgs = res.ok ? await res.json() : [];
      setMensajes(msgs);
      setTareasPendientes([]);
    }
  };

  // Scroll al final cuando llegan mensajes
  useEffect(() => {
    if (historialRef.current) {
      historialRef.current.scrollTop = historialRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Enviar mensajes
  const enviar = async (contenido) => {
    if (!contenido.trim() || !chatActivo) return;

    let res;
    if (chatActivo.tipo === 'grupo') {
      res = await apiFetch(`${BASE}/api/mensajes/grupo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hogarId: chatActivo.hogarId, contenido })
      });
    } else {
      res = await apiFetch(`${BASE}/api/mensajes/privado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receptorId: chatActivo.otroUsuarioId, contenido })
      });
    }

    if (res.ok) {
      const nuevo = await res.json();
      setMensajes(prev => [...prev, nuevo]);
      // Actualizar panel
      if (chatActivo.tipo === 'privado') cargarPanel();
    }
    setTexto('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviar(texto);
  };

  const enviarEnlaceTarea = (tarea) => {
    const enlace = `[TAREA:${tarea.id}] ${tarea.nombre}`;
    enviar(enlace);
    setMostrarPicker(false);
  };

  //Editar mensajes
  const iniciarEdicion = (msg) => {
    setEditandoId(msg.id);
    setTextoEditado(msg.contenido);
  };

  const guardarEdicion = async (msg) => {
    if (!textoEditado.trim()) return;
    try {
      const res = await apiFetch(`${BASE}/api/mensajes/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoContenido: textoEditado })
      });
      if (res.ok) {
        const actualizado = await res.json();
        setMensajes(prev => prev.map(m => m.id === msg.id ? actualizado : m));
        setEditandoId(null);
      } else {
        const error = await res.text();
        alert(error || 'No se pudo editar el mensaje');
      }
    } catch (error) {
      alert('Error al editar: ' + error.message);
    }
  };

  //Para borrar mensajes
  const borrarMensaje = async (msg) => {
    if (!confirm('¿Estás seguro?')) return;
    try {
      const res = await apiFetch(`${BASE}/api/mensajes/${msg.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMensajes(prev => prev.filter(m => m.id !== msg.id));
      } else {
        const error = await res.text();
        alert(error || 'No se pudo borrar el mensaje');
      }
    } catch (error) {
      alert('Error al borrar');
    }
  };

  // Reacciones
  const reaccionar = async (mensajeId, tipoReaccion) => {
    try {
      const res = await apiFetch(`${BASE}/api/mensajes/${mensajeId}/reacciones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoReaccion })
      });
      if (res.ok) {
        const reacciones = await res.json();
        setMensajes(prev => prev.map(m => m.id === mensajeId ? { ...m, reacciones } : m));
      }
    } catch (error) {
    }
  };

  //Buscador de mensajes
  const mensajesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return mensajes;
    const termino = busqueda.toLowerCase();
    return mensajes.filter(m =>
      (m.contenido?.toLowerCase().includes(termino) || false) ||
      (m.remitente?.toLowerCase().includes(termino) || false)
    );
  }, [mensajes, busqueda]);

  //Buscador de compis
  const terminoCompis = busquedaCompis.trim().toLowerCase();

  const hogaresFiltrados = useMemo(() => {
    if (!terminoCompis) return hogaresChat;
    return hogaresChat.filter(h => h.nombre?.toLowerCase().includes(terminoCompis));
  }, [hogaresChat, terminoCompis]);

  const chatsPrivadosFiltrados = useMemo(() => {
    if (!terminoCompis) return chatsPrivados;
    return chatsPrivados.filter(c => c.nombre?.toLowerCase().includes(terminoCompis));
  }, [chatsPrivados, terminoCompis]);

  const sugerenciasFiltradas = useMemo(() => {
    if (!terminoCompis) return sugerencias;
    return sugerencias.filter(s => s.nombre?.toLowerCase().includes(terminoCompis));
  }, [sugerencias, terminoCompis]);

  const sinResultadosCompis = terminoCompis
    && hogaresFiltrados.length === 0
    && chatsPrivadosFiltrados.length === 0
    && sugerenciasFiltradas.length === 0;

  const renderContenido = (msg) => {
    const match = msg.contenido.match(/^\[TAREA:(\d+)\] (.+)$/);
    if (match) {
      const tareaNombre = match[2];
      return (
        <div>
          <div className={styles.enlaceTarea} onClick={() => navigate('/feed')}>
            <CheckCircle2 size={16} />
            <span>{tareaNombre}</span>
            <Link2 size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
          </div>
        </div>
      );
    }
    return <span>{msg.contenido}</span>;
  };

  const formatHora = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatar = (imagenUrl, nombre) => {
    if (imagenUrl) {
      const src = imagenUrl.startsWith('http') ? imagenUrl : `${BASE}${imagenUrl}`;
      return <img src={src} alt={nombre} onError={(e) => { e.target.style.display = 'none'; }} />;
    }
    return nombre?.charAt(0).toUpperCase() || '?';
  };

  const esMio = (msg) => msg.remitenteId === usuario.id;

  // Reacciones
  const Reacciones = ({ msg }) => {
    const conteos = msg.reacciones?.conteos || {};
    const miReaccion = msg.reacciones?.miReaccion || null;

    return (
      <div className={styles.reaccionesContenedor}>
        {REACCIONES.map(r => {
          const count = conteos[r.id] || 0;
          const esLaMia = miReaccion === r.id;
          return (
            <button
              key={r.id}
              onClick={() => reaccionar(msg.id, r.id)}
              className={`${styles.btnReaccion} ${esLaMia ? styles.reaccionActiva : styles.reaccionInactiva}`}
              title={esLaMia ? 'Quitar mi reacción' : r.etiqueta}
            >
              <r.Componente size={14} color={r.color} />
              {count > 0 && <span className={styles.contadorReaccion}>{count}</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="mensajes" />

      <main className={`main-content ${styles.mainMensajes}`}>
        <header>
          <h1 className={styles.tituloPrincipal}>Mensajes</h1>
        </header>

        <div className={`tarjeta-cristal ${styles.chatContainer}`}>

          {/* panel IZQ*/}
          <div className={styles.panelIzquierdo}>

            {/* BUSCAR COMPIS */}
            <div className={styles.panelBusqueda}>
              <div className={styles.panelBusquedaBox}>
                <Search size={13} className={styles.panelIconoBuscar} strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Buscar compis..."
                  value={busquedaCompis}
                  onChange={(e) => setBusquedaCompis(e.target.value)}
                  className={styles.panelBuscarInput}
                />
                {busquedaCompis && (
                  <button
                    type="button"
                    className={styles.panelBtnLimpiar}
                    onClick={() => setBusquedaCompis('')}
                    title="Limpiar búsqueda"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            {/* BUSCAR CUALQUIER USUARIO  */}
            {esSupervisor && (
              <div className={styles.panelBusqueda}>
                <div className={styles.panelBusquedaBox}>
                  <Shield size={13} className={styles.panelIconoBuscar} strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Buscar cualquier usuario..."
                    value={busquedaGlobal}
                    onChange={(e) => setBusquedaGlobal(e.target.value)}
                    className={styles.panelBuscarInput}
                  />
                  {busquedaGlobal && (
                    <button
                      type="button"
                      className={styles.panelBtnLimpiar}
                      onClick={() => setBusquedaGlobal('')}
                      title="Limpiar búsqueda"
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={styles.panelScroll}>
              {esSupervisor && busquedaGlobal.trim() && (
                <>
                  <div className={styles.panelHeader}>Todos los usuarios</div>
                  {resultadosGlobal.length === 0 ? (
                    <div className={styles.sinResultadosPanel}>
                      Sin resultados para "{busquedaGlobal}"
                    </div>
                  ) : (
                    resultadosGlobal.map(r => (
                      <div
                        key={`sup-${r.id}`}
                        className={styles.sugerenciaItem}
                        onClick={() => abrirChat('privado', { otroUsuarioId: r.id, nombre: r.nombre, imagenPerfil: r.imagenPerfil })}
                        title={`Escribir a ${r.nombre} como supervisor`}
                      >
                        <div className={styles.avatarItem}>
                          {getAvatar(r.imagenPerfil, r.nombre)}
                        </div>
                        <div className={styles.contactoTexto}>
                          <div className={styles.contactoNombre}>{r.nombre}</div>
                          <div className={styles.contactoUltimo}>@{r.usuario}</div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Chats de grupo */}
              {hogaresFiltrados.length > 0 && (
                <>
                  <div className={styles.panelHeader}>Hogares</div>
                  {hogaresFiltrados.map(h => {
                    const ap = getApariencia(h.aparienciaId);
                    const { Icono } = ap;
                    const esActivo = chatActivo?.tipo === 'grupo' && chatActivo?.hogarId === h.id;
                    return (
                      <div
                        key={`g-${h.id}`}
                        className={`${styles.contactoItem} ${esActivo ? styles.activo : ''}`}
                        onClick={() => abrirChat('grupo', { hogarId: h.id, nombre: h.nombre, aparienciaId: h.aparienciaId })}
                      >
                        <div className={styles.avatarItem} style={{ background: ap.gradiente }}>
                          <Icono size={18} color="white" strokeWidth={1.5} />
                        </div>
                        <div className={styles.contactoTexto}>
                          <div className={styles.contactoNombre}>{h.nombre}</div>
                          <div className={styles.contactoUltimo}>{h.miembros} miembros · Grupo</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Chats privados */}
              {chatsPrivadosFiltrados.length > 0 && (
                <>
                  <div className={styles.panelHeader}>Conversaciones</div>
                  {chatsPrivadosFiltrados.map(c => {
                    const esActivo = chatActivo?.tipo === 'privado' && chatActivo?.otroUsuarioId === c.id;
                    return (
                      <div
                        key={`p-${c.id}`}
                        className={`${styles.contactoItem} ${esActivo ? styles.activo : ''}`}
                        onClick={() => abrirChat('privado', { otroUsuarioId: c.id, nombre: c.nombre, imagenPerfil: c.imagenPerfil })}
                      >
                        <div className={styles.avatarItem}>
                          {getAvatar(c.imagenPerfil, c.nombre)}
                        </div>
                        <div className={styles.contactoTexto}>
                          <div className={styles.contactoNombre}>{c.nombre}</div>
                          <div className={styles.contactoUltimo}>{c.ultimoMensaje}</div>
                        </div>
                        <div className={styles.contactoHora}>{formatHora(c.ultimaHora)}</div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Sugerencias */}
              {sugerenciasFiltradas.length > 0 && (
                <>
                  <div className={styles.panelHeader}>Tus compis</div>
                  {sugerenciasFiltradas.map(s => (
                    <div
                      key={`s-${s.id}`}
                      className={styles.sugerenciaItem}
                      onClick={() => abrirChat('privado', { otroUsuarioId: s.id, nombre: s.nombre, imagenPerfil: s.imagenPerfil })}
                    >
                      <div className={styles.avatarItem}>
                        {getAvatar(s.imagenPerfil, s.nombre)}
                      </div>
                      <div className={styles.contactoTexto}>
                        <div className={styles.contactoNombre}>{s.nombre}</div>
                        <div className={styles.contactoUltimo}>Iniciar conversación</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Sin resultados */}
              {sinResultadosCompis && (
                <div className={styles.sinResultadosPanel}>
                  No hay compis que coincidan con "{busquedaCompis}"
                </div>
              )}
            </div>
          </div>

          {/*ventana del chat */}
          {!chatActivo ? (
            <div className={styles.sinChat}>
              <MessageSquare size={52} strokeWidth={1.2} />
              <p>Selecciona un chat para empezar</p>
            </div>
          ) : (
            <div className={styles.ventanaChat}>

              {/* Cabecera */}
              <div className={styles.headerChat}>
                {chatActivo.tipo === 'grupo' ? (() => {
                  const ap = getApariencia(chatActivo.aparienciaId);
                  const { Icono } = ap;
                  return (
                    <div
                      className={styles.headerAvatar}
                      style={{ background: ap.gradiente }}
                      onClick={() => navigate('/panelhogar', { state: { hogarActivo: hogaresChat.find(h => h.id === chatActivo.hogarId) } })}
                      title="Ir al panel del hogar"
                    >
                      <Icono size={18} color="white" strokeWidth={1.5} />
                    </div>
                  );
                })() : (
                  <div
                    className={styles.headerAvatar}
                    onClick={() => navigate(`/perfil-ajeno/${chatActivo.otroUsuarioId}`)}
                    title="Ver perfil"
                  >
                    {getAvatar(chatActivo.imagenPerfil, chatActivo.nombre)}
                  </div>
                )}
                <div>
                  <div
                    className={styles.contactoNombre}
                    onClick={() => chatActivo.tipo === 'privado' && navigate(`/perfil-ajeno/${chatActivo.otroUsuarioId}`)}
                  >
                    {chatActivo.nombre}
                  </div>
                  <div className={styles.contactoUltimo}>
                    {chatActivo.tipo === 'grupo' ? 'Chat de grupo · clic para ir al panel' : 'Mensaje privado · clic para ver perfil'}
                  </div>
                </div>
              </div>

              {chatActivo && (
                <div className={styles.buscarWrap}>
                  <div className={styles.buscarBox}>
                    <Search size={15} className={styles.iconoBuscar} strokeWidth={2} />
                    <input
                      type="text"
                      placeholder="Buscar en este chat..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className={styles.buscarInput}
                    />
                    {busqueda && (
                      <button
                        type="button"
                        className={styles.btnLimpiarBusqueda}
                        onClick={() => setBusqueda('')}
                        title="Limpiar búsqueda"
                      >
                        <X size={13} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* HISTORIAL DE MENSAJES */}
              <div className={styles.historialMensajes} ref={historialRef}>
                {mensajesFiltrados.length === 0 && (
                  <div className={styles.sinResultadosPanel}>
                    {busqueda.trim() ? 'No hay mensajes que coincidan' : 'Aún no hay mensajes. ¡Sé el primero en escribir!'}
                  </div>
                )}
                {mensajesFiltrados.map(msg => (
                  <div key={msg.id} className={`${styles.burbujaWrap} ${esMio(msg) ? styles.burbujaWrapMia : styles.burbujaWrapOtro}`}>
                    {!esMio(msg) && chatActivo.tipo === 'grupo' && (
                      <div className={styles.burbujaRemitente}>{msg.remitente}</div>
                    )}
                    <div className={`${styles.burbuja} ${esMio(msg) ? styles.burbujaMia : styles.burbujaOtro}`}>
                      {editandoId === msg.id ? (
                        <div className={styles.contenedorEdicion}>
                          <input
                            type="text"
                            value={textoEditado}
                            onChange={(e) => setTextoEditado(e.target.value)}
                            autoFocus
                            className={styles.inputEdicion}
                          />
                          <button onClick={() => guardarEdicion(msg)} className={styles.btnGuardarEdicion}>
                            Guardar
                          </button>
                          <button onClick={() => setEditandoId(null)} className={styles.btnCancelarEdicion}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div>
                          {renderContenido(msg)}
                          {msg.esEditado && (
                            <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '4px', fontStyle: 'italic' }}>
                              (editado)
                            </span>
                          )}
                          {esMio(msg) && (
                            <div className={styles.accionesBurbuja}>
                              <button onClick={() => iniciarEdicion(msg)} className={styles.btnAccionMsg} title="Editar">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => borrarMensaje(msg)} className={`${styles.btnAccionMsg} ${styles.btnBorrarMsg}`} title="Borrar">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={styles.horaMsj}>{formatHora(msg.fechaEnvio)}</div>

                    {/* REACCIONES  */}
                    <Reacciones msg={msg} />
                  </div>
                ))}
              </div>

              {/* Input */}
              <form className={styles.inputArea} onSubmit={handleSubmit}>
                {chatActivo.tipo === 'grupo' && (
                  <button
                    type="button"
                    className={`${styles.btnTarea} ${tareasPendientes.length > 0 ? styles.btnTareaActivo : ''}`}
                    onClick={() => tareasPendientes.length > 0 && setMostrarPicker(p => !p)}
                    disabled={tareasPendientes.length === 0}
                    title={tareasPendientes.length > 0 ? 'Enlazar tarea pendiente' : 'No tienes tareas pendientes en este hogar'}
                  >
                    <Link2 size={16} />
                    <span>Tareas</span>
                    {tareasPendientes.length > 0 && (
                      <span className={styles.btnTareaBadge}>{tareasPendientes.length}</span>
                    )}
                  </button>
                )}
                <input
                  type="text"
                  className={styles.inputChat}
                  placeholder={`Escribe a ${chatActivo.nombre}...`}
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={styles.btnEnviar} disabled={!texto.trim()}>
                  <Send size={18} strokeWidth={2.5} />
                </button>
              </form>
            </div>
          )}

          {/* Picker de tareas */}
          {mostrarPicker && (
            <div className={styles.pickerTareas}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: '700', color: '#3d5a80', fontSize: '0.85rem' }}>Enlazar tarea pendiente</span>
                <button onClick={() => setMostrarPicker(false)} className={styles.btnAccionMsg}>
                  <X size={16} />
                </button>
              </div>
              {tareasPendientes.map(t => (
                <div key={t.id} className={styles.pickerTituloItem} onClick={() => enviarEnlaceTarea(t)}>
                  <CheckCircle2 size={16} color="#90b4ce" />
                  <span>{t.nombre}</span>
                  <span style={{ marginLeft: 'auto', color: '#90b4ce', fontSize: '0.78rem' }}>{t.puntos} pts</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}