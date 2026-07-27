import { TextField } from "@mui/material";

const AdminTextarea = ({ label, rows = 4, error, helperText, ...props }) => {
  return (
    <TextField
      fullWidth
      label={label}
      error={error}
      helperText={helperText}
      multiline
      rows={rows}
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
      }}
      {...props}
    />
  );
};

export default AdminTextarea;
