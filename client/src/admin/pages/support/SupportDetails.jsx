import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, TextField, MenuItem, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Send as SendIcon } from "@mui/icons-material";
import { supportService } from "../../services/supportService";
import { formatDateTime } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import StatusBadge from "../../components/common/StatusBadge";
import { extractError, humanizeField } from "../../utils/extractError";

const STATUS_COLOR = {
  open: "info",
  in_progress: "warning",
  resolved: "success",
  closed: "muted",
};

const SupportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    supportService.getById(id)
      .then(setTicket)
      .catch((err) => { toast(extractError(err, "Ticket not found"), "error"); navigate("/admin/support"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const result = await supportService.reply(id, replyText);
      setTicket((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), result],
      }));
      setReplyText("");
      toast("Reply sent");
    } catch (err) {
      toast(extractError(err, "Failed to send reply"), "error");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const updated = await supportService.updateStatus(id, status);
      setTicket(updated);
      toast(`Status changed to ${humanizeField(status)}`);
    } catch (err) {
      toast(extractError(err, "Failed to update status"), "error");
    }
  };

  const handlePriorityChange = async (priority) => {
    try {
      const updated = await supportService.updatePriority(id, priority);
      setTicket(updated);
      toast(`Priority changed to ${humanizeField(priority)}`);
    } catch (err) {
      toast(extractError(err, "Failed to update priority"), "error");
    }
  };

  if (loading) return <Loading />;
  if (!ticket) return null;

  const messages = ticket.messages || [];
  const hasMessages = messages.length > 0;

  const getCustomerName = () => {
    let name = ticket?.name || ticket.customer?.name;
    if (!name && ticket.description) {
      const match = ticket.description.match(/Name:\s*([^\n]+)/);
      if (match && match[1]) name = match[1].trim();
    }
    return name || "Unknown";
  };

  const getCustomerEmail = () => {
    let email = ticket.customer?.email;
    if (!email && ticket.description) {
      const match = ticket.description.match(/Email:\s*([^\n]+)/);
      if (match && match[1]) email = match[1].trim();
    }
    return email || "";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/support")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>{ticket.subject}</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>
            {getCustomerName()} &middot; {formatDateTime(ticket.createdAt)}
          </Typography>
        </Box>
        <StatusBadge status={ticket.status} colorMap={STATUS_COLOR} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3, maxHeight: 500, overflowY: "auto" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>
              Conversation {hasMessages && `(${messages.length})`}
            </Typography>

            {!hasMessages && (
              <Box sx={{ py: 4, textAlign: "center", color: "var(--color-admin-muted)" }}>
                <Typography variant="body2">No messages yet</Typography>
              </Box>
            )}

            {hasMessages && messages.map((msg, i) => {
              const isAdmin = msg.sender?.role === "admin" || msg.sender?.role === "manager";
              return (
                <Box
                  key={i}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: "var(--radius-admin-card)",
                    backgroundColor: isAdmin ? "var(--color-admin-primary-bg)" : "var(--color-admin-bg-tertiary)",
                    border: "1px solid var(--color-admin-border)",
                    ml: isAdmin ? 0 : 4,
                    mr: isAdmin ? 4 : 0,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>
                      {msg.sender?.name || "Unknown"} {isAdmin && <Chip label="Staff" size="small" sx={{ ml: 0.5, height: 18, fontSize: "0.6rem", borderRadius: "var(--radius-admin-badge)" }} />}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>{formatDateTime(msg.createdAt)}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.body || msg.message}</Typography>
                </Box>
              );
            })}
          </Box>

          {ticket.status !== "resolved" && ticket.status !== "closed" && (
            <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Reply</Typography>
              <TextField
                multiline
                rows={4}
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <AdminButton
                variant="primary"
                icon={<SendIcon />}
                onClick={handleReply}
                loading={sending}
                disabled={!replyText.trim()}
              >
                Send Reply
              </AdminButton>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Details</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Customer</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-admin-text)" }}>{getCustomerName()}</Typography>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>{getCustomerEmail()}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Status</Typography>
                <TextField
                  select
                  size="small"
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </TextField>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Priority</Typography>
                <TextField
                  select
                  size="small"
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </TextField>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Created</Typography>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>{formatDateTime(ticket.createdAt)}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Last Updated</Typography>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>{formatDateTime(ticket.updatedAt)}</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupportDetails;
