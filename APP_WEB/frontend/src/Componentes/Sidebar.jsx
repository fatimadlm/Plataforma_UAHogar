import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Calendar, MessageSquare, Bell, User, LogOut, Shield } from 'lucide-react';
import { useSesion } from '../Seguridad/ContextoSesion';
import { getContadorNoLeidas } from '../Servicios/PeticionTarea';
import logo from '../assets/logo.png';

export default function Sidebar({ paginaActiva }) {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useSesion();
  const [noLeidas, setNoLeidas] = useState(0);

  // Consulta el contador cada 30 segundos
  useEffect(() => {
    if (!usuario?.id) return;

    const cargar = async () => {
      try {
        const datos = await getContadorNoLeidas(usuario.id);
        setNoLeidas(datos.count || 0);
      } catch {
        setNoLeidas(0);
      }
    };

    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  // Al entrar a notificaciones, reseteamos el contador 
  useEffect(() => {
    if (paginaActiva === 'notificaciones') setNoLeidas(0);
  }, [paginaActiva]);

  // Borra el token y el usuario guardados, y vuelve a la portada
  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
  };

  const menuItems = [
    { id: 'feed',           nombre: 'Feed',            icono: Home,          ruta: '/feed' },
    { id: 'hogares',        nombre: 'Hogares',         icono: Building2,     ruta: '/phogares' },
    { id: 'calendario',     nombre: 'Calendario',      icono: Calendar,      ruta: '/calendario' },
    { id: 'mensajes',       nombre: 'Mensajes',        icono: MessageSquare, ruta: '/mensajes' },
    { id: 'notificaciones', nombre: 'Notificaciones',  icono: Bell,          ruta: '/notificaciones' },
    { id: 'perfil',         nombre: 'Mi Perfil',       icono: User,          ruta: '/perfil' },
  ];

  //Pestaña de supervisor
  if (usuario?.rolGlobal === 'SUPERVISOR') {
    menuItems.push({ id: 'supervisor', nombre: 'Supervisión', icono: Shield, ruta: '/supervisor' });
  }

  return (
    <aside className="sidebar">
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', width: '100%', cursor: 'pointer' }}
        onClick={() => navigate('/feed')}
      >
        <img src={logo} alt="Logo UAHogar" style={{ width: '140px', height: 'auto', objectFit: 'contain' }} />
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const Icono = item.icono;
          const esActiva = paginaActiva === item.id;
          const esBell = item.id === 'notificaciones';

          return (
            <div
              key={item.id}
              className={`nav-item ${esActiva ? 'active' : ''}`}
              onClick={() => navigate(item.ruta)}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icono size={20} color={esActiva ? '#ffffff' : '#90b4ce'} />
                {esBell && paginaActiva !== 'notificaciones' && noLeidas > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-8px',
                    background: '#e76f51', color: 'white',
                    borderRadius: '50%', width: '16px', height: '16px',
                    fontSize: '0.65rem', fontWeight: '800',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {(paginaActiva === 'notificaciones' ? 0 : noLeidas) > 9 ? '9+' : (paginaActiva === 'notificaciones' ? 0 : noLeidas)}
                  </span>
                )}
              </div>
              <span className="nav-text">{item.nombre}</span>
            </div>
          );
        })}
      </nav>

      <div className="nav-item" style={{ marginTop: 'auto', color: '#3d5a80' }} onClick={handleCerrarSesion}>
        <LogOut size={20} color="#3d5a80" />
        <span className="nav-text">Cerrar sesión</span>
      </div>
    </aside>
  );
}
