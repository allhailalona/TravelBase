import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'
import { Vacation } from '../../types';
import { message } from 'antd'
import { FaCalendarAlt, FaDollarSign, FaImage, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

export default function AdminCards({ vacation }: { vacation: Vacation }) {
  const navigate = useNavigate()

  const deleteCard = async () => {
    console.log('about to delete', vacation.vacation_id)
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

  const editCard = () => {
    navigate(`/vacations/edit/${vacation.vacation_id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative">
        {vacation.image_url ? (
          <img src={vacation.image_url} alt={vacation.destination} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <FaImage className="text-gray-400 text-5xl" />
          </div>
        )}
      <div onClick={editCard} className="absolute top-2 right-2 space-x-2">
        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300">
          <FaPencilAlt className="text-lg" />
        </button>
        <button onClick={deleteCard} className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-300">
          <FaTrashAlt className="text-lg" />
        </button>
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