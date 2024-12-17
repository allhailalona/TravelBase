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

  // Properly check if the image code is an image or not
  function isValidImage(base64String: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = base64String;
    });
  }

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
              onChange={async (e) => {
                const isValid = await isValidImage(e.target.value);
                if (isValid) {
                  setImage(e.target.value || originalImage);
                } else {
                  setImage('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIALQAvgMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABAUBAgYDB//EAEIQAAEEAQIBBQwHBQkAAAAAAAABAgMEEQUSIRMUMUFRBiIyVGFxcoGRk7HRFSMzNVOh4RZSYpLBJTQ2QkNjdLLw/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD7KAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI+oW20qj53N3bcIje1VOfTXtRdxZDGqeSNy/1A6gHMfTmp/gM9075j6c1P8AAZ7p3zA6cHMfTmp/gM9075j6c1P8BnunfMDpwczH3Q245W86hZyfWiNVq48mVOmRUVEVOhegAAAAAAAAAAAAAAAAAAAAAAq+6X7qd6bfiaaNO2roKTPztZuVUTr4m/dL91O9NvxNdDiZPojYpUyx+5FT1qBrpmu88tpBJDyavzsVHZ8uFLnJUafplGnfVGTrJYa3LWOVMtRevgS9S1CLT4N7++e7wGdbl+QEiSxFFIyOSVrXyLhiKvFx6ZOCtWZbU7ppnbnr7E8iHQaHrHLbatp31vQx6/5/Ivl+PxCP3W/a1/Qd8UOii+yZ6KfA53ut+1r+g74odFF9kz0U+AGwAAAAAAAAAAAAAAAAAAAACr7pfup3pt+J56O97O59z4vDa2RW8M8eOD27omOfpUm1M7XNcuOzJUaZrbaVRsC11ftVV3I/HSuewCua242blkZPyu7dv2rnPabWeeWpnTTxyuev8C8PIhc/tO3xV3vP0H7Tt8Vd7z9AKHm8/wCBL/IpJ02CZNQrKsMiIkrcqrF7S1/advirvefoP2mb4q73n6AeXdb9rX9B3xQ6KL7Jnop8DkNWvrqksPJwq1zUVqN3ZVyqdhGm1jWr0oiIBkAAAAAAAAAAAAAAAAAAAAAI60aarlaldVX/AGm/IkACPzCl4nX9035DmFLxOv7pvyJAAj8wpeJ1/dN+Q5hS8Tr+6b8iQAPKKrWhduirwsd2tYiKeoAAAAAAAAAAAAAAAAAAhWZ5GarTha7EcjXq5uOnCcCaQbMUjtXpStYqxsbJud1JlOAEarfmTVpoZ3ZgdIsca4TvXJxx60MXr830pBDXdiFsrGSqiJ3znccexPzNuYyTx6gxyKx7rHKQvXtROCmHUJYoKTcLJLztss7k7VzlQJOqTyt5GtVdtsTvw137rU4qpirfzpa2Z0XfC1Ulb17k6U9f9Tx5patahNa5Z9ZGfVRd4iqretePapozT5mT2a8j3ywW41V0u1E2v8wHrDDqNmJJ33ebq9NzYmRoqNTqznpGpy2q9CDdO1kzpWsfIxvDC56lMV7V6tE2CejJLIxNrXxOTa9E6F8h4TU7DdGqwvhWSRkyPfG1d3DKrj8wJVVr1sN/tZs+OmNEZx9h6a1PJW02aWF2x7duHY6O+Q8qjo22G8npD4FXhynJtTb7D01yKSfS5o4WK967cNTpXvkA8o78kmm2t6cncrxu3t7HIi4VPIYfcsOr0IYFatmzEjlkcnBqbUVVwNZoyStdYpp9fsWN7U/1GLwx5zV1Swyvp9iuxFsV4ka6Jy43JtRFTzgZsJfoRLZ53zljOMkb40blOtUVDTUn2Y66XK956RyObsZybeCO8pvaluX4VrRU5IEk4SSyqmGp14TrPTVKzl06OCuxztjmIiJ04QCVVhmhRyTWXTqvQrmI3HsPcyvSYAAAAAAAAAAAAAaTytghfNJ4LGq5QN8plUymU6QiovQqLgoKm6pPWvSvTNxVbOmfB3cWk2NOaa2+PojuN3t9NvT+XECyymcZTPYMpnGUz2FXSkY+e5qcq/VpmONf4G9Kp51IUDnV5a+pyuTNl6pM3Pgtd4PqTCAdDlMomUyvQgRUXOFTgVtz7707zS/9TOlf3rUf+R/QCxCKiplOKFfrEiujipsdtfZdtVexicXL7DXSHJDJYobkXkXbouOcsXj+QFjvZnG9ufOZVUTpVE85zVZtVVtcvps9l3OH9/HHlMdmc/8Asm7v8NY5RHokqYTOdnfeCuewDojXlGfvt/mQxY+wl9Bfgc5QbRWnDyulWpX7eMjIVVHevIHTAw1qMajWphrUwieQyAAAAAAAAAAAAi6hVdciZDvRse9FkTrc1OolACvn0alJC9kcDI3q1Ua9OpTa5Rls04WLMjbMSoqSonX0L7ScAIE2n7tPipRvRkbdqPXHFyJxX2qJtGovie1ldjHOaqI5Ope0ngCCylLy9KWWVrnV2Oa5UTwspjJ5pSuw2LElazC1sz96o5irgsgBX/RqT2XTX1ZN9W1jW4widq+tTKaZHDbhnpo2HZlJGp0PapPAFXDRv1llSvZgRkkjpMOjVVTIdpLvo6Ssk+6WWXlXyObwV2ez1FoAIccV5VelmxC9jmqmGR4XJHrU9SrQMhit19jEwmYlLQAYYjkY1Hqivwm5UTCKpkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxkZAKhkZAAZGQAGRkABkZAAZGQAGRkABkZAAZGQAGRkABkZAAZGQAP/2Q==');
                }
              }}
              placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
              className="border border-gray-300 rounded"
            />
          </Form.Item>
        </div>

        <div className="flex flex-col h-full">
          <div className="h-[90%] flex items-center justify-center">
            <img
              src={image}
              alt="Current vacation"
              className="mt-2 max-w-full h-auto"
            />
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
