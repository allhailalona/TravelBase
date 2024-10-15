import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import RegisterationPage from './pages/RegisterationPage'
import VacationsPage from './pages/VacationsPage'

export default function App(): JSX.Element {
  return (
    <div className='w-screen h-screen flex flex-row'>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path='/login' element={<LoginPage />}/>
          <Route path='/register' element={<RegisterationPage />} />
          <Route path='/vacations' element={<VacationsPage />} />
        </Routes>
      </Router>
    </div>
  )
}