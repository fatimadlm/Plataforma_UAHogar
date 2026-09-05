import { useState, useEffect, Fragment } from 'react';
import { CheckCircle2, Clock, Home } from 'lucide-react';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { getTareasPorUsuario } from '../Servicios/PeticionTarea';
import { colorTipo, NOMBRES_MESES, NOMBRES_MESES_COMPLETOS, nombreDiaSemana, generarDias15 } from '../Configuracion/TareaConfig';
import styles from './Calendario.module.css';

export default function Calendario() {
  const { usuario } = useSesion();
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(() => Boolean(usuario?.id));
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const dias = generarDias15();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Genera una clave de fecha usando la hora local
  const obtenerClaveFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Cargamos las instancias pendientes del usuario
  useEffect(() => {
    if (!usuario?.id) {
      setCargando(false);
      return;
    }
    setCargando(true);
    getTareasPorUsuario(usuario.id)
      .then(datos => setTareas(Array.isArray(datos) ? datos : []))
      .catch(() => setTareas([]))
      .finally(() => setCargando(false));
  }, [usuario]);

  // Agrupamos por el dia de la fechaLimite
  const tareasPorFecha = {};
  tareas.forEach(t => {
    if (!t.fechaLimite) return;
    const clave = t.fechaLimite.substring(0, 10);
    if (!tareasPorFecha[clave]) tareasPorFecha[clave] = [];
    tareasPorFecha[clave].push(t);
  });

  const claveSeleccionada = diaSeleccionado ? obtenerClaveFecha(diaSeleccionado) : null;
  const tareasDelDia = claveSeleccionada ? (tareasPorFecha[claveSeleccionada] || []) : [];

  // Formatea el periodo mostrado en la cabecera
  const formatearPeriodo = () => {
    const ini = dias[0];
    const fin = dias[14];
    return `${ini.getDate()} ${NOMBRES_MESES[ini.getMonth()]} — ${fin.getDate()} ${NOMBRES_MESES[fin.getMonth()]} ${fin.getFullYear()}`;
  };

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="calendario" />

      <main className="main-content">
        <header className={styles.headerPrincipal}>
          <h1 className={styles.tituloPrincipal}>Mi Calendario</h1>
          <p className={styles.subtituloPrincipal}>Tus tareas pendientes en los próximos 15 días.</p>
        </header>

        <div className={styles.layout}>
          <section className={`tarjeta-cristal ${styles.seccionCalendario}`}>
            <div className={styles.header}>
              <h2 className={styles.tituloPeriodo}>{formatearPeriodo()}</h2>
            </div>

            <div className={styles.leyenda}>
              {['LIMPIEZA', 'COMPRAS', 'MANTENIMIENTO', 'MASCOTAS', 'COCINA'].map(tipo => (
                <span key={tipo} className={styles.leyendaItem}>
                  <span className={styles.leyendaPunto} style={{ background: colorTipo(tipo) }} />
                  {tipo}
                </span>
              ))}
            </div>

            {cargando ? (
              <p className={styles.mensajeCargando}>Cargando tareas...</p>
            ) : (
              <div className={styles.calendarioGrid}>
                {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(dia => (
                  <div key={dia} className={styles.cabeceraDia}>{dia}</div>
                ))}

                {dias.map((dia, i) => {
                  const esPrimerDiaMes =
                    i === 0 ||
                    dia.getMonth() !== dias[i - 1].getMonth() ||
                    dia.getFullYear() !== dias[i - 1].getFullYear();

                  // Domingo=0. Lo convertimos a lunes=0
                  const posicionSemana = (dia.getDay() + 6) % 7;
                  const clave = obtenerClaveFecha(dia);
                  const esHoy = dia.getTime() === hoy.getTime();
                  const esSel = diaSeleccionado?.getTime() === dia.getTime();
                  const tareasAqui = tareasPorFecha[clave] || [];

                  return (
                    <Fragment key={clave}>
                      {esPrimerDiaMes && (
                        <div className={styles.separadorMes}>
                          <span>{NOMBRES_MESES_COMPLETOS[dia.getMonth()]} {dia.getFullYear()}</span>
                        </div>
                      )}

                      {esPrimerDiaMes && Array.from({ length: posicionSemana }, (_, j) => (
                        <div key={`hueco-${clave}-${j}`} className={styles.celdaVacia} aria-hidden="true" />
                      ))}

                      <div
                        className={`${styles.celda} ${esHoy ? styles.celdaHoy : ''} ${esSel ? styles.celdaSeleccionada : ''}`}
                        onClick={() => setDiaSeleccionado(esSel ? null : dia)}
                      >
                        <span className={styles.nombreDiaCelda}>{nombreDiaSemana(dia)}</span>
                        <span className={`${styles.numeroDia} ${esHoy ? styles.numeroDiaHoy : ''}`}>
                          {dia.getDate()}
                        </span>

                        <div className={styles.contenedorTareasDia}>
                          {tareasAqui.slice(0, 2).map(t => (
                            <div
                              key={t.id}
                              className={`${styles.chipTarea} ${t.estado === 'VENCIDA' ? styles.chipTareaVencida : ''}`}
                              style={{ background: colorTipo(t.tipo) }}
                              title={t.nombre}
                            >
                              {t.nombre}
                            </div>
                          ))}
                          {tareasAqui.length > 2 && (
                            <span className={styles.masItems}>+{tareasAqui.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            )}
          </section>

          <aside className={styles.panel}>
            {diaSeleccionado ? (
              <>
                <div className={`tarjeta-cristal ${styles.cabeceraDetalle}`}>
                  <h3 className={styles.tituloDetalleDia}>
                    {nombreDiaSemana(diaSeleccionado)}, {diaSeleccionado.getDate()} de {NOMBRES_MESES_COMPLETOS[diaSeleccionado.getMonth()]}
                  </h3>
                  <p className={styles.subtituloDetalleDia}>
                    {tareasDelDia.length === 0 ? 'Sin tareas este día' : `${tareasDelDia.length} tarea${tareasDelDia.length !== 1 ? 's' : ''}`}
                  </p>
                </div>

                {tareasDelDia.length === 0 ? (
                  <div className={`tarjeta-cristal ${styles.panelVacio}`}>
                    <CheckCircle2 size={32} strokeWidth={1.5} />
                    <p className={styles.panelVacioTexto}>Día libre</p>
                  </div>
                ) : (
                  tareasDelDia.map(t => (
                    <div
                      key={t.id}
                      className={`tarjeta-cristal ${styles.tarjetaDetalle}`}
                      style={{ borderLeft: `4px solid ${colorTipo(t.tipo)}` }}
                    >
                      <div className={styles.detalleTitulo}>{t.nombre}</div>
                      {t.descripcion && <div className={styles.detalleDesc}>{t.descripcion}</div>}
                      <div className={styles.detalleMeta}>
                        {t.tiempoEstimado && (
                          <span className={styles.detalleChip}><Clock size={12} />{t.tiempoEstimado} min</span>
                        )}
                        {t.nombreHogar && (
                          <span className={styles.detalleChip}><Home size={12} />{t.nombreHogar}</span>
                        )}
                        <span className={styles.chipPuntos} style={{ background: colorTipo(t.tipo) }}>
                          {t.puntos} pts
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div className={`tarjeta-cristal ${styles.panelVacio}`}>
                <CheckCircle2 size={36} strokeWidth={1.3} />
                <p className={styles.panelVacioTexto}>Haz clic en un día para ver sus tareas</p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}