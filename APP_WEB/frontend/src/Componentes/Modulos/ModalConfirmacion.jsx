import { X } from 'lucide-react';
import styles from './ModalConfirmacion.module.css';

// Modal de confirmación 
export default function ModalConfirmacion({ titulo, texto, procesando, onCancelar, onConfirmar }) {
  return (
    <div className="modal-overlay" onClick={() => !procesando && onCancelar()}>
      <div className="tarjeta-cristal modal-contenido" onClick={e => e.stopPropagation()}>
        <button className="btn-cerrar-modal" onClick={onCancelar} disabled={procesando}>
          <X size={20} strokeWidth={2.5} />
        </button>

        <h2 className={styles.modalTitulo}>{titulo}</h2>
        <p className={styles.modalTexto}>{texto}</p>

        <div className={styles.modalAcciones}>
          <button className={styles.btnCancelar} onClick={onCancelar} disabled={procesando}>
            Cancelar
          </button>

          <button className={styles.btnConfirmarPeligro} onClick={onConfirmar} disabled={procesando}>
            {procesando ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
