import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import RegisterationPage from './pages/RegisterationPage'
import VacationsPage from './pages/VacationsPage'
import AddOrEditVacationForm from './comps/AddOrEditVacationForm'

export default function App(): JSX.Element {
  return (
    <div className='w-screen h-screen flex flex-row'>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path='/login' element={<LoginPage />}/>
          <Route path='/register' element={<RegisterationPage />} />
          <Route path='/vacations/fetch' element={<VacationsPage />} />
          <Route path='/vacations/add' element={<AddOrEditVacationForm />} />
          <Route path='/vacations/edit/:id' element={<AddOrEditVacationForm />} />
        </Routes>
      </Router>
    </div>
  )
}