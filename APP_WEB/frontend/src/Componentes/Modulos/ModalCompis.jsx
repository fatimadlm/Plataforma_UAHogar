import styles from './ModalCompis.module.css';
import { API_URL } from '../../Configuracion/apiConfig';

export default function ModalCompis({ isOpen, onClose, compis, onNavigate }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalFondo} onClick={onClose}>
      <div className={styles.modalTarjeta} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.tituloModal}>Tus Compis</h2>

        <div className={styles.gridCompis}>
          {compis.length > 0 ? (
            compis.map((c) => (
              <div key={c.id} style={{ textAlign: 'center' }}>
                <div className={styles.avatarCompi} onClick={() => onNavigate(c.id)}>
                  <img
                    src={c.imagenPerfil.startsWith('http') ? c.imagenPerfil : `${API_URL}${c.imagenPerfil}`}
                    alt={c.nombre}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerText = c.nombre.charAt(0).toUpperCase();
                    }}
                  />
                </div>
                <p className={styles.nombreCompi}>{c.nombre}</p>
              </div>
            ))
          ) : (
            <p className={styles.sinCompis}>Aún no tienes compis.</p>
          )}
        </div>

        <button className={styles.botonCerrar} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}