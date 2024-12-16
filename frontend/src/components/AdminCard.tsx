import React, { useEffect } from "react";
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
import { Vacation } from "../../../types";
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
    <div className="rounded-xl overflow-hidden">
      <div className="relative">
        {vacation.image_path.type === "Buffer" ? (
          <img
            src={dataUrl}
            alt={vacation.destination}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <FaImage className="text-gray-400 text-5xl" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-row gap-2">
          <button
            onClick={editCard}
            className="glass"
            style={{ background: "rgba(0, 0, 255, 0.1)" }}
          >
            <FaPencilAlt className="text-lg" />
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
              className="glass"
              style={{ background: "rgba(255, 0, 0, 0.15)" }}
            >
              <FaTrashAlt className="text-lg" />
            </button>
          </Popconfirm>
        </div>
        <div className="bg-[#E5E7EB]">
          <div
            className="glass !p-0 py-2 text-md !rounded-none !rounded-t-xl font-bold !shadow-none flex justify-center items-center"
            style={{ background: "rgba(255, 255, 0, 0.4)" }}
          >
            <FaCalendarAlt className="mr-2" />
            <span>
              {format(new Date(vacation.starting_date), "MMM d, yyyy")} -
              {format(new Date(vacation.ending_date), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gray-400 p-4 flex flex-col bg-[#F0F1A1]">
        <div className="flex flex-col justify-between">
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            {vacation.destination}
          </h2>
          <p className="text-gray-600 mb-2 line-clamp-2 overflow-y-auto">
            {vacation.description}
          </p>
        </div>
        <div className="flex items-center justify-center mt-4">
          <div className="flex justify-center items-center py-2 px-4 bg-green-600 rounded-lg px-2 text-xl text-white font-bold">
            <FaDollarSign className="mr-1" />
            <span>{vacation.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
