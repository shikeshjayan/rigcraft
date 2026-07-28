import { TextField } from "@mui/material";

const AdminInput = ({ label, error, helperText, type, inputProps, InputLabelProps: inputLabelPropsProp, InputProps: inputPropsProp, onKeyDown, onChange, onBlur, min, ...props }) => {
  const isNumber = type === "number";
  const isDate = type === "datetime-local" || type === "date" || type === "time" || type === "month" || type === "week";

  const mergedInputProps = isNumber
    ? { min: min ?? 0, ...inputProps }
    : inputProps;

  const mergedInputLabelProps = isDate
    ? { shrink: true, ...inputLabelPropsProp }
    : inputLabelPropsProp;

  const mergedInputWrapperProps = isDate || inputLabelPropsProp?.shrink
    ? { notched: true, ...inputPropsProp }
    : inputPropsProp;

  const focused = isDate || undefined;

  const handleKeyDown = (e) => {
    if (isNumber && (e.key === "e" || e.key === "E" || e.key === "-" || e.key === "+")) {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  const handleChange = (e) => {
    if (isNumber && e.target.value !== "" && Number(e.target.value) < 0) {
      onChange?.(0);
      return;
    }
    onChange?.(e);
  };

  const handleWheel = (e) => {
    if (isNumber) e.target.blur();
  };

  return (
    <TextField
      fullWidth
      label={label}
      error={error}
      helperText={helperText}
      variant="outlined"
      type={type}
      focused={focused}
      slotProps={{
        htmlInput: mergedInputProps,
        inputLabel: mergedInputLabelProps,
        input: mergedInputWrapperProps,
      }}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={onBlur}
      onWheel={handleWheel}
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
    />
  );
};

export default AdminInput;
