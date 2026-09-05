import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { apiFetch } from '../Servicios/apiFetch';
import { ArrowLeft, Home, FileText, Image as ImageIcon, Check, Copy, CheckCheck, CheckCircle2 } from 'lucide-react';
import { APARIENCIAS_HOGAR } from '../Configuracion/AparienciasHogar';
import { API_URL } from '../Configuracion/apiConfig';
import styles from './PCrearHogar.module.css';

export default function PCrearHogar() {
  const navigate = useNavigate();
  const { usuario } = useSesion();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [hogarCreado, setHogarCreado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [seleccion, setSeleccion] = useState(APARIENCIAS_HOGAR[0]);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(hogarCreado.codigoInvitacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const crearHogarSubmit = async (e) => {
    e.preventDefault();
    if (!usuario?.id) return;

    setEnviando(true);
    setError(null);

    try {
      const res = await apiFetch(`${API_URL}/api/hogares/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreHogar: nombre,
          aparienciaId: seleccion.id,
        })
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al crear el hogar');
      }

      const datos = await res.json();
      setHogarCreado({ ...datos, apariencia: seleccion });

    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  // Pantalla de éxito
  if (hogarCreado) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="hogares" />
        <main className={`main-content ${styles.mainCentrado}`}>
          <div className={styles.contenedorFormulario}>
            <div className={`tarjeta-cristal ${styles.tarjetaExito}`}>
              <CheckCircle2 size={64} color="#06d6a0" strokeWidth={1.5} className={styles.iconoExito} />
              <h2 className={styles.tituloExito}>¡Hogar creado!</h2>
              <p className={styles.parrafoExito}>
                Comparte este código con tus compañeros para que puedan unirse.
              </p>
              <div className={styles.cajaCodigo}>
                <p className={styles.labelCodigo}>Código de invitación</p>
                <div className={styles.filaCodigo}>
                  <span className={styles.valorCodigo}>{hogarCreado.codigoInvitacion}</span>
                  <button
                    onClick={copiarCodigo}
                    className={styles.btnCopiar}
                    title="Copiar código"
                  >
                    {copiado ? <CheckCheck size={22} color="#06d6a0" /> : <Copy size={22} />}
                  </button>
                </div>
              </div>
              <button
                className={`boton-primario ${styles.btnIrHogares}`}
                onClick={() => navigate('/phogares')}
              >
                Ir a mis hogares
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="hogares" />

      <main className={`main-content ${styles.mainCentrado}`}>
        <div className={styles.contenedorFormulario}>

          <button className={styles.btnVolver} onClick={() => navigate('/phogares')}>
            <ArrowLeft size={20} /> Volver a mis hogares
          </button>

          <header className={styles.cabecera}>
            <h1 className={styles.tituloPrincipal}>Crear Nuevo Hogar</h1>
            <p className={styles.subtituloPrincipal}>Personaliza el estilo de tu nuevo espacio.</p>
          </header>

          <div className={`tarjeta-cristal ${styles.tarjetaFormulario}`}>
            <form className={styles.formCrear} onSubmit={crearHogarSubmit}>

              <div className={styles.inputGrupo}>
                <label className={styles.inputLabel}><Home size={18} /> Nombre del Hogar *</label>
                <input
                  type="text"
                  className={styles.inputText}
                  placeholder="Ej: Ático Alcalá..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={75}
                  required
                />
              </div>

              <div className={styles.inputGrupo}>
                <label className={styles.inputLabel}><FileText size={18} /> Descripción</label>
                <textarea
                  className={styles.inputTextarea}
                  placeholder="Normas o mensaje de bienvenida..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              {/* Selector de apariencia */}
              <div className={styles.inputGrupo}>
                <label className={styles.inputLabel}><ImageIcon size={18} /> Elige una apariencia</label>
                <div className={styles.gridVisual}>
                  {APARIENCIAS_HOGAR.map((opt) => {
                    const { Icono } = opt;
                    return (
                      <div
                        key={opt.id}
                        className={`${styles.opcionVisual} ${seleccion.id === opt.id ? styles.seleccionada : ''}`}
                        style={{ background: opt.gradiente }}
                        onClick={() => setSeleccion(opt)}
                        title={opt.nombre}
                      >
                        {Icono && <Icono size={28} color="white" strokeWidth={1.5} />}
                        {seleccion.id === opt.id && (
                          <div className={styles.iconoCheck}><Check size={12} strokeWidth={4} /></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className={styles.nombreApariencia}>{seleccion.nombre}</p>
              </div>

              {error && <p className={styles.errorTexto}>{error}</p>}

              <button
                type="submit"
                className={`boton-primario ${styles.botonCrear}`}
                disabled={enviando}
              >
                {enviando ? 'Creando...' : 'Crear Hogar'}
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}