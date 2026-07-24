import { ShoppingCart, AttachMoney, Inventory, People } from "@mui/icons-material";
import StatCard from "../../components/dashboard/StatCard";
import RevenueChart from "../../components/dashboard/RevenueChart";
import SalesChart from "../../components/dashboard/SalesChart";
import OrderChart from "../../components/dashboard/OrderChart";
import RecentOrders from "../../components/dashboard/RecentOrders";
import LowStockProducts from "../../components/dashboard/LowStockProducts";
import TopProducts from "../../components/dashboard/TopProducts";

const stats = [
  { title: "Total Revenue", value: "$45,234", icon: AttachMoney, change: "+12.5%", changeColor: "var(--color-admin-success)" },
  { title: "Orders", value: "242", icon: ShoppingCart, change: "+8.2%", changeColor: "var(--color-admin-success)" },
  { title: "Products", value: "1,234", icon: Inventory, change: "+3.1%", changeColor: "var(--color-admin-success)" },
  { title: "Customers", value: "892", icon: People, change: "+5.7%", changeColor: "var(--color-admin-success)" },
];

const Dashboard = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-admin-text">Dashboard</h1>
        <p className="text-admin-text-secondary text-sm mt-1">
          Overview of your store performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RevenueChart />
        <SalesChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2">
          <RecentOrders />
        </div>
        <OrderChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LowStockProducts />
        <TopProducts />
      </div>
    </div>
  );
};

export default Dashboard;
