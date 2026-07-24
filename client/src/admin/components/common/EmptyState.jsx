import { Box } from "@mui/material";
import { Inbox as InboxIcon } from "@mui/icons-material";

const EmptyState = ({ icon, title, description, action }) => {
  const Icon = icon || InboxIcon;

  return (
    <Box className="flex flex-col items-center justify-center py-20 text-center">
      <Icon
        sx={{
          fontSize: 64,
          color: "var(--color-admin-muted)",
          mb: 2,
        }}
      />
      <h3 className="text-lg font-medium text-admin-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-admin-text-secondary max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Box>
  );
};

export default EmptyState;
