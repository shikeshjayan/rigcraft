import { FormControl, InputLabel, Select as MuiSelect, MenuItem, FormHelperText } from "@mui/material";

const AdminSelect = ({ label, options, value, onChange, error, helperText, placeholder, ...props }) => {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel
        sx={{
          fontSize: "0.875rem",
          color: "var(--color-admin-text-secondary)",
          "&.Mui-focused": { color: "var(--color-admin-primary)" },
        }}
      >
        {label}
      </InputLabel>
      <MuiSelect
        value={value}
        onChange={onChange}
        label={label}
        displayEmpty
        sx={{
          borderRadius: "var(--radius-admin-input)",
          fontSize: "0.875rem",
          "& fieldset": { borderColor: "var(--color-admin-border)" },
          "&:hover fieldset": { borderColor: "var(--color-admin-primary)" },
          "&.Mui-focused fieldset": { borderColor: "var(--color-admin-primary)", borderWidth: 2 },
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
      </MuiSelect>
      {helperText && (
        <FormHelperText sx={{ fontSize: "0.75rem", marginLeft: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default AdminSelect;
