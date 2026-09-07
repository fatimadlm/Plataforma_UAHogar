import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Componentes/Sidebar';
import { useSesion } from '../Seguridad/ContextoSesion';
import { ArrowLeft, User, AtSign, Mail, Phone, Save, Camera, Trash2, Lock, Key } from 'lucide-react';
import styles from './EditarPerfil.module.css';
import { actualizarPerfilUsuario, subirImagenPerfil, eliminarImagenPerfil, obtenerUrlImagenSas } from '../Servicios/PeticionTarea';
import { telefonoRegex } from '../Seguridad/Validaciones';

const obtenerUrlImagen = async (imagenPerfil) => {
  if (!imagenPerfil || imagenPerfil.includes('ui-avatars.com')) return null;

  if (
    imagenPerfil.startsWith('http://') ||
    imagenPerfil.startsWith('https://') ||
    imagenPerfil.startsWith('blob:')
  ) {
    return imagenPerfil;
  }

  try {
    return await obtenerUrlImagenSas(imagenPerfil);
  } catch {
    return null;
  }
};

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { usuario, iniciarSesion } = useSesion(); 
  const inputArchivoRef = useRef(null);

  const [formData, setFormData] = useState(() => ({
    nombre: usuario?.nombre || '',
    usuario: usuario?.usuario || '',
    email: usuario?.email || '',
    telefono: usuario?.telefono || ''
  }));
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });
  const [imagenPrevia, setImagenPrevia] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [imagenError, setImagenError] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarImagen = async () => {
      const url = await obtenerUrlImagen(usuario?.imagenPerfil);
      if (activo) {
        setImagenPrevia(url);
        setImagenError(false);
      }
    };

    cargarImagen();

    return () => {
      activo = false;
    };
  }, [usuario?.imagenPerfil]);

  const manejarErrorImagen = () => {
    setImagenError(true);
  };

  const inicialUsuario = formData.nombre ? formData.nombre.trim().charAt(0).toUpperCase() : 'U';
  const mostrarImagen = Boolean(imagenPrevia && !imagenError);

  const manejarCambioImagen = (e) => {
    const file = e.target.files[0];

    if (file) {
      setArchivoImagen(file);
      setImagenPrevia(URL.createObjectURL(file));
      setImagenError(false);
    }
  };

  const manejarBorrarImagen = async () => {
    if (!usuario?.imagenPerfil || !mostrarImagen) return;

    if (!window.confirm('¿Quieres eliminar tu foto de perfil?')) return;

    try {
      setMensaje({ texto: 'Eliminando foto...', tipo: 'info' });
      await eliminarImagenPerfil();

      const usuarioSinImagen = { ...usuario, imagenPerfil: null };
      iniciarSesion(usuarioSinImagen);
      setImagenPrevia(null);
      setArchivoImagen(null);
      setImagenError(false);

      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = '';
      }

      setMensaje({ texto: 'Foto de perfil eliminada.', tipo: 'exito' });
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' });
    }
  };

  const manejarGuardado = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Guardando...', tipo: 'info' });

    const telefonoLimpio = formData.telefono.replace(/\s+/g, '');
    if (!telefonoRegex.test(telefonoLimpio)) {
      setMensaje({ texto: 'Teléfono inválido. Usa prefijo (ej. +34).', tipo: 'error' });
      return;
    }

    if (passwords.nueva !== '') {
      if (passwords.actual === '') {
        setMensaje({ texto: 'Debes introducir tu contraseña actual.', tipo: 'error' });
        return;
      }
      if (passwords.nueva.length < 8) {
        setMensaje({ texto: 'La nueva contraseña debe tener al menos 8 caracteres.', tipo: 'error' });
        return;
      }
      if (passwords.nueva !== passwords.confirmar) {
        setMensaje({ texto: 'Las contraseñas nuevas no coinciden.', tipo: 'error' });
        return;
      }
    }

    try {
      let urlNuevaImagen = usuario.imagenPerfil?.includes('ui-avatars.com') ? null : usuario.imagenPerfil;
      if (archivoImagen) {
        urlNuevaImagen = await subirImagenPerfil(archivoImagen);
      }

      const datosActualizados = {
        ...formData,
        telefono: telefonoLimpio,
        imagenPerfil: urlNuevaImagen,
        contrasenaActual: passwords.actual,
        nuevaContrasena: passwords.nueva
      };

      const usuarioActualizado = await actualizarPerfilUsuario(usuario.id, datosActualizados);
      iniciarSesion(usuarioActualizado); 
      
      setArchivoImagen(null);
      setMensaje({ texto: '¡Perfil actualizado!', tipo: 'exito' });
      setTimeout(() => navigate('/perfil'), 2000);

    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' });
    }
  };

  const obtenerClaseMensaje = () => {
    if (mensaje.tipo === 'error') return styles.mensajeError;
    if (mensaje.tipo === 'exito') return styles.mensajeExito;
    return styles.mensajeInfo;
  };

  return (
    <div className="pantalla-dividida">
      <Sidebar paginaActiva="perfil" />
      <main className={`main-content ${styles.mainCentrado}`}>
        <div className={styles.contenedorFormulario}>
          <button onClick={() => navigate('/perfil')} className={styles.botonVolver}>
            <ArrowLeft size={18} /> Volver a mi perfil
          </button>

          <div className={`tarjeta-cristal ${styles.tarjetaFormulario}`}>
            {mensaje.texto && (
              <div className={`${styles.mensajeAlerta} ${obtenerClaseMensaje()}`}>
                {mensaje.texto}
              </div>
            )}

            <div className={styles.avatarEditarContenedor}>
              <div className={styles.avatarCirculo}>
                {mostrarImagen ? (
                  <img src={imagenPrevia} alt="Foto de perfil" onError={manejarErrorImagen} className={styles.imagenPerfilEditar} />
                ) : (
                  <span className={styles.inicialPerfilEditar}>{inicialUsuario}</span>
                )}

                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/gif" 
                  ref={inputArchivoRef} 
                  className={styles.inputImagenOculto} 
                  onChange={manejarCambioImagen} 
                />
                <button 
                  type="button" 
                  className={styles.btnCambiarFoto} 
                  onClick={() => inputArchivoRef.current?.click()} 
                  title="Cambiar foto de perfil"
                >
                  <Camera size={18} strokeWidth={2.5} />
                </button>

                {mostrarImagen && usuario?.imagenPerfil && (
                  <button
                    type="button"
                    className={styles.btnBorrarFoto}
                    onClick={manejarBorrarImagen}
                    title="Eliminar foto de perfil"
                  >
                    <Trash2 size={17} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            <form className={styles.formEditar} onSubmit={manejarGuardado}>
              <h3 className={styles.seccionTitulo}>Datos Personales</h3>
              
              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><User size={18}/> Nombre completo</label>
                <input 
                  type="text" 
                  className={styles.inputEstilo} 
                  required 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                />
              </div>

              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><AtSign size={18}/> Nombre de usuario</label>
                <input 
                  type="text" 
                  className={styles.inputEstilo} 
                  required 
                  value={formData.usuario} 
                  onChange={(e) => setFormData({...formData, usuario: e.target.value})} 
                />
              </div>

              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><Mail size={18}/> Correo electrónico</label>
                <input 
                  type="email" 
                  className={styles.inputEstilo} 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><Phone size={18}/> Teléfono</label>
                <input 
                  type="tel" 
                  className={styles.inputEstilo} 
                  value={formData.telefono} 
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                />
              </div>

              <h3 className={`${styles.seccionTitulo} ${styles.seccionSeguridad}`}>Seguridad</h3>
              
              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><Lock size={18}/> Contraseña Actual</label>
                <input 
                  type="password" 
                  className={styles.inputEstilo} 
                  placeholder="Requerida para cambiar" 
                  value={passwords.actual} 
                  onChange={(e) => setPasswords({...passwords, actual: e.target.value})} 
                />
              </div>

              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><Key size={18}/> Nueva Contraseña</label>
                <input 
                  type="password" 
                  className={styles.inputEstilo} 
                  placeholder="Mínimo 8 caracteres" 
                  value={passwords.nueva} 
                  onChange={(e) => setPasswords({...passwords, nueva: e.target.value})} 
                />
              </div>

              <div className={styles.campoGrupo}>
                <label className={styles.labelEstilo}><Key size={18}/> Confirmar Contraseña</label>
                <input 
                  type="password" 
                  className={styles.inputEstilo} 
                  value={passwords.confirmar} 
                  onChange={(e) => setPasswords({...passwords, confirmar: e.target.value})} 
                />
              </div>

              <button type="submit" className={`boton-primario ${styles.botonGuardar}`}>
                <Save size={20} /> Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}