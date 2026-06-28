import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import PlanPage from '@/pages/PlanPage'
import LinesPage from '@/pages/LinesPage'
import LineDetailPage from '@/pages/LineDetailPage'
import StopsPage from '@/pages/StopsPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/plan" element={<PlanPage />} />
      <Route path="/lines" element={<LinesPage />} />
      <Route path="/lines/:id" element={<LineDetailPage />} />
      <Route path="/stops" element={<StopsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
