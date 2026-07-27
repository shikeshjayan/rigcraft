import { useState } from "react";
import { Box } from "@mui/material";

const AdminThumbnail = ({ src, alt = "", size = 36, fallback, sx = {} }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return fallback || (
      <Box sx={{
        width: size, height: size, borderRadius: "var(--radius-admin-badge)",
        backgroundColor: "var(--color-admin-bg-tertiary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, ...sx,
      }}>
        <Box sx={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--color-admin-muted)", textTransform: "uppercase" }}>
          ?
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: size, height: size, borderRadius: "var(--radius-admin-badge)",
      overflow: "hidden", border: "1px solid var(--color-admin-border)",
      flexShrink: 0, ...sx,
    }}>
      <Box
        component="img"
        src={src}
        alt={alt}
        onError={() => setError(true)}
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </Box>
  );
};

export default AdminThumbnail;
