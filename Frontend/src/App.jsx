import DashboardVotacionCategorias from './pages/DashboardVotacionCategorias';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import './App.css'

function App() {

  return (
    <>
      <Toaster position="top-right" richColors />
      <DashboardVotacionCategorias />
    </>
  );

  //!Lo de aajo no se ejecutará

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Default redirect to login for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App

