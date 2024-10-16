import { useState, useEffect } from 'react'
import { Form, Input, DatePicker, InputNumber, message } from 'antd';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuthAndData } from '../hooks/useAuthAndData';
import { Vacation } from '../../types';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function AddVacationForm() {
  const navigate = useNavigate();
  const location = useLocation()
  const { id } = useParams()

  const [form] = Form.useForm();
  const [image, setImage] = useState<string>('')
  const [originalImage, setOriginalImage] = useState<string>('');

  let mode = location.pathname.includes('/vacations/edit') && id ? 'single' : 'none';

  const { role, singleVacation } = useAuthAndData(mode, id);

  useEffect(() => {
    if (singleVacation && singleVacation[0]) {
      const vacationImage = singleVacation[0].image_url || '';
      setImage(vacationImage);
      setOriginalImage(vacationImage);

      
      form.setFieldsValue({
        destination: singleVacation[0].destination,
        description: singleVacation[0].description,
        dateRange: [moment(singleVacation[0].starting_date), moment(singleVacation[0].ending_date)],
        price: parseFloat(singleVacation[0].price),
        imageUrl: vacationImage,
      });
    }
  }, [singleVacation, form]);

  const onFinish = async (values: any) => {
    const vacation: Omit<Vacation, 'vacation_id'> = {
      destination: values.destination,
      description: values.description,
      starting_date: values.dateRange[0],
      ending_date: values.dateRange[1],
      price: values.price.toString(),
      image_url: values.imageUrl
    };

    const url = id ? `http://localhost:3000/edit-vacation/${id}` : 'http://localhost:3000/add-vacation';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vacation)
    });

    if (!res.ok) {
      const errorData = await res.json()
      message.error(`Error ${id ? 'editing' : 'adding'} vacation: ${errorData}`)
      throw new Error(`Error in vacation form request: ${errorData}`)
    } 
    
    message.success(`Successfully ${id ? 'edited' : 'added'} vacation!`)
    navigate('/vacations')
  };

  const disabledDate = (current: moment.Moment) => {
    if (singleVacation) {
      return false;
    }
    return current && current < moment().startOf('day');
  };

  if (role !== 'admin') return null; 

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Add'} a Vacation</h1>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Form.Item name="destination" label="Destination" rules={[{ required: true, message: 'Required' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="dateRange" label="Date Range" rules={[{ required: true, message: 'Required' }]}>
              <RangePicker 
                className="w-full" 
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
              />
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number', min: 0.01 }]}>
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
            <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true, message: 'Required' }]}>
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