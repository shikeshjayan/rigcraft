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
      <div className="mb-6 animate-admin-fade-in-down">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: "var(--color-admin-primary)" }} />
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-admin-text)" }}>
            Dashboard
          </h1>
        </div>
        <p className="text-sm font-medium ml-3" style={{ color: "var(--color-admin-text-secondary)" }}>
          Overview of your store performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((card, idx) => (
          <div key={card.title} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-admin-fade-in-up opacity-0">
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.4s" }}>
          <RevenueChart />
        </div>
        <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.5s" }}>
          <SalesChart />
        </div>
      </div>

      <div className="grid grid-rows-2 gap-4 mb-6" style={{ minHeight: 520 }}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
          <div className="xl:col-span-2 animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.6s" }}>
            <RecentOrders />
          </div>
          <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.7s" }}>
            <OrderChart />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.8s" }}>
            <LowStockProducts />
          </div>
          <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.9s" }}>
            <TopProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
