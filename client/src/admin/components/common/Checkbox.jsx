import { Checkbox as MuiCheckbox, FormControlLabel } from "@mui/material";

const AdminCheckbox = ({ label, checked, onChange, ...props }) => {
  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={checked}
          onChange={onChange}
          sx={{
            color: "var(--color-admin-border)",
            "&.Mui-checked": {
              color: "var(--color-admin-primary)",
            },
          }}
          {...props}
        />
      }
      label={label}
      sx={{
        "& .MuiFormControlLabel-label": {
          fontSize: "0.875rem",
          color: "var(--color-admin-text)",
        },
      }}
    />
  );
};

export default AdminCheckbox;
