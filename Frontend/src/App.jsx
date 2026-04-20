import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
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

function App() {

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/eventos" element={<DashboardPage />} />
              <Route path="/eventos/:eventoId" element={<OrganizerDashboard />} />
              <Route path="/eventos/:eventoId/jurado" element={<InvitarJuradoPage />} />
              <Route path="/eventos/:eventoId/ranking" element={<DashboardVotacionCategorias />} />
              <Route path="/votos" element={<VotosPage />} />
              <Route path="/dashboard-votacion-categorias" element={<DashboardVotacionCategorias />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}


export default App
