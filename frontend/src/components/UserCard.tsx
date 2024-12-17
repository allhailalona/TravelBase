import React from "react";
import { format } from "date-fns";
import { convertBufferToBase64 } from '../hooks n custom funcs/imageUtils'
import { useGeneralContext } from "../context/GeneralContext";
import { Vacation } from "../../../types";
import { FaCalendarAlt, FaDollarSign, FaImage, FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import "../index.css";

export default function UserCards({
  vacation,
  totalFollowers,
  isUserFollowingVacation,
}: {
  vacation: Vacation;
  totalFollowrs: number;
  isUserFollowingVacation: boolean;
}) {
  const { userId } = useGeneralContext();

  const updateFollow = async () => {
    try {
      await fetch("http://localhost:3000/vacations/updateFollow", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _at: localStorage.getItem('accessToken'),
          _rt: localStorage.getItem('refreshToken'),
          vacationId: vacation.vacation_id,
          userId: userId.current,
        }),
      });
  
      window.location.reload();
    } catch (err) {
      console.error('error in UserCard updateFollow fetch request', err)
      throw err // Stop execution
    }

  };

  const dataUrl = convertBufferToBase64(vacation.image_path.data)

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl w-full max-w-sm
                hover:shadow-2xl hover:scale-[1.02] hover:shadow-indigo-500/10
                transition-all duration-300 cursor-pointer">
      <div className="relative">
        <div
          onClick={updateFollow}
          className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-5 py-2.5 rounded-full 
                   flex items-center gap-3 cursor-pointer hover:bg-black/70 transition-all duration-200"
        >
          {isUserFollowingVacation ? (
            <FaHeart className="text-red-500" size={20} />
          ) : (
            <FaRegHeart className="text-white" size={20} />
          )}
          <span className="text-white text-lg font-medium">{totalFollowers}</span>
        </div>
  
        {vacation.image_path.type === "Buffer" ? (
          <img
            src={dataUrl}
            alt={vacation.destination}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-52 bg-gray-800 flex items-center justify-center">
            <FaImage className="text-gray-600 text-6xl" />
          </div>
        )}
      </div>
  
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4">
        <div className="flex items-center justify-center text-gray-200 gap-2">
          <FaCalendarAlt size={16} />
          <span className="text-base font-bold tracking-wide">
            {format(new Date(vacation.starting_date), "MMM d, yyyy")} -
            {format(new Date(vacation.ending_date), "MMM d, yyyy")}
          </span>
        </div>
      </div>
  
      <div className="p-6 bg-gray-900">
        <h2 className="text-2xl font-bold text-white mb-4">
          {vacation.destination}
        </h2>
        <p className="text-gray-300 text-lg line-clamp-2 mb-6">
          {vacation.description}
        </p>
        
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500
                        text-white px-8 py-3 rounded-xl
                        flex items-center gap-2 font-bold 
                        shadow-[0_0_20px_rgba(16,185,129,0.15)]
                        hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]
                        hover:from-emerald-500 hover:to-teal-400
                        transition-all duration-300 ring-1 ring-emerald-400/50">
            <FaDollarSign size={22} className="text-emerald-200" />
            <span className="text-2xl">{vacation.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
