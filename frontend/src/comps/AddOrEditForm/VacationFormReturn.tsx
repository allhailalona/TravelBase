import React from "react";
import { Form, Input, InputNumber, Button } from "antd";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  validateRequired,
  validatePrice,
  validateBase64Image,
  validateDateRange,
} from "./VacationFormValidators";
import { FaImage } from "react-icons/fa";

const { TextArea } = Input;

const VacationForm = ({
  form,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  image,
  setImage,
  originalImage,
  onFinish,
  id,
}) => {
  const navigate = useNavigate();
  const isEditMode = !!id;

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onFinish(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="max-w-2xl"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <Form.Item
            name="destination"
            label={<span className="font-bold text-white">Destination</span>}
            rules={[
              {
                validator: (_, value) =>
                  validateRequired(value)
                    ? Promise.reject(validateRequired(value))
                    : Promise.resolve(),
              },
            ]}
          >
            <Input
              placeholder="Enter destination"
              className="border border-gray-300 rounded"
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label={<span className="font-bold text-white">Date Range</span>}
            rules={[
              {
                validator: () => {
                  const error = validateDateRange(startDate, endDate);
                  return error ? Promise.reject(error) : Promise.resolve();
                },
              },
            ]}
          >
            <div className="flex space-x-4">
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  form.validateFields(["dateRange"]);
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Start Date"
                className="border border-gray-300 rounded p-2 w-full"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  form.validateFields(["dateRange"]);
                }}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="End Date"
                className="border border-gray-300 rounded p-2 w-full"
              />
            </div>
          </Form.Item>

          <Form.Item
            name="price"
            label={<span className="font-bold text-white">Price</span>}
            rules={[
              {
                validator: (_, value) =>
                  validatePrice(value)
                    ? Promise.reject(validatePrice(value))
                    : Promise.resolve(),
              },
            ]}
          >
            <InputNumber
              className="w-full border border-gray-300 rounded"
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              precision={2}
              placeholder="Enter price"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-bold text-white">Description</span>}
            rules={[
              {
                validator: (_, value) =>
                  validateRequired(value)
                    ? Promise.reject(validateRequired(value))
                    : Promise.resolve(),
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter description"
              className="border border-gray-300 rounded"
            />
          </Form.Item>

          <Form.Item
            name="imagePath"
            label={<span className="font-bold text-white">Destination</span>}
            rules={[
              {
                validator: (_, value) => {
                  const error = validateBase64Image(value, isEditMode);
                  return error ? Promise.reject(error) : Promise.resolve();
                },
              },
            ]}
          >
            <Input
              onChange={(e) => {
                const newValue = e.target.value;
                setImage(newValue || originalImage);
              }}
              placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
              className="border border-gray-300 rounded"
            />
          </Form.Item>
        </div>

        <div className="flex flex-col h-full">
          <div className="h-[90%] flex items-center justify-center">
            {image.type === "Buffer" ? (
              <img
                src={image}
                alt="Current vacation"
                className="mt-2 max-w-full h-auto"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <FaImage className="text-gray-400 text-5xl" />
              </div>
            )}
          </div>
          <div className="mt-auto w-full">
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => navigate("/vacations/fetch")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                type="primary"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {id ? "Edit" : "Add"} Vacation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default VacationForm;
