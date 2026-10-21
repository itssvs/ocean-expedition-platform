import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Vessels from './pages/Vessels'
import Equipment from './pages/Equipment'
import Stations from './pages/Stations'
import Expeditions from './pages/Expeditions'
import MapView from './pages/MapView'
import Analytics from './pages/Analytics'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="expeditions" element={<Expeditions />} />
        <Route path="vessels" element={<Vessels />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="stations" element={<Stations />} />
        <Route path="map" element={<MapView />} />
        <Route
          path="analytics"
          element={
            <ProtectedRoute roles={['admin', 'scientist']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
