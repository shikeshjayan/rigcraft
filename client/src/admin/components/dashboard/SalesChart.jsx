import { Paper, Typography, Box } from "@mui/material";
import {
  BarChart,
  Bar,
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
        {payload.map((entry, i) => (
          <Typography key={i} variant="body2" sx={{ fontWeight: 600, color: entry.color }}>
            {entry.name === "orders" ? `${entry.value} orders` : `$${entry.value.toLocaleString()}`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const SalesChart = ({ data = [] }) => {
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
        Sales Analytics
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "var(--color-admin-text-secondary)", mb: 3 }}
      >
        Monthly orders and revenue comparison
      </Typography>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border-light)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--color-admin-muted)" }}
            axisLine={{ stroke: "var(--color-admin-border-light)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: "var(--color-admin-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "var(--color-admin-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="orders"
            name="orders"
            fill="var(--color-admin-primary)"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Bar
            yAxisId="right"
            dataKey="revenue"
            name="revenue"
            fill="var(--color-admin-info)"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default SalesChart;
