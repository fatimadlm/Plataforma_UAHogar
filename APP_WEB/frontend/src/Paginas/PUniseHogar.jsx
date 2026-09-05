import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { apiFetch } from '../Servicios/apiFetch';
import { ArrowLeft, Hash, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../Configuracion/apiConfig';
import styles from './PCrearHogar.module.css'; // Reutilizamos los estilos del formulario

export default function PUnirseHogar() {
  const navigate = useNavigate();
  const { usuario } = useSesion();

  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  const unirseSubmit = async (e) => {
    e.preventDefault();
    if (!usuario?.id) return;

    setEnviando(true);
    setError(null);

    try {
      const res = await apiFetch(`${API_URL}/api/hogares/unirse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoInvitacion: codigo.trim().toUpperCase()
        })
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Código no válido o ya eres miembro de este hogar');
      }

      setExito(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="pantalla-dividida">
        <Sidebar paginaActiva="hogares" />
        <main className={`main-content ${styles.mainCentrado}`}>
          <div className={styles.contenedorFormulario}>
            <div className={`tarjeta-cristal ${styles.tarjetaExito}`}>
              <CheckCircle2 size={64} color="#06d6a0" strokeWidth={1.5} className={styles.iconoExito} />
              <h2 className={styles.tituloExito}>¡Te has unido!</h2>
              <p className={styles.parrafoExito}>
                Ya formas parte del hogar. Puedes ver tus tareas y compañeros desde el panel.
              </p>
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
            <h1 className={styles.tituloPrincipal}>Unirse a un Hogar</h1>
            <p className={styles.subtituloPrincipal}>Introduce el código que te ha compartido tu compañero.</p>
          </header>

          <div className={`tarjeta-cristal ${styles.tarjetaFormulario}`}>
            <form className={styles.formCrear} onSubmit={unirseSubmit}>

              <div className={styles.inputGrupo}>
                <label className={styles.inputLabel}><Hash size={18} /> Código de invitación</label>
                <input
                  type="text"
                  className={`${styles.inputText} ${styles.inputCodigoUnirse}`}
                  placeholder="Ej: A3F9B2C1"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  maxLength={8}
                  required
                />
                <p className={styles.nombreApariencia}>
                  El código tiene 8 caracteres y te lo tiene que pasar el administrador del hogar.
                </p>
              </div>

              {error && <p className={styles.errorTexto}>{error}</p>}

              <button
                type="submit"
                className={`boton-primario ${styles.botonCrear}`}
                disabled={enviando || codigo.trim().length < 8}
              >
                {enviando ? 'Uniéndose...' : 'Unirse al Hogar'}
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}