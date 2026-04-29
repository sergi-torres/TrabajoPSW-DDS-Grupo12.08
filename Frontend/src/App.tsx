import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import ConfigTiempoVotacionPage from './pages/ConfigTiempoVotacion'
import ControlVotacionesPage from './pages/ControlVotacionesPage'

function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <AuthProvider>
        <EventProvider>
         <VotingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/accept-invite" element={<AcceptInvitePage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/eventos" element={<DashboardPage />} />
                
                {/* Rutas de Evento */}
                <Route path="/eventos/:eventoId" element={<OrganizerDashboard />} />
                <Route path="/eventos/:eventoId/configuraciones" element={<ConfigTiempoVotacionPage />} />
                <Route path="/eventos/:eventoId/control-estados" element={<ControlVotacionesPage />} />
                <Route path="/eventos/:eventoId/ajustes" element={<CreateEvent />} />
                <Route path="/eventos/:eventoId/jurado" element={<InvitarJuradoPage />} />
                <Route path="/eventos/:eventoId/votar" element={<DashboardVotacionCategorias />} />
                <Route path="/eventos/:eventoId/ranking" element={<DashboardVotacionCategorias />} />
                <Route path="/eventos/:eventoId/proyectos" element={<VotosPage />} />
                <Route path="/eventos/:eventoId/my-project" element={<VotosPage />} />
                <Route path="/eventos/:eventoId/participantRegister" element={<ParticipantRegister />} />
                
                <Route path="/participantRegister" element={<ParticipantRegister />} />
                <Route path="/create-project" element={<CreateProject />} />
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
