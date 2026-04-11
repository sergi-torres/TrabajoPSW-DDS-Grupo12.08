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
import "./components/organizator_dashboard/Dashboard.css"
import VotosPage from './pages/VotosPage'
import DashboardVotacionCategorias from './pages/DashboardVotacionCategorias'

function App() {

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas Protegidas (Requieren Login) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/eventos" element={<DashboardPage />} />
              <Route path="/votos" element={<VotosPage />} />
              <Route path="/dashboard-votacion-categorias" element={<DashboardVotacionCategorias />} />
            </Route>

            <Route path="/organizador-dashboard/:eventoId" element={<OrganizerDashboard />} />
            <Route path="/organizador-dashboard" element={<OrganizerDashboard />} />
            {/* Redireccion login default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Fallback 404 para cualquier ruta no definida */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}


export default App
