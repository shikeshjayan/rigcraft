import { useState } from "react";
import { Box } from "@mui/material";
import SiteLogoPlaceholder from "./SiteLogoPlaceholder";

const AdminThumbnail = ({ src, alt = "", size = 36, fallback, sx = {} }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return fallback || <SiteLogoPlaceholder size={size} sx={sx} />;
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
