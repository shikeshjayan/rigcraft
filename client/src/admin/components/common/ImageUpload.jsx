import { useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { CloudUpload as UploadIcon, Close as CloseIcon } from "@mui/icons-material";

const ImageUpload = ({ images = [], onChange, maxFiles = 5, multiple = true }) => {
  const inputRef = useRef(null);

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = maxFiles - images.length;
    const selected = files.slice(0, remaining);

    const newImages = selected.map((file) => ({
      id: Math.random().toString(36).substring(2),
      file,
      preview: URL.createObjectURL(file),
    }));

    onChange([...images, ...newImages]);
    e.target.value = "";
  };

  const handleRemove = (id) => {
    const updated = images.filter((img) => img.id !== id);
    onChange(updated);
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {images.map((img) => (
          <Box
            key={img.id}
            sx={{
              width: 100,
              height: 100,
              borderRadius: "var(--radius-admin-button)",
              border: "1px solid var(--color-admin-border)",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <img
              src={img.preview}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <IconButton
              size="small"
              onClick={() => handleRemove(img.id)}
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "var(--color-admin-white)",
                width: 22,
                height: 22,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        ))}

        {images.length < maxFiles && (
          <Box
            onClick={handleSelect}
            sx={{
              width: 100,
              height: 100,
              borderRadius: "var(--radius-admin-button)",
              border: "2px dashed var(--color-admin-border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backgroundColor: "var(--color-admin-bg-tertiary)",
              "&:hover": {
                borderColor: "var(--color-admin-primary)",
                backgroundColor: "var(--color-admin-bg-primary)",
              },
            }}
          >
            <UploadIcon sx={{ color: "var(--color-admin-muted)", fontSize: 28 }} />
            <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", mt: 0.5 }}>
              Upload
            </Typography>
          </Box>
        )}
      </Box>

      <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", mt: 1, display: "block" }}>
        {images.length}/{maxFiles} files • JPG, PNG, WEBP
      </Typography>
    </Box>
  );
};

export default ImageUpload;
