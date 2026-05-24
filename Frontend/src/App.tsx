import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { EventProvider } from './context/EventContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'
import CreateEvent from './pages/CreateEvent'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import OrganizerDashboard from './pages/OrganizerDashboard'
import VotosPage from './pages/VotosPage'
import DashboardVotacionCategorias from './pages/DashboardVotacionCategorias'
import InvitarJuradoPage from './pages/InvitarJuradoPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import ParticipantRegister from './pages/ParticipantRegister'
import { VotingProvider } from "./context/VotingContext";
import CreateProject from './pages/CreateProject'
import ProjectPage from './pages/ProjectPage'
import Avisos from './pages/Avisos'
import Configuraciones from './pages/Configuraciones'
import ControlVotacionesPage from './pages/ControlVotacionesPage'
import EditarProyectoPage from './pages/EditarProyectoPage'
import AsignarPremios from './pages/AsignarPremiosPage'
import ProfilePage from './pages/ProfilePage'
import HelpPage from './pages/HelpPage'

function BodyCleanup() {
  const location = useLocation();
  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    document.documentElement.style.overflow = '';
  }, [location.pathname]);
  return null;
}

function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <AuthProvider>
        <EventProvider>
         <VotingProvider>
          <BrowserRouter>
            <BodyCleanup />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/accept-invite" element={<AcceptInvitePage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/eventos" element={<DashboardPage />} />
                <Route path="/ayuda" element={<HelpPage />} />
                
                {/* Rutas de Evento */}
                <Route path="/eventos/:eventoId" element={<OrganizerDashboard />} />

                <Route path="/eventos/:eventoId/configuraciones" element={<Configuraciones />} />
                <Route path="/eventos/:eventoId/control-estados" element={<ControlVotacionesPage />} />
                <Route path="/eventos/:eventoId/ajustes" element={<CreateEvent />} />
                <Route path="/eventos/:eventoId/jurado" element={<InvitarJuradoPage />} />
                <Route path="/eventos/:eventoId/votar" element={<DashboardVotacionCategorias />} />
                <Route path="/eventos/:eventoId/ranking" element={<DashboardVotacionCategorias />} />
                <Route path="/eventos/:eventoId/proyectos" element={<ProjectPage />} />
                <Route path="/eventos/:eventoId/my-project" element={<VotosPage />} />
                <Route path="/eventos/:eventoId/participantRegister" element={<ParticipantRegister />} />
                <Route path="/editar-proyecto/:proyectoId" element={<EditarProyectoPage />} />
                <Route path="/eventos/:eventoId/premios" element={<AsignarPremios />} />
                
                <Route path="/participantRegister" element={<ParticipantRegister />} />
                <Route path="/create-project" element={<CreateProject />} />

                <Route path="/avisos" element={<Avisos />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
         </VotingProvider>
        </EventProvider>
      </AuthProvider>
    </>
  )
}

export default App
