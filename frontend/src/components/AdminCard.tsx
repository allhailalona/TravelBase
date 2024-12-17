import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { convertBufferToBase64 } from '../hooks n custom funcs/imageUtils'
import { message, Popconfirm } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  FaCalendarAlt,
  FaDollarSign,
  FaImage,
  FaPencilAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { Vacation } from "../../../moshe";
import "../index.css";

export default function AdminCards({ vacation }: { vacation: Vacation }) {
  const navigate = useNavigate();

  const deleteCard = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Has something to do with the event cycle...
    try {
      console.log('about to make request to delete')
      await fetch("http://localhost:3000/vacations/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          _at: localStorage.getItem('accessToken'),
          _rt: localStorage.getItem('refreshToken'),
          id: vacation.vacation_id 
        }),
      });

      message.success("Successfully deleted vacation! Refreshing page...");
      window.location.reload();
    } catch (err) {
      // Errors are vague here... Which is why we don't need custom error handling with a !res.ok conditional like we usually do
      console.error('err in deleteCard in AdminCard.tsx', err)
      throw err
    }

  };

  const editCard = () => {
    navigate(`/vacations/edit/${vacation.vacation_id}`);
  };

  // Convert Buffer to base64 string
  const dataUrl = convertBufferToBase64(vacation.image_path.data)

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl w-full
                hover:shadow-2xl hover:scale-[1.02] hover:shadow-indigo-500/10
                transition-all duration-300 cursor-pointer">
      <div className="relative">
        {vacation.image_path.type === "Buffer" ? (
          <img
            src={dataUrl}
            alt={vacation.destination}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-gray-800 flex items-center justify-center">
            <FaImage className="text-gray-600 text-6xl" />
          </div>
        )}
        
        {/* Admin Controls */}
        <div className="absolute top-4 right-4 flex gap-3">
          <button
            onClick={editCard}
            className="bg-blue-500/80 backdrop-blur-sm p-3 rounded-full
                      hover:bg-blue-600/90 transition-all duration-200"
          >
            <FaPencilAlt className="text-white text-lg" />
          </button>
          <Popconfirm
            title="Are you sure you want to delete this vacation?"
            onConfirm={deleteCard}
            okText="Yes"
            cancelText="No"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          >
            <button
              onClick={(e) => e.stopPropagation()}
              className="bg-red-500/80 backdrop-blur-sm p-3 rounded-full
                        hover:bg-red-600/90 transition-all duration-200"
            >
              <FaTrashAlt className="text-white text-lg" />
            </button>
          </Popconfirm>
        </div>
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
