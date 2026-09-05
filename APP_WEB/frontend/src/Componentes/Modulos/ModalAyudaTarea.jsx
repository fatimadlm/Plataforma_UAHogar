import { FileText, Info, Lightbulb, Loader2, RotateCcw, ShieldAlert, ShoppingBasket, X } from 'lucide-react';
import styles from './ModalAyudaTarea.module.css';

export default function ModalAyudaTarea({ tarea, ayuda, cargando, error, onCerrar, onRegenerar }) {

  // Muestra el modal de ayuda
  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Cabecera del modal */}
        <div className={styles.header}>
          <div className={styles.titulo}>
            <div className={styles.icono}>
              <Lightbulb size={21} />
            </div>

            <div>
              <span className={styles.etiqueta}>¿Necesitas ayuda en esta tarea?</span>
              <h2>{tarea.nombre}</h2>
            </div>
          </div>

          <button
            className={styles.cerrar}
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.contenido}>

          {/* Aviso sobre la respuesta*/}
          <div className={styles.aviso}>
            <Info size={17} />
            <p>
             Comprueba las recomendaciones antes de utilizarlas, esta información es generada por IA puede contener errores.
            </p>
          </div>

          {/*estado de carga */}
          {cargando && (
            <div className={styles.cargando}>
              <Loader2
                size={30}
                className={styles.iconoCargando}
              />
              <p>
                {ayuda
                  ? 'Generando una nueva recomendación...'
                  : 'Preparando una recomendación para esta tarea...'}
              </p>
            </div>
          )}

          {/*errores */}
          {error && !cargando && (
            <div className={styles.error}>
              <ShieldAlert size={22} />
              <p>{error}</p>
            </div>
          )}

          {/*Consejo*/}
          {ayuda && !cargando && (
            <>
              {ayuda.consejo && (
                <section className={styles.seccionPrincipal}>
                  <div className={styles.seccionTitulo}>
                    <Lightbulb size={18} />
                    <h3>Consejo</h3>
                  </div>

                  <p>{ayuda.consejo}</p>
                </section>
              )}

              {ayuda.pasos?.length > 0 && (
                <section className={styles.seccion}>
                  <div className={styles.seccionTitulo}>
                    <FileText size={18} />
                    <h3>Cómo hacerlo</h3>
                  </div>

                  <ol className={styles.lista}>
                    {ayuda.pasos.map((paso, index) => (
                      <li key={index}>
                        <span>{index + 1}</span>
                        <p>{paso}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {ayuda.productosRecomendados?.length > 0 && (
                <section className={styles.seccion}>
                  <div className={styles.seccionTitulo}>
                    <ShoppingBasket size={18} />
                    <h3>Productos y materiales</h3>
                  </div>

                  <ul className={styles.productos}>
                    {ayuda.productosRecomendados.map((producto, index) => (
                      <li key={index}>{producto}</li>
                    ))}
                  </ul>
                </section>
              )}

              {ayuda.precauciones?.length > 0 && (
                <section className={styles.seccionPrecauciones}>
                  <div className={styles.seccionTitulo}>
                    <ShieldAlert size={18} />
                    <h3>Precauciones</h3>
                  </div>

                  <ul className={styles.lista}>
                    {ayuda.precauciones.map((precaucion, index) => (
                      <li key={index}>
                        <span>
                          <ShieldAlert size={13} />
                        </span>
                        <p>{precaucion}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Permite generar otro consejo */}
              <button
                className={styles.regenerar}
                onClick={onRegenerar}
                disabled={cargando}
              >
                <RotateCcw size={16} />
                Regenerar consejo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}