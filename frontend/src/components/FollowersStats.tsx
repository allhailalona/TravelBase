import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useGeneralContext } from "../context/GeneralContext";
import { Vacation } from "../../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FollowersStats() {
  const navigate = useNavigate();

  const { vacations, followers } = useGeneralContext();

  // If followers is not undefined
  const totalFollowersStats =
    followers !== undefined &&
    followers.reduce((acc, { vacation_id }) => {
      // For each vacation_id in the array, create a new and/or increment the acc item
      acc[vacation_id] = (acc[vacation_id] || 0) + 1;
      return acc; // Update acc for next iteration
    }, {});

  // type for stat
  const finalDiagramData = Object.entries(totalFollowersStats || {}).map(
    ([id, count]) => {
      // Again, proceed only if vacations are NOT undefined
      const vacation =
        vacations !== undefined &&
        vacations.find((v: Vacation) => v.vacation_id.toString() === id);
      return {
        destination: vacation ? vacation.destination : `Unknown (${id})`,
        totalFollowers: count,
      };
    },
  );

  const exportToCSV = () => {
    // Create CSV content
    const csvContent =
      "Destination, Followers\n" +
      finalDiagramData
        .map((row) => `${row.destination}, ${row.totalFollowers}`)
        .join("\n");

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a link element, set the download attribute and click it
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "Vacation Followers.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full h-full pr-10 flex justify-center items-center flex-col gap-4">
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <BarChart data={finalDiagramData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="destination"
              height={70}
              tick={{ fill: "white", fontWeight: "bold" }}
            />
            <YAxis tick={{ fill: "white", fontWeight: "bold" }} />
            <Tooltip />
            <Bar dataKey="totalFollowers" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full flex justify-center gap-2">
        <Button onClick={exportToCSV} type="primary">
          Export to CSV
        </Button>
        <Button onClick={() => navigate("/vacations/fetch")}>
          Return to Main Screen
        </Button>
      </div>
    </div>
  );
}
