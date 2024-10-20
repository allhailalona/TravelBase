import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { authAndData } from '../hooks n custom funcs/authAndData';
import { Vacation, Role } from '../../types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const { TextArea } = Input;

export default function AddVacationForm() {
  // Hooks for navigation and routing
  const navigate = useNavigate();
  const { id } = useParams()

  // Form and state management
  const [form] = Form.useForm();
  const [tempVacations, setTempVacations] = useState()
  const [role, setRole] = useState<Role>('')
  const [image, setImage] = useState<string>('')
  const [originalImage, setOriginalImage] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Fetch vacation data and/ or user role
  useEffect(() => {
    const helperFunc = async () => {
      if (id) { // If we are in edit mode
        const data = await authAndData('single', id);
        setTempVacations(data.vacations)
        setRole(data.role)
      } else { // If we are in adding mode
        const data = await authAndData('none');
        setRole(data.role)
      }
    };
      
    helperFunc()
  }, []);

  // Effect to populate form in edit mode
  useEffect(() => {
    if (id) {
      console.log('its edit mode so form is filled')
      // Convert Buffer to base64 string
      const base64String = btoa(String.fromCharCode.apply(null, tempVacations.image_path.data));

      // Create data URL
      const dataUrl = `data:image/jpeg;base64,${base64String}`;

      setImage(dataUrl);
      setOriginalImage(dataUrl);
      setStartDate(tempVacations.starting_date ? new Date(tempVacations.starting_date) : undefined);
      setEndDate(tempVacations.ending_date ? new Date(tempVacations.ending_date) : undefined);
      form.setFieldsValue({
        destination: tempVacations.destination,
        description: tempVacations.description,
        price: parseFloat(tempVacations.price),
        imagePath: dataUrl === 'data:image/jpeg;base64,' ? '' : dataUrl, // This requres further attention since an empty image should be ---
      });
    }
  }, [tempVacations, form]);

  // Form submission handler
  const onFinish = async (values: any) => {
    if (!startDate || !endDate) {
      message.error('Please select both start and end dates');
      return;
    }
    const vacation: Vacation = {
      vacation_id: id,
      destination: values.destination,
      description: values.description,
      starting_date: startDate.toISOString().split('T')[0],
      ending_date: endDate.toISOString().split('T')[0],
      price: values.price.toString(),
      image_path: values.imagePath
    };
    // Check if values ave been changed at all!

    // Determine API endpoint based on add/edit mode
    // FOR SOME REASON I CANNOT INCLUDE A CONDITIONALLY ASSIGNED VARIALBE LIKE 'ENDPOINT' IN THE FETCH REQUEST DIRECTLY, INSTEAD OF THE MANUAL ADDRESS, SAVING PRECIOUS CODING SPACE.
    const { role } = await authAndData('none')
    if (role === 'admin') {
      if (id) {
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

  const validateDateRange = (_, value) => {
    if (!startDate || !endDate) {
      return Promise.reject('Please select both start and end dates');
    }
    if (!tempVacations && startDate < new Date()) {
      return Promise.reject('Start date cannot be in the past');
    }
    if (!tempVacations && endDate < new Date()) {
      return Promise.reject('End date cannot be in the past');
    }
    if (endDate < startDate) {
      return Promise.reject('End date must be after start date');
    }
    return Promise.resolve();
  };

  // Only allow admin access
  if (role !== 'admin') return null; 

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Add'} a Vacation</h1>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <div>
            {/* Vacation details form fields */}
            <Form.Item name="destination" label="Destination" rules={[{ required: true, message: 'Required' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="dateRange" label="Date Range" rules={[{ validator: validateDateRange }]}>
              <div className="flex space-x-4">
                <DatePicker
                  selected={startDate || null}
                  onChange={(date) => setStartDate(date || undefined)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="form-input block w-full sm:text-sm sm:leading-5"
                  placeholderText="Start Date"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date || undefined)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="form-input block w-full sm:text-sm sm:leading-5"
                  placeholderText="End Date"
                />
              </div>
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[
              { required: true, type: 'number', min: 0.01, message: 'Price must be greater than 0' },
              { type: 'number', max: 10000, message: 'Price cannot exceed $10,000' }
            ]}>
              <InputNumber
                className="w-full"
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                precision={2}
              />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Required' }]}>
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item 
              name="imagePath" 
              label="image Path" 
              rules={[{ required: !id, message: 'Required' }]}
            >
              <Input 
                onChange={(e) => {
                  const newValue = e.target.value;
                  setImage(newValue || originalImage);
                }} 
                placeholder="https://example.com/image.jpg" 
              />
            </Form.Item>
          </div>
          <div>
            {/* Image preview */}
            <img src={image} alt="Current vacation" className="mt-2 max-w-full h-auto" />
          </div>
        </div>
        <Form.Item>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate('/vacations/fetch')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              {id ? 'Edit' : 'Add'} Vacation
            </button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}