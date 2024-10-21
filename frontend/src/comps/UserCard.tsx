import React from 'react'
import { format } from 'date-fns';
import { authAndData } from '../hooks n custom funcs/authAndData'
import { useGeneralContext } from '../context/GeneralContext'
import { Vacation } from '../../../types';
import { FaCalendarAlt, FaDollarSign, FaImage } from 'react-icons/fa';

export default function UserCards({ vacation, totalFollowers, isUserFollowingVacation }: { vacation: Vacation, totalFollowrs: number, isUserFollowingVacation: boolean }) {
  const { userId } = useGeneralContext()

  const updateFollow = async () => {
    const { role } = await authAndData('none')
    if (role === 'user') {
      const res = await fetch('http://localhost:3000/vacations/updateFollow', {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({ vacationId: vacation.vacation_id, userId: userId.current })
      })
  
      if (!res) {
        const errorData = await res.json()
        throw new Error(`Error in fetching data: ${errorData || 'unknown error'}`);
      } else {
        window.location.reload()
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div>this card has {totalFollowers} followers</div>
      <div>the current user is {!isUserFollowingVacation && ('not')} following this vacation</div>
      <button onClick={updateFollow}>click here to follow/unfollow</button>
      <div className="relative">
        {vacation.image_path ? (
          <img src={vacation.image_path} alt={vacation.destination} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <FaImage className="text-gray-400 text-5xl" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">{vacation.destination}</h2>
        <p className="text-gray-600 mb-2 line-clamp-2">{vacation.description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <FaCalendarAlt className="mr-2" />
          <span>
            {format(new Date(vacation.starting_date), 'MMM d, yyyy')} - 
            {format(new Date(vacation.ending_date), 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center border-4 border-green-600 rounded-lg px-2 text-xl font-bold text-green-600">
            <FaDollarSign className="mr-1" />
            <span>{vacation.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}