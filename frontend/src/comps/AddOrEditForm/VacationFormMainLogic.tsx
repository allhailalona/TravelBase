import React, { useState, useEffect } from "react";
import { Form, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useGeneralContext } from "../../context/GeneralContext";
import { authAndData } from "../../hooks n custom funcs/authAndData";
import VacationForm from "./VacationFormReturn";
import { validateDateRange } from "./VacationFormValidators";
import { Vacation } from "../../../../types";

export default function AddVacationForm() {
  /* Two possible modes - 
  * Add vacation - the address is vacations/add
  * Edit vacation - the address is vacations/edit/number
  * useParams is used to seperate the number from the address and edit the correct card
  */
  
  // Hooks for navigation and routing
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { userRole, verifyUserRole } = useGeneralContext() // Don't forget me!

  // Form and state management
  const [form] = Form.useForm(); // To use antd form
  const [loading, setLoading] = useState(true); // For UI
  const [tempVacation, setTempVacation] = useState<Vacation>(); // For edit mode - to store the selected vacation after being fetched from the DB
  const [image, setImage] = useState<string>(""); // To show pasted imgae real time
  const [originalImage, setOriginalImage] = useState<string>(""); // Revert to the original one after the pasted text is removed
  const [startDate, setStartDate] = useState<Date | undefined>(undefined); // These are for adding mode
  const [endDate, setEndDate] = useState<Date | undefined>(undefined); // These are for adding mode

  // Fetch data about selected vacation (only for editing mode)
  useEffect(() => {
    const helperFunc = async () => {
      try {
        if (id) { // If id is present in address, we must be in editing mode (of course not tamper proof... But why would the admin tamper with that?)
          console.log("editing mode detected fetching data about selected vacation");
          const res = await fetch('http://localhost:3000/vacations/fetch', {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              _at: localStorage.getItem('accessToken'),
              _rt: localStorage.getItem('refreshToken'), 
              id
            })
          })

          const data = await res.json()
          console.log('just fetched singel vac is', data.updatedVacations)

          setTempVacation(data.updatedVacations);
        }

        console.log('hello vac form main logic calling verify userrole')
        await verifyUserRole()
      } catch (err) {
        message.error("Failed to load data about selected vacation, see logs.");
        console.error('err in fetching single vacatoin listener in VacFormMainLogic', err)
        throw err
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    helperFunc();
  }, []);

  // Populate form with fetched selected vacation
  useEffect(() => {
    if (tempVacation) { // This conditional is more for tsproofing actually...
      // Convert Buffer to base64 string to show imgaes in browser
      const base64String = btoa(
        String.fromCharCode.apply(null, tempVacation[0].image_path.data),
      );
      console.log("done base64String");

      // Create data URL
      const dataUrl = `data:image/jpeg;base64,${base64String}`;

      setImage(dataUrl);
      setOriginalImage(dataUrl);
      setStartDate(
        tempVacation[0].starting_date
          ? new Date(tempVacation[0].starting_date)
          : undefined,
      );
      setEndDate(
        tempVacation[0].ending_date
          ? new Date(tempVacation[0].ending_date)
          : undefined,
      );
      form.setFieldsValue({
        destination: tempVacation[0].destination,
        description: tempVacation[0].description,
        dateRange: [
          tempVacation[0].starting_date
            ? new Date(tempVacation[0].starting_date)
            : undefined,
          tempVacation[0].ending_date
            ? new Date(tempVacation[0].ending_date)
            : undefined,
        ],
        price: parseFloat(tempVacation[0].price),
        imagePath: dataUrl === "data:image/jpeg;base64," ? "" : dataUrl, // This requres further attention since an empty image should be ---
      });
    }
  }, [tempVacation])

  // Form submission handler
  const onFinish = async (values) => {
    console.log("onFinish clicked values are", values);
    const dateRangeError = validateDateRange(startDate!, endDate!);
    if (dateRangeError) {
      message.error(dateRangeError);
      return;
    }

    // Arrange data in form to send to backend in a nice manner
    const vacation: Vacation = {
      vacation_id: id,
      destination: values.destination,
      description: values.description,
      starting_date: startDate!.toISOString().split("T")[0],
      ending_date: endDate!.toISOString().split("T")[0],
      price: values.price.toString(),
      image_path: values.imagePath || (id ? originalImage : ""), // Use original image in edit mode if no new image is provided
    };

    // Determine API endpoint based on add/edit mode
    if (id) { // Edit vacation
      const res = await fetch(`http://localhost:3000/vacations/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _at: localStorage.getItem('accessToken'),
          _rt: localStorage.getItem('refreshToken'), 
          vacation
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        message.error(`Error editing vacation: ${errorData}`);
        throw new Error(`Error in vacation form request: ${errorData}`);
      }

      message.success(`Successfully edited vacation!`);
      navigate("/vacations/fetch");
    } else { // Add vacation
      const res = await fetch(`http://localhost:3000/vacations/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _at: localStorage.getItem('accessToken'),
          _rt: localStorage.getItem('refreshToken'), 
          vacation
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        message.error(`Error adding vacation: ${errorData}`);
        throw new Error(`Error in vacation form request: ${errorData}`);
      }

      message.success(`Successfully added vacation!`);
      navigate("/vacations/fetch");
    }
  };

  // Render form
  if (userRole !== "admin") return <p>Unauthorized access.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl text-white font-bold mb-6">
        {id ? "Edit" : "Add"} a Vacation
      </h1>
      <VacationForm
        form={form}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        image={image}
        setImage={setImage}
        originalImage={originalImage}
        onFinish={onFinish}
        id={id}
      />
    </div>
  );
}
