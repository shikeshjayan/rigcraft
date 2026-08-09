import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, TextField, MenuItem, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Send as SendIcon, AttachFile as AttachFileIcon } from "@mui/icons-material";
import { supportService } from "../../services/supportService";
import { formatDateTime } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { extractError, humanizeField } from "../../utils/extractError";
import { connectSocket, joinSupportRoom, leaveSupportRoom } from "../../../shared/socket";

const STATUS_COLOR = {
  open: "info",
  in_progress: "warning",
  waiting_customer: "warning",
  resolved: "success",
  closed: "muted",
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageFile = (att) =>
  (att.mimeType || "").startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(att.url || "");

const fileTypeLabel = (att) => {
  const mime = (att.mimeType || "").toLowerCase();
  if (mime.includes("pdf") || /\.pdf$/i.test(att.url || "")) return "PDF";
  if (mime.includes("word") || /\.docx?$/i.test(att.url || "")) return "DOC";
  if (mime.includes("excel") || mime.includes("spreadsheet") || /\.xlsx?$/i.test(att.url || "")) return "XLS";
  if (mime.includes("presentation") || /\.pptx?$/i.test(att.url || "")) return "PPT";
  if (mime.startsWith("text/") || /\.(txt|csv)$/i.test(att.url || "")) return "TXT";
  if (mime.includes("zip") || mime.includes("rar") || /\.(zip|rar)$/i.test(att.url || "")) return "ZIP";
  return "FILE";
};

const SupportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    supportService.getById(id)
      .then(setTicket)
      .catch((err) => { toast(extractError(err, "Ticket not found"), "error"); navigate("/admin/support"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  useEffect(() => {
    if (!id) return;
    const sock = connectSocket();
    const handleNewMessage = (message) => {
      if (!message) return;
      const msgTicketId = (message.ticket?._id || message.ticket)?.toString();
      if (msgTicketId && msgTicketId !== id) return;
      setTicket((prev) => {
        if (!prev) return prev;
        if (prev.messages?.some((m) => m._id === message._id)) return prev;
        return { ...prev, messages: [...(prev.messages || []), message] };
      });
    };
    const handleTicketUpdate = (updated) => {
      if (!updated) return;
      const updatedId = (updated._id || updated.id)?.toString();
      if (updatedId && updatedId !== id) return;
      setTicket((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: updated.status ?? prev.status,
          priority: updated.priority ?? prev.priority,
          lastMessageAt: updated.lastMessageAt ?? prev.lastMessageAt,
          closedAt: updated.closedAt ?? prev.closedAt,
          assignedTo: updated.assignedTo ?? prev.assignedTo,
          order: updated.order ?? prev.order,
          messages: prev.messages,
        };
      });
    };
    const handleReadStatus = ({ ticketId }) => {
      if (ticketId && ticketId.toString() === id) {
        setTicket((prev) => (prev ? { ...prev, isRead: true } : prev));
      }
    };
    joinSupportRoom(id);
    sock.on("support:new-message", handleNewMessage);
    sock.on("support:ticket-updated", handleTicketUpdate);
    sock.on("support:read-status", handleReadStatus);
    return () => {
      sock.off("support:new-message", handleNewMessage);
      sock.off("support:ticket-updated", handleTicketUpdate);
      sock.off("support:read-status", handleReadStatus);
      leaveSupportRoom(id);
    };
  }, [id]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const result = await supportService.reply(id, replyText, replyFiles);
      setTicket((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), result.message],
      }));
      setReplyText("");
      setReplyFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast("Reply sent");
    } catch (err) {
      toast(extractError(err, "Failed to send reply"), "error");
    } finally {
      setSending(false);
    }
  };

  const handleAttach = (e) => {
    const files = Array.from(e.target.files || []);
    setReplyFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
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

  const handleCancelOrder = async () => {
    if (!ticket?.order?._id) return;
    setCancelling(true);
    try {
      await supportService.cancelOrder(ticket.order._id);
      setTicket((prev) => ({
        ...prev,
        order: { ...prev.order, orderStatus: "cancelled" },
      }));
      toast("Order cancelled");
    } catch (err) {
      toast(extractError(err, "Failed to cancel order"), "error");
    } finally {
      setCancelling(false);
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

  const getSenderName = (msg) => {
    const s = msg.sender;
    const full = [s?.firstName, s?.lastName].filter(Boolean).join(" ");
    if (full) return full;
    if (s?.email) return s.email;
    return msg.senderRole === "customer" ? "Customer" : "Staff";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/support")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, overflowWrap: "break-word" }}>{ticket.subject}</Typography>
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
                      {getSenderName(msg)} {isAdmin && <Chip label="Staff" size="small" sx={{ ml: 0.5, height: 18, fontSize: "0.6rem", borderRadius: "var(--radius-admin-badge)" }} />}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>{formatDateTime(msg.createdAt)}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.body || msg.message}</Typography>
                  {Array.isArray(msg.attachments) && msg.attachments.filter((a) => a && a.url).length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                      {msg.attachments.filter((a) => a && a.url).map((att, i) =>
                        isImageFile(att) ? (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={att.url}
                              alt={att.originalName || "attachment"}
                              style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "var(--radius-admin-badge)", border: "1px solid var(--color-admin-border)", display: "block" }}
                            />
                          </a>
                        ) : (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: "var(--radius-admin-badge)", border: "1px solid var(--color-admin-border)", backgroundColor: "var(--color-admin-bg-tertiary)", textDecoration: "none" }}
                          >
                            <AttachFileIcon sx={{ fontSize: 16, color: "var(--color-admin-primary)" }} />
                            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-admin-text)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.originalName || "File"}</span>
                            {att.size ? <span style={{ fontSize: "0.65rem", color: "var(--color-admin-muted)" }}>{formatBytes(att.size)}</span> : null}
                            <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.04em", color: "#dc2626", backgroundColor: "rgba(220,38,38,0.08)", borderRadius: "var(--radius-admin-badge)", padding: "2px 6px" }}>{fileTypeLabel(att)}</span>
                          </a>
                        )
                      )}
                    </Box>
                  )}
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
              {replyFiles.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {replyFiles.map((f, i) => (
                    <Box key={i} sx={{ position: "relative" }}>
                      {f.type.startsWith("image/") ? (
                        <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "var(--radius-admin-badge)", border: "1px solid var(--color-admin-border)", display: "block" }} />
                      ) : (
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 6, height: 56, px: 1.5, borderRadius: "var(--radius-admin-badge)", border: "1px solid var(--color-admin-border)", backgroundColor: "var(--color-admin-bg-tertiary)", maxWidth: 180 }}>
                          <AttachFileIcon sx={{ fontSize: 16, color: "var(--color-admin-primary)" }} />
                          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-admin-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                        </Box>
                      )}
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setReplyFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        sx={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", backgroundColor: "var(--color-admin-danger)", color: "#fff", fontSize: 10, lineHeight: "18px", textAlign: "center", cursor: "pointer", border: "none", p: 0 }}
                      >
                        ×
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 600, color: "var(--color-admin-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <AttachFileIcon fontSize="small" />
                  Attach Files
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleAttach}
                  />
                </label>
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
                  <MenuItem value="waiting_customer">Waiting on Customer</MenuItem>
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

              {ticket.order && typeof ticket.order === "object" && ticket.order._id && (
                <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", backgroundColor: "var(--color-admin-bg-tertiary)" }}>
                  <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Related Order</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-admin-text)", overflowWrap: "break-word" }}>
                    {ticket.order.orderNumber ? `#${ticket.order.orderNumber}` : ticket.order._id}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", textTransform: "capitalize" }}>
                    {ticket.order.orderStatus || "—"}
                  </Typography>
                  {(ticket.order.orderStatus === "pending" || ticket.order.orderStatus === "confirmed") && (
                    <AdminButton
                      variant="danger"
                      size="small"
                      fullWidth
                      loading={cancelling}
                      onClick={() => setConfirmCancel(true)}
                      sx={{ mt: 1 }}
                    >
                      Cancel Order
                    </AdminButton>
                  )}
                </Box>
              )}

              <ConfirmDialog
                open={confirmCancel}
                title="Cancel Order?"
                message="Are you sure you want to cancel this customer's order? This action is irreversible."
                confirmLabel="Yes, Cancel Order"
                cancelLabel="No, Keep Order"
                severity="danger"
                loading={cancelling}
                onConfirm={() => {
                  handleCancelOrder();
                  setConfirmCancel(false);
                }}
                onCancel={() => setConfirmCancel(false)}
              />

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
