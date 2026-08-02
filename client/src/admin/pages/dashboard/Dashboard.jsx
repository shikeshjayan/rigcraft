import { useEffect, useState } from "react";
import { ShoppingCart, AttachMoney, Inventory, People } from "@mui/icons-material";
import StatCard from "../../components/dashboard/StatCard";
import { useToast } from "../../components/common/Toast";
import RevenueChart from "../../components/dashboard/RevenueChart";
import SalesChart from "../../components/dashboard/SalesChart";
import OrderChart from "../../components/dashboard/OrderChart";
import RecentOrders from "../../components/dashboard/RecentOrders";
import LowStockProducts from "../../components/dashboard/LowStockProducts";
import TopProducts from "../../components/dashboard/TopProducts";
import { dashboardService } from "../../services/dashboardService";
import { extractError } from "../../utils/extractError";
import { formatCurrency } from "../../utils/formatCurrency";

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderBreakdown, setOrderBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          dashboardService.getStats(),
          dashboardService.getSalesData("yearly"),
          dashboardService.getRecentOrders(5),
          dashboardService.getLowStockProducts(10),
          dashboardService.getTopProducts(5),
          dashboardService.getOrderBreakdown(),
        ]);

        const getValue = (i) => (results[i]?.status === "fulfilled" ? results[i].value : []);
        const getObject = (i) => (results[i]?.status === "fulfilled" ? results[i].value : null);

        setStats(getObject(0));
        setSalesData(getValue(1));
        setRecentOrders(getValue(2));
        setLowStockProducts(getValue(3));
        setTopProducts(getValue(4));
        setOrderBreakdown(getValue(5));

        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0 && failed.length < results.length) {
          toast("Some dashboard sections could not be loaded.", "warning");
        } else if (failed.length === results.length) {
          toast(extractError(failed[0].reason, "Failed to load dashboard data"), "error");
        }
      } catch (err) {
        toast(extractError(err, "Failed to load dashboard data"), "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const changeStr = (val) => {
    const num = val ?? 0;
    return `${num >= 0 ? "+" : ""}${num}%`;
  };
  const isPositive = (val) => (val ?? 0) >= 0;

  const statCards = stats
    ? [
        { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: AttachMoney, change: changeStr(stats.revenueChange), changeColor: isPositive(stats.revenueChange) ? "var(--color-admin-success)" : "var(--color-admin-danger)" },
        { title: "Orders", value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, change: changeStr(stats.ordersChange), changeColor: isPositive(stats.ordersChange) ? "var(--color-admin-success)" : "var(--color-admin-danger)" },
        { title: "Products", value: stats.totalProducts.toLocaleString(), icon: Inventory, change: changeStr(stats.productsChange), changeColor: isPositive(stats.productsChange) ? "var(--color-admin-success)" : "var(--color-admin-danger)" },
        { title: "Customers", value: stats.totalCustomers.toLocaleString(), icon: People, change: changeStr(stats.customersChange), changeColor: isPositive(stats.customersChange) ? "var(--color-admin-success)" : "var(--color-admin-danger)" },
      ]
    : [];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

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
        {statCards.map((card, idx) => (
          <div key={card.title} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-admin-fade-in-up opacity-0">
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.4s" }}>
          <RevenueChart data={salesData} />
        </div>
        <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.5s" }}>
          <SalesChart data={salesData} />
        </div>
      </div>

      <div className="grid grid-rows-2 gap-4 mb-6" style={{ minHeight: 520 }}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
          <div className="xl:col-span-2 animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.6s" }}>
            <RecentOrders orders={recentOrders} />
          </div>
          <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.7s" }}>
            <OrderChart data={orderBreakdown} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.8s" }}>
            <LowStockProducts products={lowStockProducts} />
          </div>
          <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.9s" }}>
            <TopProducts products={topProducts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
