import { FormControlLabel, Switch as MuiSwitch } from "@mui/material";

const AdminSwitch = ({ label, checked, onChange, ...props }) => {
  return (
    <FormControlLabel
      control={
        <MuiSwitch
          checked={checked}
          onChange={onChange}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "var(--color-admin-primary)",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "var(--color-admin-primary)",
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

export default AdminSwitch;
