import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, AlertTriangle, User, RefreshCw, X, ChevronDown, ChevronUp, Sparkles, Clock, Star } from 'lucide-react';
import styles from './TareasHogar.module.css';
import { getInstanciasActivasHogar, getPlantillasHogar, crearTarea, eliminarPlantilla, estimarTiempoTarea } from '../Servicios/PeticionTarea';
import { TIPOS, FRECUENCIAS, colorTipo } from '../Configuracion/TareaConfig';

export default function TareasHogar({ hogar, miembros }) {

  const [instancias, setInstancias] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [cargando, setCargando]  = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [estimando, setEstimando] = useState(false);
  const [confianza, setConfianza] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'LIMPIEZA',
    frecuencia: 'SEMANAL',
    tiempoEstimado: '',
    puntos: '',
    fechaInicio: '',
    usuarioAsignadoId: ''
  });

  // Cargamos las instancias activas y las plantillas del hogar
  const cargarDatos = async () => {
    if (!hogar?.id) return;
    try {
      const [instDatos, plantDatos] = await Promise.all([
        getInstanciasActivasHogar(hogar.id),
        getPlantillasHogar(hogar.id)
      ]);
      setInstancias(instDatos);
      setPlantillas(plantDatos);
    } catch (e) {
      console.error('Error al cargar tareas del hogar:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!hogar?.id) return;
    let activo = true;
    const cargarInicial = async () => {
            try { const [instDatos, plantDatos] = await Promise.all([
                getInstanciasActivasHogar(hogar.id),
                getPlantillasHogar(hogar.id)]);
              if (activo) {
                setInstancias(instDatos);
                setPlantillas(plantDatos);
              }
            } catch (e) {
              if (activo) console.error('Error al cargar tareas del hogar:', e);
            } finally {
              if (activo) setCargando(false);
            }
          };
    cargarInicial();return () => {activo = false; };}, [hogar?.id]
  );

  const handleForm = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrorForm('');

    if (['nombre', 'descripcion', 'tipo'].includes(campo)) {
      setConfianza(null);
      setForm(prev => ({ ...prev, [campo]: valor, tiempoEstimado: '', puntos: '' }));
    }
  };

  const manejarEstimarTiempo = async () => {
    if (!form.nombre.trim()) {
      setErrorForm('Escribe primero el nombre de la tarea');
      return;
    }
    setEstimando(true);
    setErrorForm('');

    try {
      const resultado = await estimarTiempoTarea(form.nombre.trim(), form.descripcion.trim(), form.tipo);
      setForm(prev => ({
        ...prev,
        tiempoEstimado: String(resultado.estimatedMinutes),
        puntos: String(resultado.points ?? Math.round(resultado.estimatedMinutes / 5))
      }));
      setConfianza(resultado.confidence);
    } catch (e) {
      setErrorForm(e.message || 'No se pudo estimar el tiempo');
    } finally {
      setEstimando(false);
    }
  };

  const manejarCrearTarea = async () => {
    if (!form.nombre.trim()) return setErrorForm('El nombre es obligatorio');
    if (!form.tiempoEstimado || Number(form.tiempoEstimado) <= 0) return setErrorForm('Estima primero el tiempo de la tarea');
    if (!form.fechaInicio) return setErrorForm('La fecha de inicio es obligatoria');

    setGuardando(true);
    setErrorForm('');

    try {
      await crearTarea(hogar.id, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        frecuencia: form.frecuencia,
        puntos: form.puntos ? Number(form.puntos) : null,
        tiempoEstimado: form.tiempoEstimado || null,
        fechaInicio: form.fechaInicio || null,
        usuarioAsignadoId: form.usuarioAsignadoId || null
      });

      setForm({
        nombre: '',
        descripcion: '',
        tipo: 'LIMPIEZA',
        frecuencia: 'SEMANAL',
        puntos: '',
        tiempoEstimado: '',
        fechaInicio: '',
        usuarioAsignadoId: ''
      });
      setConfianza(null);
      setMostrarFormulario(false);
      await cargarDatos();
    } catch (e) {
      setErrorForm(e.message || 'Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  // Eliminamos la plantilla con la opcion elegida por el usuario
  const manejarEliminarPlantilla = async (opcion) => {
    if (!modalEliminar) return;
    try {
      await eliminarPlantilla(modalEliminar.id, opcion);
      setModalEliminar(null);
      await cargarDatos();
    } catch (e) {
      console.error('Error al eliminar la plantilla:', e);
    }
  };

  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setErrorForm('');
    setConfianza(null);
  };

  // Fecha y hora exactas de vencimiento
  const formatearFecha = (fecha) => fecha
    ? new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) +
      ', ' + new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : '';
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.contenedor}>
      {/* Bloque 1 — Tareas activas */}
      <div className={`tarjeta-cristal ${styles.bloque}`}>
        <div className={styles.tituloSeccion}>
          <span className={styles.tituloSeccionTexto}><ClipboardList size={20} /> Tareas activas</span>
          <span className={styles.subtitulo}>Próximos 15 días</span>
        </div>

        {cargando ? (
          <p className={styles.vacio}>Cargando...</p>
        ) : instancias.length === 0 ? (
          <p className={styles.vacio}>No hay tareas pendientes en los próximos 15 días</p>
        ) : (
          <div className={styles.lista}>
            {instancias.map(inst => (
              <div
                key={inst.id}
                className={`${styles.fila} ${inst.esUrgente ? styles.filaUrgente : ''}`}
                style={{ borderLeftColor: inst.esUrgente ? '#f4a261' : colorTipo(inst.tipo) }}
              >
                <span className={styles.badge} style={{ background: colorTipo(inst.tipo) }}>{inst.tipo}</span>
                <span className={styles.nombreFila}>{inst.nombre}</span>

                {inst.nombreUsuarioAsignado && (
                  <span className={styles.meta}><User size={12} />{inst.nombreUsuarioAsignado}</span>
                )}

                {inst.fechaLimite && (
                  <span
                    className={`${styles.meta} ${inst.esUrgente ? styles.metaUrgente : ''}`}
                    title="Fecha límite de entrega (vencimiento)"
                  >
                    {inst.esUrgente && <AlertTriangle size={12} />}
                    {formatearFecha(inst.fechaLimite)}
                    {inst.esUrgente && (
                      <span className={styles.tiempoRestante}>
                        ({inst.horasRestantes <= 0
                          ? 'ya'
                          : inst.horasRestantes < 24
                            ? `${inst.horasRestantes}h`
                            : `${inst.diasRestantes}d`})
                      </span>
                    )}
                  </span>
                )}

                <span className={`${styles.badgeEstado} ${inst.estado === 'VENCIDA' ? styles.badgeEstadoVencida : ''}`}>
                  {inst.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bloque 2 — Nueva tarea */}
      <div className={`tarjeta-cristal ${styles.bloque}`}>
        <button className={styles.btnExpandir} onClick={() => setMostrarFormulario(prev => !prev)}>
          <span className={styles.tituloSeccionTexto}><Plus size={20} /> Nueva tarea</span>
          {mostrarFormulario ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {mostrarFormulario && (
          <div className={styles.formulario}>
            <div className={styles.campo}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                value={form.nombre}
                onChange={e => handleForm('nombre', e.target.value)}
                placeholder="Ej: Limpiar el baño"
              />
            </div>

            <div className={styles.campo}>
                  <label className={styles.label}>
                    Descripción <span className={styles.labelOpcional}>(opcional)</span>
                      <span className={styles.labelNota}>
                        Cuanto más detalles des, más precisa será la estimación de la IA
                      </span>
                  </label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  value={form.descripcion}
                  onChange={e => handleForm('descripcion', e.target.value)}
                  placeholder="Ej: Limpiar el lavabo, desinfectar el inodoro y fregar el suelo."
                  rows={3}
                />
          </div>

            <div className={styles.gridDos}>
              <div className={styles.campo}>
                <label className={styles.label}>Tipo</label>
                <select className={styles.input} value={form.tipo} onChange={e => handleForm('tipo', e.target.value)}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Frecuencia</label>
                <select className={styles.input} value={form.frecuencia} onChange={e => handleForm('frecuencia', e.target.value)}>
                  {FRECUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* Estimación IA */}
            <div className={styles.campo}>
              <label className={styles.label}>Tiempo estimado y puntos</label>
              <div className={styles.estimacionFila}>
                <div className={styles.tiempoInputWrapper}>
                  <Clock size={17} className={styles.tiempoIcono} />
                  <input
                    className={`${styles.input} ${styles.tiempoInput}`}
                    type="number"
                    min="5"
                    max="240"
                    value={form.tiempoEstimado}
                    onChange={e => handleForm('tiempoEstimado', e.target.value)}
                    placeholder="Minutos"
                  />
                </div>
                <button type="button" className={styles.btnEstimar} onClick={manejarEstimarTiempo} disabled={estimando}>
                  <Sparkles size={16} />
                  {estimando ? 'Calculando...' : 'Estimar con IA'}
                </button>
              </div>

              {form.tiempoEstimado && (
                <div className={styles.resultadoIA}>
                  <div className={styles.resultadoPrincipal}>
                    <div className={styles.resultadoDato}>
                      <Clock size={17} /> <strong>{form.tiempoEstimado} min</strong>
                    </div>
                    <div className={styles.resultadoSeparador} />
                    <div className={styles.resultadoDato}>
                      <Star size={17} /> <strong>{form.puntos} puntos</strong>
                    </div>
                  </div>
                  {confianza !== null && (
                    <div className={styles.confianza}>
                      <span>Confianza de la IA</span>
                      <strong>{Math.round(confianza * 100)}%</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>
                Fecha de inicio <span className={styles.labelNota}>obligatoria y no puede ser anterior a hoy</span>
              </label>
              <input
                className={styles.input}
                type="date"
                value={form.fechaInicio}
                min={hoy}
                onChange={e => handleForm('fechaInicio', e.target.value)}
              />
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>
                Asignar a <span className={styles.labelNota}>si no se asigna el motor de equidad lo hará automáticamente</span>
              </label>
              <select className={styles.input} value={form.usuarioAsignadoId} onChange={e => handleForm('usuarioAsignadoId', e.target.value)}>
                <option value="">Motor de equidad</option>
                {miembros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>

            {errorForm && <p className={styles.error}>{errorForm}</p>}

            <div className={styles.accionesFormulario}>
              <button className={`boton-primario ${styles.btnCrear}`} onClick={manejarCrearTarea} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Crear tarea'}
              </button>
              <button className={styles.btnCancelar} onClick={cancelarFormulario} disabled={guardando}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bloque 3 — Plantillas */}
      <div className={`tarjeta-cristal ${styles.bloque}`}>
        <button className={styles.btnExpandir} onClick={() => setMostrarPlantillas(prev => !prev)}>
          <span className={styles.tituloSeccionTexto}>
            <RefreshCw size={20} /> Plantillas del hogar <span className={styles.subtitulo}>({plantillas.length})</span>
          </span>
          {mostrarPlantillas ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {mostrarPlantillas && (
          <div className={styles.lista}>
            {plantillas.length === 0 ? (
              <p className={styles.vacio}>No hay plantillas creadas aún</p>
            ) : (
              plantillas.map(p => (
                <div key={p.id} className={styles.fila} style={{ borderLeftColor: colorTipo(p.tipo) }}>
                  <span className={styles.badge} style={{ background: colorTipo(p.tipo) }}>{p.tipo}</span>
                  <span className={styles.nombreFila}>{p.nombre}</span>
                  <span className={styles.meta}><RefreshCw size={11} />{p.frecuencia}</span>
                  <span className={styles.puntos}>{p.puntos} pts</span>
                  <button className={styles.btnEliminar} onClick={() => setModalEliminar(p)} title="Eliminar plantilla">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal eliminar plantilla */}
      {modalEliminar && (
        <div className="modal-overlay" onClick={() => setModalEliminar(null)}>
          <div className={`tarjeta-cristal modal-contenido ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar-modal" onClick={() => setModalEliminar(null)}>
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 className={styles.modalTitulo}>Eliminar plantilla</h2>
            <p className={styles.modalTexto}>
              Vas a eliminar <strong>{modalEliminar.nombre}</strong>. ¿Cómo quieres hacerlo?
            </p>
            <div className={styles.modalOpciones}>
              <button className={styles.btnModalPrimario} onClick={() => manejarEliminarPlantilla('AHORA')}>
                Eliminar ahora
                <span className={styles.btnModalNota}>Cancela también la instancia pendiente activa</span>
              </button>
              <button className={styles.btnModalSecundario} onClick={() => manejarEliminarPlantilla('AL_COMPLETARSE')}>
                Eliminar al completarse
                <span className={styles.btnModalNotaSecundaria}>Deja que el ciclo actual termine y no vuelve a regenerarse</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}