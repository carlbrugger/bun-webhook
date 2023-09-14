export const validateEmail = (field: string, value: string) => {
  const validEmailAddress = /^[^\s@]+@flatfile.io$/i;
  if (field === "email" && value && !validEmailAddress.test(value)) {
    return "Not a valid Flatfile email address";
  }
  return null;
};

export const validateNonEmpty = (field: string, value: string) => {
  if (!value) {
    return "Cannot be empty";
  }
  return null;
};
