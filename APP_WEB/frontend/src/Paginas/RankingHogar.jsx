import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import {
  ArrowLeft, Trophy, Star, Flame, Clock, Zap,
  ChevronDown, ChevronUp, CheckCircle2, Users, Award, Medal, Calendar
} from 'lucide-react';
import { getApariencia } from '../Configuracion/AparienciasHogar';
import { getEstadisticasHogar } from '../Servicios/PeticionTarea';
import { NOMBRES_MESES, podiumConfig } from '../Configuracion/TareaConfig';
import styles from './RankingHogar.module.css';

const STATS_CONFIG = [
  { key: 'masLimpio',        icono: Flame,    color: '#06d6a0', titulo: 'El más limpio',             descripcion: (v) => `${v} lleva el hogar a sus espaldas. Alguien tiene que hacerlo.` },
  { key: 'masPelotas',       icono: Clock,    color: '#ef476f', titulo: 'El más pelotas',             descripcion: (v) => `${v} es el campeon de las tareas vencidas. Siempre hay una primera vez... y una segunda... y una tercera.` },
  { key: 'masAntiguo',       icono: Star,     color: '#f4a261', titulo: 'El veterano',                descripcion: (v) => `${v} fue el primero en llegar. Quien sabe si tambien sera el ultimo en irse.` },
  { key: 'masNuevo',         icono: Zap,      color: '#90b4ce', titulo: 'El novato',                  descripcion: (v) => `${v} es el ultimo en llegar. Bienvenido al caos organizado.` },
  { key: 'tipoTareaFavorita',icono: Award,    color: '#8338ec', titulo: 'El tipo de tarea favorito',  descripcion: (v) => `En este hogar se hacen muchas tareas de tipo ${v}. El orden tiene sus preferidos.` },
  { key: 'tareaEstrella',    icono: Trophy,   color: '#FFD700', titulo: 'La tarea estrella',          descripcion: (v) => `"${v}" es la tarea que mas puntos ha generado. Alguien la hace muy bien.` },
];

const TOTALES_CONFIG = [
  { key: 'totalCompletadas', label: 'Tareas completadas', icono: CheckCircle2, color: '#06d6a0' },
  { key: 'totalMiembros',    label: 'Miembros del hogar', icono: Users,        color: '#90b4ce' },
  { key: 'totalPuntos',      label: 'Puntos generados',   icono: Star,         color: '#f4a261' },
];

export default function RankingHogar() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const hogar      = state?.hogarActivo;
  const apariencia = getApariencia(hogar?.aparienciaId);
  const { Icono }  = apariencia;

  const [stats, setStats]           = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [mesVisible, setMesVisible] = useState(0);

  // Cargamos las estadisticas del hogar al montar el componente
  useEffect(() => {
    if (!hogar?.id) return;
    getEstadisticasHogar(hogar.id)
      .then(setStats)
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [hogar?.id]);

  if (!hogar) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="hogares" />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className={styles.vacio}>No se ha seleccionado ningún hogar.</p>
        </main>
      </div>
    );
  }

  const mesDatos   = stats?.rankingMensual?.[mesVisible];
  const totalMeses = stats?.rankingMensual?.length ?? 1;

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="hogares" />

      <main className="main-content">
        <button className={styles.btnVolver} onClick={() => navigate('/panelhogar', { state: { hogarActivo: hogar } })}>
          <ArrowLeft size={18} /> Volver al panel
        </button>

        {/* Cabecera */}
        <div className={styles.header} style={{ background: apariencia.gradiente }}>
          <div className={styles.headerIcono}>
            <Icono size={80} color="white" strokeWidth={1.2} />
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900' }}>Ranking de {hogar.nombre}</h1>
            <p style={{ margin: 0, opacity: 0.85, fontWeight: '600', fontSize: '0.9rem' }}>
              Estadísticas y ranking mensual del hogar
            </p>
          </div>
        </div>

        {cargando ? (
          <p className={styles.vacio}>Cargando estadísticas...</p>
        ) : (
          <div className={styles.contenedor}>

            {/* Fecha de creacion del hogar */}
            {stats?.fechaCreacion && (
              <div className={`tarjeta-cristal ${styles.tarjetaFechaCreacion}`}>
                <Calendar size={20} color="#90b4ce" />
                <span className={styles.textoFechaCreacion}>
                  Hogar creado el <strong className={styles.fechaDestacada}>{stats.fechaCreacion}</strong>
                </span>
              </div>
            )}

            {/* Totales del hogar */}
            <div className={styles.gridTotales}>
              {TOTALES_CONFIG.map(({ key, label, icono: IconoTotal, color }) => (
                <div key={key} className={`tarjeta-cristal ${styles.tarjetaTotal}`}>
                  <IconoTotal size={28} color={color} />
                  <div className={styles.totalValor}>{stats?.[key] ?? 0}</div>
                  <div className={styles.totalLabel}>{label}</div>
                </div>
              ))}
            </div>

            {/* Ranking Mensual */}
            <div className={`tarjeta-cristal ${styles.tarjetaRankingMensual}`}>
              <div className={styles.rankingHeader}>
                <span className={styles.rankingTitulo}>
                  <Trophy size={20} /> Ranking mensual
                </span>
                <div className={styles.navMeses}>
                  <button
                    className={styles.btnMes}
                    onClick={() => setMesVisible(p => Math.min(p + 1, totalMeses - 1))}
                    disabled={mesVisible >= totalMeses - 1}
                  >
                    <ChevronDown size={14} />
                  </button>
                  <span className={styles.nombreMes}>
                    {mesDatos ? `${NOMBRES_MESES[mesDatos.mes - 1]} ${mesDatos.anio}` : ''}
                  </span>
                  <button
                    className={styles.btnMes}
                    onClick={() => setMesVisible(p => Math.max(p - 1, 0))}
                    disabled={mesVisible === 0}
                  >
                    <ChevronUp size={14} />
                  </button>
                </div>
              </div>

              {!mesDatos?.miembros?.length ? (
                <p className={styles.vacio}>Sin actividad este mes</p>
              ) : (
                <div className={styles.listaRanking}>
                  {mesDatos.miembros.map((m, i) => {
                    const config = podiumConfig[i] || { color: '#90b4ce', label: `${i + 1}`, icono: Medal };
                    const IconoPodium = config.icono;
                    return (
                      <div key={m.nombre} className={`${styles.filaRanking} ${i === 0 ? styles.filaRankingPrimero : ''}`}>
                        <IconoPodium size={i === 0 ? 22 : 18} color={config.color} />
                        <span className={styles.labelPosicion} style={{ color: config.color }}>{config.label}</span>
                        <div className={styles.avatarRanking} style={{ background: config.color }}>
                          {m.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.nombreRanking}>{m.nombre}</span>
                        <span className={styles.puntosRanking} style={{ color: config.color }}>{m.puntos} pts</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.gridStats}>
              {STATS_CONFIG.map(({ key, icono: IconoStat, color, titulo, descripcion }) => {
                const valor = stats?.[key];
                if (!valor) return null;
                return (
                  <div key={key} className={`tarjeta-cristal ${styles.tarjetaStat}`} style={{ borderLeft: `4px solid ${color}` }}>
                    <div className={styles.statTitulo}>
                      <IconoStat size={18} color={color} /> {titulo}
                    </div>
                    <p className={styles.statDescripcion}>{descripcion(valor)}</p>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}