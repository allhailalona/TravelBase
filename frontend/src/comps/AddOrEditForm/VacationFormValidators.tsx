export const validateRequired = (value: any) => {
  if (!value) return "This field is required";
  return null;
};

export const validateDateRange = (
  startDate: Date | null,
  endDate: Date | null,
) => {
  if (!startDate || !endDate) return "Both start and end dates are required";
  if (endDate < startDate) return "End date must be after start date";
  return null;
};

export const validatePrice = (value: number | null) => {
  if (value === null || value === undefined) return "This field is required";
  if (value <= 0) return "Price must be greater than 0";
  if (value > 10000) return "Price cannot exceed $10,000";
  return null;
};

export const validateBase64Image = (value: string, isEditMode: boolean) => {
  if (!isEditMode && !value) return "This field is required";
  if (!value) return null; // Empty is okay in edit mode

  const isBase64 = /^data:image\/[a-z]+;base64,/.test(value);
  if (!isBase64)
    return "Invalid base64 image data. Please provide a valid base64 encoded image.";

  return null;
};
