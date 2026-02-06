import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Registration from './pages/Registration'
import Dashboard from './pages/Dashboard'

function App() {
  const { session, registrationComplete, loading, refresh, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-800 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        <p className="text-white/90 font-medium">Loading…</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Login: only accessible when NOT logged in */}
      <Route
        path="/login"
        element={
          !session
            ? <Login onLogin={refresh} />
            : registrationComplete
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/registration" replace />
        }
      />

      {/* Registration: only accessible when logged in and NOT registered */}
      <Route
        path="/registration"
        element={
          !session
            ? <Navigate to="/login" replace />
            : registrationComplete
              ? <Navigate to="/dashboard" replace />
              : <Registration session={session} onComplete={refresh} onSignOut={signOut} />
        }
      />

      {/* Dashboard: only accessible when logged in and registered */}
      <Route
        path="/dashboard"
        element={
          !session
            ? <Navigate to="/login" replace />
            : !registrationComplete
              ? <Navigate to="/registration" replace />
              : <Dashboard session={session} onSignOut={signOut} />
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
