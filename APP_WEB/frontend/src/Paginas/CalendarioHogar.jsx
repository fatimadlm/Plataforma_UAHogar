import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';

import Sidebar from '../Componentes/Sidebar';
import { getInstanciasActivasHogar } from '../Servicios/PeticionTarea';

import {
  DIAS_SEMANA_CORTO,
  NOMBRES_MESES,
  NOMBRES_MESES_COMPLETOS,
  nombreDiaSemana,
  generarDias15,
  colorTipo,
} from '../Configuracion/TareaConfig';

import styles from './Calendario.module.css';

const normalizarFecha = (valor) => {
  if (!valor) return null;

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  fecha.setHours(0, 0, 0, 0);

  return fecha;
};

const claveFecha = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

export default function CalendarioHogar() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const hogar = state?.hogarActivo;

  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const hoy = useMemo(() => {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);

    return fecha;
  }, []);

  const dias = useMemo(() => generarDias15(), []);

  useEffect(() => {
    let activo = true;

    const cargarTareas = async () => {
      if (!hogar?.id) {
        if (activo) {
          setTareas([]);
          setError('No se ha seleccionado ningún hogar.');
          setCargando(false);
        }

        return;
      }

      setCargando(true);
      setError('');

      try {
        const datos = await getInstanciasActivasHogar(hogar.id);

        if (activo) {
          setTareas(Array.isArray(datos) ? datos : []);
        }
      } catch {
        if (activo) {
          setTareas([]);
          setError('No se han podido cargar las tareas del hogar.');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarTareas();

    return () => {
      activo = false;
    };
  }, [hogar?.id]);

  const tareasPorFecha = useMemo(() => {
    const agrupadas = {};

    tareas.forEach((tarea) => {
      const fecha = normalizarFecha(tarea.fechaLimite);

      if (!fecha) return;

      const clave = claveFecha(fecha);

      if (!agrupadas[clave]) {
        agrupadas[clave] = [];
      }

      agrupadas[clave].push(tarea);
    });

    return agrupadas;
  }, [tareas]);

  const periodo = useMemo(() => {
    const inicio = dias[0];
    const fin = dias[dias.length - 1];

    return `${inicio.getDate()} ${
      NOMBRES_MESES[inicio.getMonth()]
    } — ${fin.getDate()} ${
      NOMBRES_MESES[fin.getMonth()]
    } ${fin.getFullYear()}`;
  }, [dias]);

  const nombreTarea = (tarea) => {
    return tarea.nombre || tarea.titulo || tarea.tarea?.nombre || 'Tarea';
  };

  const nombreAsignado = (tarea) => {
    return (
      tarea.nombreUsuarioAsignado ||
      tarea.nombreUsuario ||
      tarea.usuarioNombre ||
      tarea.asignado ||
      tarea.usuarioAsignado?.nombre ||
      tarea.usuario?.nombre ||
      ''
    );
  };

  const estadoTarea = (tarea) => {
    return String(tarea.estado || '').toUpperCase();
  };

  const tareasDelDia = diaSeleccionado
    ? tareasPorFecha[claveFecha(diaSeleccionado)] || []
    : [];

  const huecosIniciales = (dias[0].getDay() + 6) % 7;
  const huecosFinales = (7 - ((huecosIniciales + dias.length) % 7)) % 7;

  if (!hogar) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="hogares" />

        <main className="main-content">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.botonVolver}
          >
            <ArrowLeft size={18} />
            Volver
          </button>

          <section className="tarjeta-cristal">
            <h1>No se ha seleccionado ningún hogar</h1>
            <p>Vuelve atrás y selecciona un hogar para ver su calendario.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="hogares" />

      <main className="main-content">
        <button
          type="button"
          onClick={() =>
            navigate('/panelhogar', {
              state: { hogarActivo: hogar },
            })
          }
          className={styles.botonVolver}
        >
          <ArrowLeft size={18} />
          Volver al Panel de {hogar.nombre}
        </button>

        <header className={styles.headerPrincipal}>
          <h1 className={styles.tituloPrincipal}>
            Calendario de {hogar.nombre}
          </h1>

          <p className={styles.subtituloPrincipal}>
            Tareas activas de todos los miembros del hogar durante los próximos
            15 días.
          </p>
        </header>

        <section className={`tarjeta-cristal ${styles.seccionCalendario}`}>
          <div className={styles.header}>
            <div className={styles.headerPeriodo}>
              <CalendarIcon size={26} color="#3d5a80" />
              <h2 className={styles.tituloPeriodo}>{periodo}</h2>
            </div>
          </div>

          {error && <p className={styles.mensajeError}>{error}</p>}

          {cargando ? (
            <p className={styles.mensajeCargando}>Cargando tareas...</p>
          ) : (
            <div className={styles.calendarioGrid}>
              {DIAS_SEMANA_CORTO.map((dia) => (
                <div key={dia} className={styles.cabeceraDia}>
                  {dia.toUpperCase()}
                </div>
              ))}

              {Array.from({ length: huecosIniciales }).map((_, indice) => (
                <div
                  key={`inicio-${indice}`}
                  className={styles.celdaVacia}
                />
              ))}

              {dias.map((dia, indice) => {
                const clave = claveFecha(dia);
                const tareasAqui = tareasPorFecha[clave] || [];
                const esHoy = clave === claveFecha(hoy);
                const esSeleccionado =
                  diaSeleccionado &&
                  claveFecha(diaSeleccionado) === clave;

                const cambioMes =
                  indice > 0 &&
                  dia.getMonth() !== dias[indice - 1].getMonth();

                return (
                      <div key={clave} className={styles.contenedorFilaGrid}>
                      {cambioMes && (
                      <div className={styles.separadorMes}>
                        <span>
                          {NOMBRES_MESES_COMPLETOS[dia.getMonth()]}{' '}
                          {dia.getFullYear()}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      className={[
                        styles.celda,
                        esHoy ? styles.celdaHoy : '',
                        esSeleccionado ? styles.celdaSeleccionada : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() =>
                        setDiaSeleccionado(esSeleccionado ? null : dia)
                      }
                    >
                      <span className={styles.nombreDiaCelda}>
                        {nombreDiaSemana(dia)}
                      </span>

                      <span
                        className={[
                          styles.numeroDia,
                          esHoy ? styles.numeroDiaHoy : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {dia.getDate()}
                      </span>

                      <div className={styles.contenedorTareasDia}>
                        {tareasAqui.slice(0, 2).map((tarea) => (
                          <div
                            key={tarea.id}
                            className={[
                              styles.chipTarea,
                              estadoTarea(tarea) === 'VENCIDA'
                                ? styles.chipTareaVencida
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            title={`${nombreTarea(tarea)}${
                              nombreAsignado(tarea)
                                ? ` — ${nombreAsignado(tarea)}`
                                : ''
                            }`}
                            style={{
                              backgroundColor: colorTipo(tarea.tipo),
                            }}
                          >
                            {nombreTarea(tarea)}
                          </div>
                        ))}

                        {tareasAqui.length > 2 && (
                          <span className={styles.masItems}>
                            +{tareasAqui.length - 2}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}

              {Array.from({ length: huecosFinales }).map((_, indice) => (
                <div
                  key={`fin-${indice}`}
                  className={styles.celdaVacia}
                />
              ))}
            </div>
          )}

          {diaSeleccionado && (
            <div
              className={`tarjeta-cristal ${styles.contenedorDetalleDia}`}
            >
              <h3 className={styles.tituloDetalleDia}>
                {nombreDiaSemana(diaSeleccionado)},{' '}
                {diaSeleccionado.getDate()} de{' '}
                {NOMBRES_MESES_COMPLETOS[diaSeleccionado.getMonth()]}
              </h3>

              {tareasDelDia.length === 0 ? (
                <div className={styles.panelVacio}>
                  <CheckCircle2 size={30} strokeWidth={1.5} />
                  <p className={styles.panelVacioTexto}>
                    No hay tareas activas este día
                  </p>
                </div>
              ) : (
                tareasDelDia.map((tarea) => (
                  <div
                    key={tarea.id}
                    className={`tarjeta-cristal ${styles.tarjetaDetalle}`}
                    style={{
                      borderLeft: `4px solid ${colorTipo(tarea.tipo)}`,
                    }}
                  >
                    <div className={styles.detalleTitulo}>
                      {nombreTarea(tarea)}
                    </div>

                    {tarea.descripcion && (
                      <div className={styles.detalleDesc}>
                        {tarea.descripcion}
                      </div>
                    )}

                    <div className={styles.detalleMeta}>
                      {tarea.tiempoEstimado && (
                        <span className={styles.detalleChip}>
                          <Clock size={12} />
                          {tarea.tiempoEstimado} min
                        </span>
                      )}

                      {nombreAsignado(tarea) && (
                        <span className={styles.detalleChip}>
                          <User size={12} />
                          {nombreAsignado(tarea)}
                        </span>
                      )}

                      {tarea.puntos != null && (
                        <span className={styles.chipPuntos}>
                          {tarea.puntos} pts
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}