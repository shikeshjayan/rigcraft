import { Paper, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_COLORS = {
  pending: "var(--color-admin-warning)",
  confirmed: "var(--color-admin-info)",
  processing: "var(--color-admin-info)",
  shipped: "var(--color-admin-primary)",
  delivered: "var(--color-admin-success)",
  cancelled: "var(--color-admin-danger)",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const total = payload[0].payload.total || 1;
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
        <Typography variant="body2" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
          {payload[0].name}: {payload[0].value}
        </Typography>
        <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>
          {((payload[0].value / total) * 100).toFixed(1)}%
        </Typography>
      </Box>
    );
  }
  return null;
};

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", mt: 2 }}>
      {payload.map((entry, index) => (
        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: entry.color }} />
          <Typography variant="caption" sx={{ color: "var(--color-admin-text-secondary)", textTransform: "capitalize" }}>
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const OrderChart = ({ data = [] }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const chartData = data.map((d) => ({
    name: d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] || "var(--color-admin-muted)",
    total: data.reduce((s, item) => s + item.count, 0),
  }));

  const total = chartData.reduce((a, b) => a + b.value, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "var(--radius-admin-card)",
        border: "1px solid var(--color-admin-border)",
        backgroundColor: "var(--color-admin-card)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: "var(--color-admin-text)", mb: 0.5 }}
      >
        Order Status
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "var(--color-admin-text-secondary)", mb: 3 }}
      >
        Total orders: {total}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={isSmall ? 44 : 60}
            outerRadius={isSmall ? 74 : 100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default OrderChart;
