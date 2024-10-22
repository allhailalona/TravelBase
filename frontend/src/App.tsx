import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";
import ImagesSlide from "./comps/ImagesSlide";
import VacationsPage from "./pages/VacationsPage";
import VacationFormMainLogic from "./comps/AddOrEditForm/VacationFormMainLogic";
import FollowersStats from "./comps/FollowersStats";
import { convertBufferToBase64 } from './hooks n custom funcs/imageUtils'

export default function App(): JSX.Element {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const helperFunc = async () => {
      const res = await fetch('http://localhost:3000/fetch-all-images', {method: 'GET'})

      if (!res) {
        const errorData = await res.json()
        throw new Error (`Error in useEffect helperFunc fetch all images App.tsx ${errorData}`)
      }

      const data = await res.json()
      
      // Convert each item in array to Base64
      const final = data.map(item => convertBufferToBase64(item.data))
      setImages(final)
    }

    helperFunc()
  }, [])

  return (
    <div className="w-screen h-screen relative bg-gray-800">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={
              <div className="relative w-full h-full">
                <div className="absolute inset-0 z-0">
                  <ImagesSlide images={images} />
                </div>
                <LoginPage className="relative z-10" />
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="relative w-full h-full">
                <div className="absolute inset-0 z-0">
                  <ImagesSlide images={images} />
                </div>
                <RegisterationPage className="relative z-10" />
              </div>
            }
          />
          <Route path="/vacations/fetch" element={<VacationsPage />} />
          <Route path="/vacations/add" element={<VacationFormMainLogic />} />
          <Route
            path="/vacations/edit/:id"
            element={<VacationFormMainLogic />}
          />
          <Route path="/vacations/stats" element={<FollowersStats />} />
        </Routes>
      </Router>
    </div>
  );
}
