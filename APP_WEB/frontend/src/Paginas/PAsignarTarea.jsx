import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { 
  ArrowLeft, 
  CheckSquare, 
  User, 
  Calendar, 
  AlertCircle, 
  FileText,
  Send
} from 'lucide-react';
import styles from './PAsignarTarea.module.css';

export default function PAsignarTarea() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const hogar = state?.hogarActivo || { nombre: 'Mi Hogar', id: 1 };

  const miembros = [
    { id: 1, nombre: 'Fátima' },
    { id: 2, nombre: 'Juan' },
    { id: 3, nombre: 'María' }
  ];

  const [tarea, setTarea] = useState({
    titulo: '',
    descripcion: '',
    asignadoA: '',
    fechaLimite: '',
    prioridad: 'Media'
  });

  const manejarEnvio = (e) => {
    e.preventDefault();
    navigate('/panel-hogar', { state: { hogarActivo: hogar } });
  };

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="hogares" />

      <main className={`main-content ${styles.mainCentrado}`}>
        <div className={styles.contenedorFormulario}>
          <button 
            onClick={() => navigate('/panel-hogar', { state: { hogarActivo: hogar } })}
            className={styles.botonVolver}
          >
            <ArrowLeft size={18} /> Volver al Panel
          </button>

          <header className={styles.cabecera}>
            <h1 className={styles.tituloPrincipal}>Asignar Tarea</h1>
            <p className={styles.subtituloPrincipal}>Organiza las labores en <strong>{hogar.nombre}</strong></p>
          </header>

          <div className={`tarjeta-cristal ${styles.tarjetaFormulario}`}>
            <form className={styles.formTarea} onSubmit={manejarEnvio}>
              
              {/* TÍTULO */}
              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><CheckSquare size={18}/> Título de la tarea</label>
                <input 
                  type="text" 
                  className={styles.inputEstilo} 
                  placeholder="Ej: Fregar platos, Limpiar el salón..."
                  required
                  value={tarea.titulo}
                  onChange={(e) => setTarea({...tarea, titulo: e.target.value})}
                />
              </div>

              {/* ASIGNAR A*/}
              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><User size={18}/> Responsable</label>
                <select 
                  className={styles.selectEstilo}
                  required
                  value={tarea.asignadoA}
                  onChange={(e) => setTarea({...tarea, asignadoA: e.target.value})}
                >
                  <option value="">Selecciona un miembro...</option>
                  {miembros.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              {/* FECHA LÍMITE */}
              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><Calendar size={18}/> Fecha límite</label>
                <input 
                  type="date" 
                  className={styles.inputEstilo}
                  required
                  value={tarea.fechaLimite}
                  onChange={(e) => setTarea({...tarea, fechaLimite: e.target.value})}
                />
              </div>

              {/* PRIORIDAD */}
              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><AlertCircle size={18}/> Prioridad</label>
                <div className={styles.prioridadSelector}>
                  {['Baja', 'Media', 'Alta'].map((p) => {
                    const claseColor = styles[`btn${p}`];
                    const claseActivo = tarea.prioridad === p ? styles.activo : '';
                    
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.prioridadBtn} ${claseColor} ${claseActivo}`}
                        onClick={() => setTarea({...tarea, prioridad: p})}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><FileText size={18}/> Notas adicionales</label>
                <textarea 
                  className={styles.textareaEstilo} 
                  placeholder="Detalles sobre cómo hacer la tarea..."
                  rows="3"
                  value={tarea.descripcion}
                  onChange={(e) => setTarea({...tarea, descripcion: e.target.value})}
                />
              </div>

              <button type="submit" className={`boton-primario ${styles.botonEnviar}`}>
                <Send size={20} /> Asignar Tarea al Piso
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}