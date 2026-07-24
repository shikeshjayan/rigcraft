import { TextField } from "@mui/material";

const AdminInput = ({ label, error, helperText, ...props }) => {
  return (
    <TextField
      fullWidth
      label={label}
      error={error}
      helperText={helperText}
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "var(--radius-admin-input)",
          fontSize: "0.875rem",
          "& fieldset": {
            borderColor: "var(--color-admin-border)",
          },
          "&:hover fieldset": {
            borderColor: "var(--color-admin-primary)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--color-admin-primary)",
            borderWidth: 2,
          },
        },
        "& .MuiInputLabel-root": {
          fontSize: "0.875rem",
          color: "var(--color-admin-text-secondary)",
          "&.Mui-focused": {
            color: "var(--color-admin-primary)",
          },
        },
        "& .MuiFormHelperText-root": {
          fontSize: "0.75rem",
          marginLeft: 0,
        },
      }}
      {...props}
    />
  );
};

export default AdminInput;
