import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { settingsService } from "../../services/settingsService";

let cached = null;

const SiteLogoPlaceholder = ({ size = 36, sx = {} }) => {
  const [logo, setLogo] = useState(() => cached);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (cached) {
      setLogo(cached);
      return;
    }
    settingsService.getPublic()
      .then((data) => {
        const l = data?.general?.logo || null;
        cached = l;
        setLogo(l);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [logo?.url]);

  const boxSx = {
    width: size,
    height: size,
    borderRadius: "var(--radius-admin-badge)",
    border: "1px solid var(--color-admin-border)",
    backgroundColor: "var(--color-admin-bg-tertiary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    ...sx,
  };

  if (logo?.url && !imgError) {
    return (
      <Box sx={boxSx}>
        <Box
          component="img"
          src={logo.url}
          alt={logo.alt || "Logo"}
          onError={() => setImgError(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            p: size > 60 ? 1.5 : size > 36 ? 1 : 0.5,
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={boxSx}>
      <Typography sx={{ fontSize: size >= 80 ? "0.55rem" : "0.5rem", fontWeight: 600, color: "var(--color-admin-muted)", textAlign: "center", lineHeight: 1.2, px: 0.5 }}>
        No Image
      </Typography>
    </Box>
  );
};

export default SiteLogoPlaceholder;
