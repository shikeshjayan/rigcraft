import { CircularProgress, Box } from "@mui/material";

const Loading = ({ message = "Loading..." }) => {
  return (
    <Box className="flex flex-col items-center justify-center py-20 animate-admin-fade-in-up">
      <CircularProgress
        sx={{ color: "var(--color-admin-primary)" }}
        size={40}
      />
      <p className="mt-4 text-sm font-bold" style={{ color: "var(--color-admin-text-secondary)" }}>{message}</p>
    </Box>
  );
};

export default Loading;
