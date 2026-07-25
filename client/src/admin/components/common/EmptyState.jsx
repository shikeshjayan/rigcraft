import { Box } from "@mui/material";
import { Inbox as InboxIcon } from "@mui/icons-material";

const EmptyState = ({ icon, title, description, action }) => {
  const Icon = icon || InboxIcon;

  return (
    <Box className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="flex items-center justify-center mb-6"
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.08) 100%)",
          border: "1px solid rgba(37,99,235,0.15)",
        }}
      >
        <Icon
          sx={{
            fontSize: 36,
            color: "var(--color-admin-muted)",
          }}
        />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: "linear-gradient(135deg, var(--color-admin-primary) 0%, var(--color-admin-primary-light) 100%)" }}
        />
        <h3 className="text-lg font-extrabold" style={{ color: "var(--color-admin-text)" }}>{title}</h3>
      </div>
      {description && (
        <p className="text-sm font-medium max-w-md" style={{ color: "var(--color-admin-text-secondary)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Box>
  );
};

export default EmptyState;
