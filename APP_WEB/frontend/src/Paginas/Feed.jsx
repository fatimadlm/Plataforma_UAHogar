import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { Home, Camera, FileText, User, Tag, RefreshCw, Clock, AlertTriangle, CheckCircle2, Lightbulb, ArrowLeftRight } from 'lucide-react';
import styles from './Feed.module.css';
import {getTareasPorUsuario, getHistorialHogar, completarTarea, subirImagenTarea, getHogaresPorUsuario, consultarTarea} from '../Servicios/PeticionTarea';
import { colorTipo } from '../Configuracion/TareaConfig';
import { API_URL, manejarErrorImagen } from '../Configuracion/apiConfig';
import ModalAyudaTarea from '../Componentes/Modulos/ModalAyudaTarea';
import ModalIntercambioTarea from '../Componentes/Modulos/ModalIntercambioTarea';

export default function Feed() {

  const { usuario } = useSesion();
  const [pendientes, setPendientes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [hayMas, setHayMas] = useState(true);
  const [cargando, setCargando] = useState(() => Boolean(usuario));
  const [cargandoMas, setCargandoMas] = useState(false);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState({});
  const [imagenesPrevias, setImagenesPrevias] = useState({});
  const [hogares, setHogares] = useState([]);
  const [tareaConsultada, setTareaConsultada] = useState(null);
  const [ayudaTarea, setAyudaTarea] = useState(null);
  const [cargandoAyuda, setCargandoAyuda] = useState(false);
  const [errorAyuda, setErrorAyuda] = useState('');
  const [tareaAIntercambiar, setTareaAIntercambiar] = useState(null);
  const inputsRef = useRef({});
  const navigate = useNavigate();

  // Carga las instancias pendientes del usuario
  const cargarPendientes = async () => {
    if (!usuario) return;
    try {
      const datos = await getTareasPorUsuario(usuario.id);
      setPendientes(datos);
    } catch (error) {
      console.error('Error al cargar tareas pendientes:', error);
      setPendientes([]);
    }
  };

  // Carga el historial de los hogares del usuario pagina a pagina
  const cargarHistorial = async (paginaActual = 0, acumular = false) => {
    if (!usuario) return;
    try {
      const hogaresUsuario = await getHogaresPorUsuario(usuario.id);
      setHogares(hogaresUsuario);
      const promesas = hogaresUsuario.map(h => getHistorialHogar(h.id, paginaActual, 14));
      const resultados = await Promise.all(promesas);
      const todos = resultados.flat()
        .sort((a, b) => new Date(b.fechaCompletada) - new Date(a.fechaCompletada));

      if (acumular) {
        setHistorial(prev => [...prev, ...todos]);
      } else {
        setHistorial(todos);
      }

      // Si alguno devolvio menos de 14 no hay mas paginas
      setHayMas(resultados.some(r => r.length === 14));
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  // Carga inicial
  useEffect(() => {
    if (!usuario?.id) return;
    let activo = true;
    const cargarInicial = async () => {
      try {
        const datosPendientes = await getTareasPorUsuario(usuario.id);
        if (activo) setPendientes(datosPendientes);
      } catch (error) {
        if (activo) {
          console.error('Error al cargar tareas pendientes:', error);
          setPendientes([]);
        }
      }
      try {
        const hogaresUsuario = await getHogaresPorUsuario(usuario.id);
        if (!activo) return;
        setHogares(hogaresUsuario);
        const promesas = hogaresUsuario.map(h => getHistorialHogar(h.id, 0, 14));
        const resultados = await Promise.all(promesas);
        if (!activo) return;
        const todos = resultados.flat()
          .sort((a, b) => new Date(b.fechaCompletada) - new Date(a.fechaCompletada));
        setHistorial(todos);
        setHayMas(resultados.some(r => r.length === 14));
      } catch (error) {
        if (activo) console.error('Error al cargar historial:', error);
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargarInicial();
    return () => {activo = false;}; }, [usuario?.id]
  );

  // Guardamos el archivo y mostramos una previsualizacion local
  const manejarSeleccionImagen = (instanciaId, archivo) => {
    if (!archivo) return;
    setArchivosSeleccionados(prev => ({ ...prev, [instanciaId]: archivo }));
    setImagenesPrevias(prev => ({ ...prev, [instanciaId]: URL.createObjectURL(archivo) }));
  };

  // Completa la tarea subiendo la imagen si la hay
  const manejarCompletarTarea = async (instancia) => {
    try {
      let imagenUrl = null;
      if (archivosSeleccionados[instancia.id]) {
        imagenUrl = await subirImagenTarea(archivosSeleccionados[instancia.id]);
      }
      const resultado = await completarTarea(instancia.tareaId, imagenUrl);

      if (instancia.completableConMargen) {
        alert(`Tarea completada a tiempo (casi). +${resultado.puntosNetos} pts (70% de los puntos originales)`);
      } else {
        alert(`Tarea completada. +${resultado.puntosNetos} pts`);
      }

      // Recargamos pendientes e historial
      await cargarPendientes();
      setPagina(0);
      await cargarHistorial(0, false);
    } catch (error) {
      alert(`No se pudo completar la tarea: ${error.message}`);
    }
  };

  // Consulta la ayuda de la tarea
  const manejarConsultarTarea = async (tarea, regenerar = false) => {
    setTareaConsultada(tarea);
    setErrorAyuda('');
    setCargandoAyuda(true);
    try {
      const resultado = await consultarTarea(tarea.tareaId, regenerar);
      setAyudaTarea(resultado);
    } catch (error) {
      setErrorAyuda(error.message || 'No se pudo generar la ayuda');
    } finally {
      setCargandoAyuda(false);
    }
  };

  // Cierra la ventana de ayuda
  const cerrarAyudaTarea = () => {
    setTareaConsultada(null);
    setAyudaTarea(null);
    setErrorAyuda('');
    setCargandoAyuda(false);
  };

  // Se llama al confirmar la solicitud de intercambio
  const manejarIntercambioSolicitado = () => {
    setTareaAIntercambiar(null);//Cerramos modar
    alert('Solicitud de intercambio enviada. Cuando la otra persona responda, te llegará una notificación.');
  };//Avisamos

  // Carga mas historial al pulsar el boton
  const cargarMas = async () => {
    setCargandoMas(true);
    const nuevaPagina = pagina + 1;
    setPagina(nuevaPagina);
    await cargarHistorial(nuevaPagina, true);
    setCargandoMas(false);
  };

  const irAlHogar = (hogarId, nombreHogar) => {
    
    const hogarCompleto = hogares.find(h => h.id === hogarId);
    navigate('/panelhogar', { state: { hogarActivo: hogarCompleto || { id: hogarId, nombre: nombreHogar } } });
  };

  // Separamos por bloques segun el estado
  const aTiempoCasi  = pendientes.filter(t => t.completableConMargen);
  const urgentes     = pendientes.filter(t => t.esUrgente && !t.completableConMargen);
  const porRealizar  = pendientes.filter(t => !t.esUrgente && !t.completableConMargen);

  // Tarjeta reutilizable para tareas pendientes
  const TarjetaPendiente = ({ t }) => (
    <div
      className={`tarjeta-cristal ${styles.tarjetaTarea} ${t.completableConMargen ? styles.tarjetaGracia : t.esUrgente ? styles.tarjetaUrgente : styles.tarjetaNormal}`}
    >
      <div
        className={`${styles.tarjetaHeader} ${styles.elementoInteractivo}`}
        onClick={() => irAlHogar(t.hogarId, t.nombreHogar)}
      >
        <span className={`${styles.tarjetaHogar} ${styles.filaIcono}`}>
          <Home size={16} /> {t.nombreHogar}
        </span>

        {t.completableConMargen && (
          <span className={`${styles.estadoTarea} ${styles.estadoGracia}`}>
            <AlertTriangle size={13} /> A tiempo (casi) — complétala antes de que venza definitivamente
          </span>
        )}
        {t.esUrgente && !t.completableConMargen && (
          <span className={`${styles.estadoTarea} ${styles.estadoUrgente}`}>
            <AlertTriangle size={13} />
            {t.diasRestantes <= 0 ? 'Vence hoy' : `Vence en ${t.diasRestantes} día${t.diasRestantes !== 1 ? 's' : ''}`}
          </span>
        )}
        {!t.esUrgente && !t.completableConMargen && t.fechaLimite && (
          <span className={styles.infoFecha}>
            Hasta el {new Date(t.fechaLimite).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      <div className={styles.tarjetaCuerpo}>
        <div
          className={`${styles.tarjetaImagen} ${styles.elementoInteractivo}`}
          onClick={() => inputsRef.current[t.id]?.click()}
          title="Haz clic para añadir una imagen"
        >
          <input
            type="file" accept="image/*" className={styles.inputOculto}
            ref={el => inputsRef.current[t.id] = el}
            onChange={e => manejarSeleccionImagen(t.id, e.target.files[0])}
          />
          {imagenesPrevias[t.id] ? (
            <img src={imagenesPrevias[t.id]} alt="Imagen de la tarea" className={styles.imagenTarea} />
          ) : (
            <Camera size={36} className={styles.iconoHistorial} strokeWidth={1.5} />
          )}
        </div>

        <div className={styles.tarjetaInfo}>
          <h3 className={styles.tarjetaTitulo}>{t.nombre}</h3>
          {t.descripcion && (
            <span className={`${styles.infoTarea} ${styles.infoDescripcion}`}>
              <FileText size={14} className={styles.iconoHistorial} /> {t.descripcion}
            </span>
          )}
          {t.nombreUsuarioAsignado && (
            <span className={styles.infoTarea}>
              <User size={14} className={styles.iconoHistorial} /> {t.nombreUsuarioAsignado}
            </span>
          )}
          {t.tipo && (
            <span className={styles.infoTarea}>
              <Tag size={14} color={colorTipo(t.tipo)} /> {t.tipo}
            </span>
          )}
          {t.frecuencia && (
            <span className={styles.infoTarea}>
              <RefreshCw size={14} className={styles.iconoHistorial} /> {t.frecuencia}
            </span>
          )}
          {t.tiempoEstimado && (
            <span className={styles.infoTarea}>
              <Clock size={14} className={styles.iconoHistorial} /> {t.tiempoEstimado} min
            </span>
          )}
          <p className={styles.tarjetaPuntos}>
            Recompensa: <span className={styles.puntosDestacados}>
              {t.completableConMargen ? `${t.puntosConMargen} pts (70%)` : `${t.puntos} pts`}
            </span>
          </p>
        </div>

        <div className={styles.tarjetaAcciones}>
          <button
            className={`boton-primario ${styles.botonCompletar} ${t.completableConMargen ? styles.botonCompletarGracia : ''}`}
            onClick={() => manejarCompletarTarea(t)}
          >
            {t.completableConMargen ? `Completar (${t.puntosConMargen} pts)` : 'Completar'}
          </button>
          <button className={styles.botonSecundario} onClick={() => manejarConsultarTarea(t)}>
            <Lightbulb size={16} />
            Consultar
          </button>
          {!t.completableConMargen && (
            <button
              className={styles.botonSecundario}
              onClick={() => setTareaAIntercambiar(t)}
              title="Proponerle esta tarea a otro miembro del hogar"
            >
              <ArrowLeftRight size={16} />
              Intercambiar
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="feed" />
      <main className="main-content">

        <header className={styles.headerFeed}>
          <h1 className={styles.tituloFeed}>
            Hola de nuevo {usuario?.nombre}
          </h1>
          <p className={styles.descripcionFeed}>Aquí tienes tus tareas pendientes y el historial reciente.</p>
        </header>

        {cargando ? (
          <p className={styles.cargandoFeed}>Cargando tus tareas...</p>
        ) : (
          <div className={styles.listaTareas}>

            {/* Bloque A tiempo (casi) — vencidas dentro del margen de 1 dia */}
            {aTiempoCasi.length > 0 && (
              <>
                <div className={`${styles.bloqueEstado} ${styles.bloqueGracia}`}>
                  <AlertTriangle size={16} className={styles.iconoGracia} />
                  <span>A tiempo (casi)</span>
                </div>
                {aTiempoCasi.map(t => <TarjetaPendiente key={t.id} t={t} />)}
              </>
            )}

            {/* Bloque urgente — vence en 2 dias o menos */}
            {urgentes.length > 0 && (
              <>
                <div className={styles.bloqueEstado}>
                  <AlertTriangle size={16} className={styles.iconoUrgente} />
                  <span className={styles.textoUrgente}>Urgente</span>
                </div>
                {urgentes.map(t => <TarjetaPendiente key={t.id} t={t} />)}
              </>
            )}

            {/* Bloque por realizar */}
            {porRealizar.length > 0 && (
              <>
                <div className={styles.bloqueEstado}>
                  <Clock size={16} className={styles.iconoFeed} />
                  <span>Por realizar</span>
                </div>
                {porRealizar.map(t => <TarjetaPendiente key={t.id} t={t} />)}
              </>
            )}

            {/* Sin tareas pendientes */}
            {pendientes.length === 0 && (
              <div className={styles.sinTareas}>
                No tienes ninguna tarea asignada en este momento
              </div>
            )}

            {/* Separador historial */}
            {historial.length > 0 && (
              <>
                <div className={styles.separadorHistorial} />
                <div className={styles.bloqueActividad}>
                  <CheckCircle2 size={16} className={styles.iconoHistorial} />
                  <span>Actividad reciente</span>
                </div>

                {historial.map(h => (
                  <div key={h.id} className={`tarjeta-cristal ${styles.tarjetaTarea} ${styles.tarjetaHistorial}`}>
                    <div className={styles.tarjetaHeader}>
                      <span className={`${styles.tarjetaHogar} ${styles.filaIcono}`}>
                        <Home size={16} /> {h.nombreHogar}
                      </span>
                      <span className={styles.infoFecha}>
                        {new Date(h.fechaCompletada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className={styles.tarjetaCuerpo}>
                      <div className={styles.tarjetaImagen}>
                        {h.imagenUrl ? (
                          <img
                            src={`${API_URL}${h.imagenUrl}`}
                            alt="Imagen de la tarea"
                            className={`${styles.imagenTarea} ${styles.imagenHistorial}`}
                            onError={manejarErrorImagen}
                          />
                        ) : (
                          <CheckCircle2 size={32} className={styles.iconoHistorial} strokeWidth={1.5} />
                        )}
                      </div>
                      <div className={styles.tarjetaInfo}>
                        <h3 className={`${styles.tarjetaTitulo} ${styles.tituloCompletado}`}>
                          {h.nombre}
                        </h3>
                        <span className={styles.infoTarea}>
                          <User size={13} className={styles.iconoHistorial} /> {h.nombreUsuario}
                        </span>
                        <p className={`${styles.tarjetaPuntos} ${styles.puntosHistorial}`}>
                          <span className={styles.puntosDestacados}>+{h.puntosSumados} pts</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Boton cargar mas */}
                {hayMas && (
                  <button
                    onClick={cargarMas}
                    disabled={cargandoMas}
                    className={styles.botonHistorial}
                  >
                    {cargandoMas ? 'Cargando...' : 'Ver actividad anterior'}
                  </button>
                )}
              </>
            )}

          </div>
        )}
      </main>

      {tareaConsultada && (
        <ModalAyudaTarea
          tarea={tareaConsultada}
          ayuda={ayudaTarea}
          cargando={cargandoAyuda}
          error={errorAyuda}
          onCerrar={cerrarAyudaTarea}
          onRegenerar={() => manejarConsultarTarea(tareaConsultada, true)}
        />
      )}

      {tareaAIntercambiar && (
        <ModalIntercambioTarea
          tarea={tareaAIntercambiar}
          usuario={usuario}
          onCerrar={() => setTareaAIntercambiar(null)}
          onSolicitado={manejarIntercambioSolicitado}
        />
      )}
    </div>
  );
}