import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './Estilos/global.css';

// Importamos las pantallas
import Bienvenida from './Paginas/Bienvenida';
import Login from './Paginas/Login';
import Registro from './Paginas/Registro'; 
import Feed from './Paginas/Feed';
import Calendario from './Paginas/Calendario';
import PHogares from './Paginas/PHogares';
import Mensajes from './Paginas/Mensajes';
import Notificaciones from './Paginas/Notificaciones'; 
import Perfil from './Paginas/Perfil'; 
import PCrearHogar from './Paginas/PCrearHogar'; 
import PUnirseHogar from './Paginas/PUniseHogar'; 
import PanelHogar from './Paginas/PanelHogar';
import CalendarioHogar from './Paginas/CalendarioHogar';
import PAsignarTarea from './Paginas/PAsignarTarea';
import FeedHogar from './Paginas/FeedHogar';
import EditarPerfil from './Paginas/EditarPerfil';
import PerfilAjeno from './Paginas/PerfilAjeno';
//Importamos componentes de seguridad(sesion abierta y rutas protegidas)
import RankingHogar from './Paginas/RankingHogar';
import IncidenciaHogar from './Paginas/IncidenciaHogar';
import MisIncidencias from './Paginas/MisIncidencias';
import DetalleIncidencia from './Paginas/DetalleIncidencia';
import DetalleIntercambio from './Paginas/DetalleIntercambio';
import RutaProtegida from './Seguridad/RutaProtegida';
import RutaSupervisor from './Seguridad/RutaSupervisor';
import { ProveedorSesion } from './Seguridad/ContextoSesion';
//Importamos los servicios(Para las peticiones)
import './Servicios/PeticionTarea.js';
//Super usuario supervisor
import PanelSupervisor from './Paginas/PanelSupervisor';

export default function App() {
  return (
    <ProveedorSesion>
    <BrowserRouter>
      {/* FONDO */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <div className="fondo-burbuja burbuja-1" />
        <div className="fondo-burbuja burbuja-2" />
        <div className="fondo-burbuja burbuja-3" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        <Routes>
          {/*Rutas publicas*/}
          <Route path="/" element={<Bienvenida />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          {/* RUTAS PRIVADAS */}
          <Route path="/feed" element={<RutaProtegida><Feed /></RutaProtegida>} />
          <Route path="/calendario" element={<RutaProtegida><Calendario /></RutaProtegida>} />
          <Route path="/phogares" element={<RutaProtegida><PHogares /></RutaProtegida>} />
          <Route path="/mensajes" element={<RutaProtegida><Mensajes /></RutaProtegida>} />
          <Route path="/notificaciones" element={<RutaProtegida><Notificaciones /></RutaProtegida>} />
          <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
          <Route path="/perfil-ajeno/:id" element={<RutaProtegida><PerfilAjeno /></RutaProtegida>} />
          <Route path="/editarperfil" element={<RutaProtegida><EditarPerfil /></RutaProtegida>} />

          <Route path="/pcrearhogar" element={<RutaProtegida><PCrearHogar /></RutaProtegida>} />
          <Route path="/punirsehogar" element={<RutaProtegida><PUnirseHogar /></RutaProtegida>} />
          <Route path="/panelhogar" element={<RutaProtegida><PanelHogar /></RutaProtegida>} />
          <Route path="/calendariohogar" element={<RutaProtegida><CalendarioHogar /></RutaProtegida>} />
          <Route path="/pasignartarea" element={<RutaProtegida><PAsignarTarea /></RutaProtegida>} />
          <Route path="/feedhogar" element={<RutaProtegida><FeedHogar /></RutaProtegida>} />
          <Route path="/rankinghogar" element={<RutaProtegida><RankingHogar /></RutaProtegida>} />
          <Route path="/incidenciahogar" element={<RutaProtegida><IncidenciaHogar /></RutaProtegida>} />
          <Route path="/misincidencias" element={<RutaProtegida><MisIncidencias /></RutaProtegida>} />
          <Route path="/incidencias/:id" element={<RutaProtegida><DetalleIncidencia /></RutaProtegida>} />
          <Route path="/intercambios/:id" element={<RutaProtegida><DetalleIntercambio /></RutaProtegida>} />
          <Route path="/supervisor" element={<RutaSupervisor><PanelSupervisor /></RutaSupervisor>} />
        </Routes>
      </div>

    </BrowserRouter>
    </ProveedorSesion>
  );
}