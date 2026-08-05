import { Paper, Typography, Box } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "var(--color-admin-card)",
          border: "1px solid var(--color-admin-border)",
          borderRadius: "var(--radius-admin-card)",
          p: 1.5,
          boxShadow: "var(--shadow-admin-dropdown)",
        }}
      >
        <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-admin-primary)" }}>
          ₹{payload[0].value.toLocaleString()}
        </Typography>
      </Box>
    );
  }
  return null;
};

const RevenueChart = ({ data = [] }) => {
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
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: "var(--color-admin-text)", mb: 0.5 }}
      >
        Revenue Overview
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "var(--color-admin-text-secondary)", mb: 3 }}
      >
        Monthly revenue for the last 12 months
      </Typography>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-admin-primary)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--color-admin-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border-light)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--color-admin-muted)" }}
            axisLine={{ stroke: "var(--color-admin-border-light)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-admin-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-admin-primary)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default RevenueChart;
