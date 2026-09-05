import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { eliminarMiCuenta } from '../../Servicios/PeticionTarea';
import styles from './ModalEliminarCuenta.module.css';

export default function ModalEliminarCuenta({ onCancelar, onConfirmado }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const confirmar = async () => {
    if (!password.trim()) {
      setError('Introduce tu contraseña para confirmar.');
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      const mensaje = await eliminarMiCuenta(password);
      onConfirmado(mensaje);
    } catch (err) {
      setError(err.message);
      setProcesando(false);
    }
  };

  const contenidoModal = (
    <div className="modal-overlay" onClick={() => !procesando && onCancelar()}>
      <div className="tarjeta-cristal modal-contenido" onClick={e => e.stopPropagation()}>
        <button className="btn-cerrar-modal" onClick={onCancelar} disabled={procesando}>
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className={styles.iconoAviso}>
          <AlertTriangle size={28} color="#ef476f" />
        </div>

        <h2 className={styles.titulo}>¿Eliminar tu cuenta?</h2>
        <p className={styles.texto}>
          Esta acción es irreversible. Perderás el acceso a tu perfil, tus
          puntos y tu historial. Introduce tu contraseña actual para confirmar.
        </p>

        <input
          type="password"
          className={styles.inputPassword}
          placeholder="Tu contraseña actual"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={procesando}
          autoFocus
        />

        {error && <p className={styles.mensajeError}>{error}</p>}

        <div className={styles.acciones}>
          <button className={styles.btnCancelar} onClick={onCancelar} disabled={procesando}>
            Cancelar
          </button>
          <button className={styles.btnEliminar} onClick={confirmar} disabled={procesando}>
            {procesando ? 'Eliminando...' : 'Eliminar definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(contenidoModal, document.body);
}