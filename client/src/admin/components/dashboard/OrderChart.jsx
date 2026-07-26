import { Paper, Typography, Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Pending", value: 24, color: "var(--color-admin-warning)" },
  { name: "Processing", value: 18, color: "var(--color-admin-info)" },
  { name: "Shipped", value: 32, color: "var(--color-admin-primary)" },
  { name: "Delivered", value: 156, color: "var(--color-admin-success)" },
  { name: "Cancelled", value: 12, color: "var(--color-admin-danger)" },
];

const CustomTooltip = ({ active, payload }) => {
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
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {payload[0].name}: {payload[0].value}
        </Typography>
        <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>
          {((payload[0].value / data.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
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
          <Typography variant="caption" sx={{ color: "var(--color-admin-text-secondary)" }}>
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const OrderChart = () => {
  const total = data.reduce((a, b) => a + b.value, 0);

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
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
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
