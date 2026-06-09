import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import PlanPage from '@/pages/PlanPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/plan" element={<PlanPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
