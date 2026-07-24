import { TextField, MenuItem } from "@mui/material";

const AdminSelect = ({ label, options, value, onChange, error, helperText, placeholder, ...props }) => {
  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      variant="outlined"
      SelectProps={{ displayEmpty: true }}
      InputLabelProps={{ shrink: !!value || !!placeholder || undefined }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "var(--radius-admin-input)",
          fontSize: "0.875rem",
          "& fieldset": {
            borderColor: "var(--color-admin-border)",
            borderWidth: 2,
          },
          "&:hover fieldset": {
            borderColor: "var(--color-admin-primary)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--color-admin-primary)",
          },
        },
        "& .MuiInputLabel-root": {
          fontSize: "0.875rem",
          color: "var(--color-admin-text-secondary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "calc(100% - 24px)",
          "&.MuiInputLabel-shrink": {
            transform: "translate(14px, -9px) scale(0.75)",
          },
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
    >
      {placeholder && (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      )}
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default AdminSelect;
