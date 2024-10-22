import React from "react";
import { format } from "date-fns";
import { authAndData } from "../hooks n custom funcs/authAndData";
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
    const { role } = await authAndData("none");
    if (role === "user") {
      const res = await fetch("http://localhost:3000/vacations/updateFollow", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vacationId: vacation.vacation_id,
          userId: userId.current,
        }),
      });

      if (!res) {
        const errorData = await res.json();
        throw new Error(
          `Error in fetching data: ${errorData || "unknown error"}`,
        );
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <div className="rounded-xl overflow-hidden">
      <div className="relative">
        {/* Button for following */}
        <div
          onClick={updateFollow}
          className="glass followers-tint w-24 !p-0 py-1 mb-2 absolute top-2 left-2 flex flex-row gap-8 font-xl font-bold hover:cursor-pointer"
        >
          {isUserFollowingVacation ? (
            <FaHeart size={20} />
          ) : (
            <FaRegHeart size={20} />
          )}
          {totalFollowers}
        </div>

        {/* Image Display */}
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
      <div className="bg-gray-400 p-4 flex flex-col bg-[#F0F1A1]">
        <div className="flex flex-row justify-between">
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            {vacation.destination}
          </h2>
          <p className="text-gray-600 mb-2 line-clamp-2">
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
