import { useState, useEffect } from "react";
import { Form, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useGeneralContext } from "../../context/GeneralContext";
import VacationForm from "./VacationFormReturn";
import { validateDateRange } from "./VacationFormValidators";
import { Vacation } from "../../../types";

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
  const [image, setImage] = useState<string>("data:image/jpeg;base64,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"); // To show pasted imgae real time
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
  }, [id, verifyUserRole]);

  // Populate form in editing mode
  useEffect(() => {
    // Early return if no data - less verbose than if tempVacation populate form
    if (!tempVacation?.[0]) return;
  
    // Destructure values with default fallbacks (for tsproofing)
    const {
      image_path = {},
      starting_date = null,
      ending_date = null,
      destination = '',
      description = '',
      price = 0
    } = tempVacation[0];
  
    // Convert image if exists
    const base64String = image_path?.data 
      ? btoa(String.fromCharCode.apply(null, image_path.data))
      : '';
    const dataUrl = `data:image/jpeg;base64,${base64String}`;
  
    // Create dates if timestamps exist
    const startDate = starting_date ? new Date(starting_date) : undefined;
    const endDate = ending_date ? new Date(ending_date) : undefined;
  
    // Update form values
    setImage(dataUrl);
    setOriginalImage(dataUrl);
    setStartDate(startDate);
    setEndDate(endDate);

    form.setFieldsValue({
      destination,
      description,
      dateRange: [startDate, endDate],
      price: parseFloat(price),
      imagePath: dataUrl
    });
  }, [tempVacation, form]);

  // Form submission handler
  const onFinish = async (values: Vacation) => {
    const dateRangeError = validateDateRange(startDate!, endDate!);
    if (dateRangeError) {
      message.error(dateRangeError);
      return;
    }

    // Arrange data in form to send to backend in a nice manner
    const vacation: Vacation = {
      vacation_id: id, // There is a confusion here that should be addressed in the future - the DB vacation_id is a NUMBER, yet converted to a string in the front, for now I'll modify the zod validation - it's not a crucial security concern
      destination: values.destination,
      description: values.description,
      price: values.price,
      starting_date: startDate!.toISOString().split("T")[0],
      ending_date: endDate!.toISOString().split("T")[0],
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
        message.error(`Error editing vacation`);
        throw new Error(`Error in vacation form request`);
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
        message.error(`Error adding vacation`);
        throw new Error(`Error in vacation form request`);
      }

      message.success(`Successfully added vacation!`);
      navigate("/vacations/fetch");
    }
  };

  // Render form
  if (userRole !== "admin") return <p>Unauthorized access.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="h-full w-full flex justify-center items-center flex-col">
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
