import React, { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useGeneralContext } from '../../context/GeneralContext'
import { authAndData } from '../../hooks n custom funcs/authAndData'
import VacationForm from './VacationFormReturn';
import { validateDateRange } from './VacationFormValidators';
import { Vacation } from '../../../../types';

export default function AddVacationForm() {
  // Hooks for navigation and routing
  const navigate = useNavigate();
  const { id } = useParams()
  const { userRole } = useGeneralContext()

  // Form and state management
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [tempVacations, setTempVacations] = useState()
  const [image, setImage] = useState<string>('')
  const [originalImage, setOriginalImage] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Fetch vacation data and/ or user role
  useEffect(() => {
    const helperFunc = async () => {
      try {
        if (id) {
          console.log('editing mode detected')
          const data = await authAndData('single', id);
          setTempVacations(data.vacations);
          userRole.current = data.role;
        } else {
          const data = await authAndData('none');
          userRole.current = data.role;
        }
      } catch (err) {
        message.error('Failed to load data.');
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };
    
    helperFunc();
  }, [id]);

  // Effect to populate form in edit mode
  useEffect(() => {
    if (id && tempVacations) {
      console.log('its edit mode so form is filled tempVacaion is', tempVacations)
      // Convert Buffer to base64 string
      const base64String = btoa(String.fromCharCode.apply(null, tempVacations.image_path.data));
      console.log('done base64String')

      // Create data URL
      const dataUrl = `data:image/jpeg;base64,${base64String}`;

      setImage(dataUrl);
      setOriginalImage(dataUrl);
      setStartDate(tempVacations.starting_date ? new Date(tempVacations.starting_date) : undefined);
      setEndDate(tempVacations.ending_date ? new Date(tempVacations.ending_date) : undefined);
      form.setFieldsValue({
        destination: tempVacations.destination,
        description: tempVacations.description,
        dateRange: [
          tempVacations.starting_date ? new Date(tempVacations.starting_date) : undefined,
          tempVacations.ending_date ? new Date(tempVacations.ending_date) : undefined
        ],
        price: parseFloat(tempVacations.price),
        imagePath: dataUrl === 'data:image/jpeg;base64,' ? '' : dataUrl, // This requres further attention since an empty image should be ---
      });
    }
  }, [id, tempVacations, form]);

  // Form submission handler
  const onFinish = async (values: any) => {
    console.log('onFinish clicked values are', values);
    const dateRangeError = validateDateRange(startDate, endDate);
    if (dateRangeError) {
      message.error(dateRangeError);
      return;
    }
    const vacation: Vacation = {
      vacation_id: id,
      destination: values.destination,
      description: values.description,
      starting_date: startDate.toISOString().split('T')[0],
      ending_date: endDate.toISOString().split('T')[0],
      price: values.price.toString(),
      image_path: values.imagePath || (id ? originalImage : '') // Use original image in edit mode if no new image is provided
    };
    // Check if values ave been changed at all!

    // Determine API endpoint based on add/edit mode
    // FOR SOME REASON I CANNOT INCLUDE A CONDITIONALLY ASSIGNED VARIALBE LIKE 'ENDPOINT' IN THE FETCH REQUEST DIRECTLY, INSTEAD OF THE MANUAL ADDRESS, SAVING PRECIOUS CODING SPACE.
    const { role } = await authAndData('none')
    if (role === 'admin') {
      if (id) {
        console.log('calling edit listener vacation is', vacation)
        const res = await fetch(`http://localhost:3000/vacations/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vacation)
        });
  
        if (!res.ok) {
          const errorData = await res.json()
          message.error(`Error editing vacation: ${errorData}`)
          throw new Error(`Error in vacation form request: ${errorData}`)
        } 
  
        message.success(`Successfully edited vacation!`)
        navigate('/vacations/fetch')
      } else {
        const res = await fetch(`http://localhost:3000/vacations/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vacation)
        });
  
        if (!res.ok) {
          const errorData = await res.json()
          message.error(`Error adding vacation: ${errorData}`)
          throw new Error(`Error in vacation form request: ${errorData}`)
        } 
  
        message.success(`Successfully added vacation!`)
        navigate('/vacations/fetch')
      }
    }
  };

  // Render form
  if (userRole.current !== 'admin') return <p>Unauthorized access.</p>;
  if (loading) return <p>Loading...</p>;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Add'} a Vacation</h1>
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