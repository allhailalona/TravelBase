import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'
import { authAndData } from '../hooks n custom funcs/authAndData'
import { Vacation } from '../../types';
import { message, Popconfirm } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FaCalendarAlt, FaDollarSign, FaImage, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

export default function AdminCards({ vacation }: { vacation: Vacation }) {
  const navigate = useNavigate()
  
  const deleteCard = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Add this line
    const { role } = await authAndData('none')
    if (role === 'admin') {
      console.log('fuck')
      const res = await fetch('http://localhost:3000/vacations/delete', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: vacation.vacation_id })
      })
  
      if (!res.ok) {
        const errorData = res.json()
        message.error(`Error while deleting vacation: ${errorData}`)
        throw new Error (
          `Error while delete vacation: ${errorData}`
        )
      }
  
      message.success('Successfully deleted vacation! Refreshing page...')
      window.location.reload(true)
    }
  }

  const editCard = () => {
    navigate(`/vacations/edit/${vacation.vacation_id}`);
  };

  // Convert Buffer to base64 string
  const base64String = btoa(String.fromCharCode.apply(null, vacation.image_path.data));

  // Create data URL
  const dataUrl = `data:image/jpeg;base64,${base64String}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative">
        {vacation.image_path ? (
          <img src={dataUrl} alt={vacation.destination} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <FaImage className="text-gray-400 text-5xl" />
          </div>
        )}
      <div onClick={editCard} className="absolute top-2 right-2 space-x-2">
        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300">
          <FaPencilAlt className="text-lg" />
        </button>
        <Popconfirm
          title="Are you sure you want to delete this vacation?"
          onConfirm={deleteCard}
          okText="Yes"
          cancelText="No"
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        >
          <button 
            onClick={(e) => e.stopPropagation()}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-300">
            <FaTrashAlt className="text-lg" />
          </button>
        </Popconfirm>
      </div>
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