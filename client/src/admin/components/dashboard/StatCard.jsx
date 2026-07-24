import { Paper, Box, Typography } from "@mui/material";

const StatCard = ({ title, value, icon: Icon, change, changeColor, subtitle }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "var(--radius-admin-card)",
        border: "1px solid var(--color-admin-border)",
        backgroundColor: "var(--color-admin-card)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <Typography
          variant="body2"
          sx={{ color: "var(--color-admin-text-secondary)" }}
        >
          {title}
        </Typography>
        {Icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-admin-button)",
              backgroundColor: "var(--color-admin-primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              sx={{ color: "var(--color-admin-primary)", fontSize: 20 }}
            />
          </Box>
        )}
      </div>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "var(--color-admin-text)",
          mb: 0.5,
        }}
      >
        {value}
      </Typography>
      {(change || subtitle) && (
        <Typography
          variant="caption"
          sx={{ color: changeColor || "var(--color-admin-muted)" }}
        >
          {subtitle || `${change} from last month`}
        </Typography>
      )}
    </Paper>
  );
};

export default StatCard;
