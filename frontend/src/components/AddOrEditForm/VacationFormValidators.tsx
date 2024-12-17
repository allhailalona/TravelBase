// 'return null' means everything is fine
// @ts-expect-error not really sure what should be the type of value as it doesn't accept any
export const validateRequired = (value) => { 
  if (!value) return "This field is required";
  return null;
};

export const validatePrice = (value: string | null) => {
  if (value === null || value === undefined) return "This field is required";
  
  // Check for any non-numeric characters except decimal point
  if (/[^0-9.]/.test(value)) return 'A number is required here'; // This is not always working - not sure why
  
  const numValue = parseFloat(value);
  if (numValue <= 0) return "Price must be greater than 0";
  if (numValue > 10000) return "Price cannot exceed $10,000";
  return null;
};

export const validateDateRange = (
  startDate: Date | null,
  endDate: Date | null,
) => {
  if (!startDate || !endDate) return "Both start and end dates are required";
  if (endDate < startDate || endDate === startDate) return "End date must be after start date";
  return null;
};

export const validateBase64Image = (value: string, isEditMode: boolean) => {
  if (!isEditMode && !value) return "This field is required"; // Empty is NOT okay for adding mode
  if (isEditMode && !value) return null; // Empty is okay in edit mode

  const isBase64 = /^data:image\/[a-z]+;base64,/.test(value);
  if (value && !isBase64) // If a value is included it MUST be a Base64 syntax
    return "Invalid base64 image data. Please provide a valid base64 encoded image.";

  return null;
};
