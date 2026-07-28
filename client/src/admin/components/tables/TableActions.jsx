import { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";

const TableActions = ({ actions = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        sx={{ color: "var(--color-admin-muted)" }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              borderRadius: "var(--radius-admin-modal)",
              boxShadow: "var(--shadow-admin-dropdown)",
            },
          }
        }}
      >
        {actions.map((action, idx) => {
          if (action.divider) {
            return <Divider key={idx} />;
          }

          const Icon = action.icon;

          return (
            <MenuItem
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
                action.onClick?.();
              }}
              sx={{
                fontSize: "0.8125rem",
                color: action.danger ? "var(--color-admin-danger)" : "var(--color-admin-text)",
              }}
            >
              {Icon && (
                <ListItemIcon sx={{ color: action.danger ? "var(--color-admin-danger)" : "var(--color-admin-text-secondary)" }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default TableActions;
