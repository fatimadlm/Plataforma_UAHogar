import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../Seguridad/ContextoSesion';
import Sidebar from '../Componentes/Sidebar';
import { ArrowLeft, Clock, CheckCircle2, ChevronDown, Image, AlertTriangle, X } from 'lucide-react';
import { getApariencia } from '../Configuracion/AparienciasHogar';
import { getHistorialHogar, reportarIncidencia } from '../Servicios/PeticionTarea';
import { API_URL, manejarErrorImagen } from '../Configuracion/apiConfig';
import styles from './FeedHogar.module.css';

const LIMITE = 40;
const BASE_SERVIDOR = API_URL;

export default function FeedHogar() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { usuario: usuarioLogueado } = useSesion();

  const hogar = state?.hogar;
  const apariencia = getApariencia(hogar?.aparienciaId);
  const { Icono } = apariencia;

  const [registros, setRegistros] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  // Guardamos el id del registro cuya imagen está ampliada
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  // Registro sobre el que se está reportando una incidencia
  const [incidenciaDe, setIncidenciaDe] = useState(null);
  const [descripcionIncidencia, setDescripcionIncidencia] = useState('');
  const [enviandoIncidencia, setEnviandoIncidencia] = useState(false);
  const [errorIncidencia, setErrorIncidencia] = useState(null);
  const [reportadas, setReportadas] = useState(new Set());

  const cargar = async (paginaActual, acumular = false) => {
    if (!hogar?.id) return;
    acumular ? setCargandoMas(true) : setCargando(true);
    try {
      const datos = await getHistorialHogar(hogar.id, paginaActual, LIMITE);
      setRegistros(prev => acumular ? [...prev, ...datos] : datos);
      setHayMas(datos.length === LIMITE);
    } catch {
      setHayMas(false);
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    if (!hogar?.id) return;
    let activo = true;
    const cargarInicial = async () => {
      try {
        const datos = await getHistorialHogar(hogar.id, 0, LIMITE);
        if (activo) {
          setRegistros(datos);
          setHayMas(datos.length === LIMITE);
        }
      } catch {
        if (activo) setHayMas(false);
      } finally {
        if (activo) {
          setCargando(false);
          setCargandoMas(false);
        }
      }
    };
    cargarInicial();
    return () => {activo = false;};}, [hogar?.id]
  );

  const cargarMas = () => {
    const siguiente = pagina + 1;
    setPagina(siguiente);
    cargar(siguiente, true);
  };

  // Envía la incidencia del registro seleccionado
  const enviarIncidencia = async () => {
    if (!descripcionIncidencia.trim()) {
      setErrorIncidencia('Describe el problema encontrado');
      return;
    }
    setEnviandoIncidencia(true);
    setErrorIncidencia(null);
    try {
      await reportarIncidencia(incidenciaDe.id, descripcionIncidencia);
      setReportadas(prev => new Set(prev).add(incidenciaDe.id));
      setIncidenciaDe(null);
      setDescripcionIncidencia('');
    } catch (err) {
      setErrorIncidencia(err.message);
    } finally {
      setEnviandoIncidencia(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const ahora = new Date();
    const diffDias = Math.floor((ahora - d) / (1000 * 60 * 60 * 24));
    if (diffDias === 0) return `Hoy a las ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (diffDias === 1) return `Ayer a las ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!hogar) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="hogares" />
        <main className={`main-content ${styles.centroVacio}`}>
          <p className={styles.textoCargando}>No se ha seleccionado ningún hogar.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="hogares" />

      <main className="main-content">
        <button onClick={() => navigate(-1)} className={styles.botonVolver}>
          <ArrowLeft size={18} /> Volver al panel
        </button>

        {/* Cabecera del Hogar */}
        <div className={styles.header} style={{ background: apariencia.gradiente }}>
          <div className={styles.headerIcono}>
            <Icono size={60} color="rgba(255,255,255,0.25)" strokeWidth={1.2} />
          </div>
          <div className={styles.headerTexto}>
            <h1 className={styles.headerTitulo}>Actividad de {hogar.nombre}</h1>
            <p className={styles.headerSubtitulo}>Historial completo de tareas completadas</p>
          </div>
        </div>

        {/* Lista de Registros */}
        {cargando ? (
          <p className={styles.textoCargando}>Cargando actividad...</p>
        ) : registros.length === 0 ? (
          <div className={`tarjeta-cristal ${styles.tarjetaVacia}`}>
            Aún no hay tareas completadas en este hogar.
          </div>
        ) : (
          <>
            <div className={styles.listaRegistros}>
              {registros.map((r, i) => (
                <div key={`${r.id}-${i}`} className={`tarjeta-cristal ${styles.itemRegistro}`}>

                  <div
                    className={`${styles.itemIcono} ${r.imagenUrl ? styles.iconoClickeable : ''}`}
                    onClick={() => r.imagenUrl && setImagenAmpliada(r.id === imagenAmpliada ? null : r.id)}
                    title={r.imagenUrl ? 'Haz clic para ver la imagen' : ''}
                  >
                    {r.imagenUrl ? (
                      <img
                        src={`${BASE_SERVIDOR}${r.imagenUrl}`}
                        alt="Imagen de la tarea"
                        className={styles.itemImagenMini}
                        onError={manejarErrorImagen}
                      />
                    ) : (
                      <CheckCircle2 size={22} color="#06d6a0" strokeWidth={1.8} />
                    )}
                  </div>

                  <div className={styles.itemInfo}>
                    <div className={styles.itemNombre}>{r.nombre}</div>
                    <div className={styles.itemMeta}>
                      <span
                        className={`${styles.usuarioMeta} ${r.usuarioId === usuarioLogueado?.id ? styles.usuarioPropio : ''}`}
                        onClick={() => r.usuarioId !== usuarioLogueado?.id && navigate(`/perfil-ajeno/${r.usuarioId}`)}
                        title={r.usuarioId === usuarioLogueado?.id ? 'Eres tú' : `Ver perfil de ${r.nombreUsuario}`}
                      >
                        {r.nombreUsuario}
                        {r.usuarioId === usuarioLogueado?.id && <span className={styles.etiquetaTu}> (tú)</span>}
                      </span>
                      <span className={styles.separadorPunto}>·</span>
                      <Clock size={13} color="#90b4ce" />
                      <span>{formatearFecha(r.fechaCompletada)}</span>
                      
                      {r.imagenUrl && (
                        <span className={styles.indicadorFoto}>
                          <Image size={12} /> foto
                        </span>
                      )}
                    </div>

                    {r.imagenUrl && imagenAmpliada === r.id && (
                      <div className={styles.contenedorImagenDesplegada}>
                        <img
                          src={`${BASE_SERVIDOR}${r.imagenUrl}`}
                          alt="Imagen de la tarea ampliada"
                          className={styles.imagenDesplegada}
                          onError={manejarErrorImagen}
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.itemPuntos}>+{r.puntosSumados} pts</div>

                  {r.usuarioId !== usuarioLogueado?.id && !reportadas.has(r.id) && (
                    <button
                      className={styles.btnIncidencia}
                      title="Reportar incidencia"
                      onClick={() => { setErrorIncidencia(null); setDescripcionIncidencia(''); setIncidenciaDe(r); }}
                    >
                      <AlertTriangle size={13} strokeWidth={2.5} /> Reportar
                    </button>
                  )}
                  {reportadas.has(r.id) && (
                    <span className={styles.incidenciaReportadaTag}>Incidencia reportada</span>
                  )}
                </div>
              ))}
            </div>

            {hayMas && (
              <div className={styles.contenedorCargarMas}>
                <button onClick={cargarMas} disabled={cargandoMas} className={`boton-primario ${styles.botonCargarMas}`}>
                  <ChevronDown size={18} />
                  {cargandoMas ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}

            {!hayMas && registros.length > 0 && (
              <p className={styles.finHistorial}>Ya has visto toda la actividad del hogar.</p>
            )}
          </>
        )}
      </main>

      {/* Modal imagen a pantalla completa al hacer clic en la miniatura */}
      {imagenAmpliada && registros.find(r => r.id === imagenAmpliada)?.imagenUrl && (
        <div className={styles.overlayVisor} onClick={() => setImagenAmpliada(null)}>
          <img
            src={`${BASE_SERVIDOR}${registros.find(r => r.id === imagenAmpliada).imagenUrl}`}
            alt="Imagen ampliada"
            className={styles.imagenVisor}
            onClick={e => e.stopPropagation()}
            onError={manejarErrorImagen}
          />
        </div>
      )}

      {/* Modal reportar incidencia */}
      {incidenciaDe && (
        <div className="modal-overlay" onClick={() => !enviandoIncidencia && setIncidenciaDe(null)}>
          <div className="tarjeta-cristal modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar-modal" onClick={() => setIncidenciaDe(null)} disabled={enviandoIncidencia}>
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 className={styles.tituloModal}>Reportar incidencia</h2>
            <p className={styles.textoModal}>
              Tarea <strong>{incidenciaDe.nombre}</strong>, hecha por <strong>{incidenciaDe.nombreUsuario}</strong>. Cuéntanos qué ha ocurrido.
            </p>
            <textarea
              className={`input-estetico ${styles.textareaModal}`}
              rows={4}
              placeholder="Describe el problema encontrado..."
              value={descripcionIncidencia}
              onChange={e => setDescripcionIncidencia(e.target.value)}
            />
            {errorIncidencia && <p className={styles.errorModal}>{errorIncidencia}</p>}
            <div className={styles.accionesModal}>
              <button
                onClick={() => setIncidenciaDe(null)}
                disabled={enviandoIncidencia}
                className={styles.btnCancelarModal}
              >
                Cancelar
              </button>
              <button
                onClick={enviarIncidencia}
                disabled={enviandoIncidencia}
                className={`boton-primario ${styles.btnEnviarModal}`}
              >
                {enviandoIncidencia ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}