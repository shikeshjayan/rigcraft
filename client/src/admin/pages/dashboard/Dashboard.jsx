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
import { usePermissions } from "../../hooks";
import { PERMISSIONS } from "../../constants/permissions";

const Dashboard = () => {
   const { toast } = useToast();
   const { hasPermission } = usePermissions();
   const [stats, setStats] = useState(null);
   const [salesData, setSalesData] = useState([]);
   const [recentOrders, setRecentOrders] = useState([]);
   const [lowStockProducts, setLowStockProducts] = useState([]);
   const [topProducts, setTopProducts] = useState([]);
   const [orderBreakdown, setOrderBreakdown] = useState([]);
   const [loading, setLoading] = useState(true);

const hasAnyDashboardPermission = hasPermission(PERMISSIONS.dashboard.read) ||
   hasPermission(PERMISSIONS.dashboard.sales) ||
   hasPermission(PERMISSIONS.dashboard.recentOrders) ||
   hasPermission(PERMISSIONS.dashboard.lowStock) ||
   hasPermission(PERMISSIONS.dashboard.topProducts) ||
   hasPermission(PERMISSIONS.dashboard.orderBreakdown);

useEffect(() => {
     if (!hasAnyDashboardPermission) {
       setLoading(false);
       return;
     }

     const fetchData = async () => {
       try {
         const requests = [];
         const requestLabels = [];

         if (hasPermission(PERMISSIONS.dashboard.read)) {
           requests.push(dashboardService.getStats());
           requestLabels.push("stats");
         }
         if (hasPermission(PERMISSIONS.dashboard.sales)) {
           requests.push(dashboardService.getSalesData("yearly"));
           requestLabels.push("salesData");
         }
         if (hasPermission(PERMISSIONS.dashboard.recentOrders)) {
           requests.push(dashboardService.getRecentOrders(5));
           requestLabels.push("recentOrders");
         }
         if (hasPermission(PERMISSIONS.dashboard.lowStock)) {
           requests.push(dashboardService.getLowStockProducts(10));
           requestLabels.push("lowStockProducts");
         }
         if (hasPermission(PERMISSIONS.dashboard.topProducts)) {
           requests.push(dashboardService.getTopProducts(5));
           requestLabels.push("topProducts");
         }
         if (hasPermission(PERMISSIONS.dashboard.orderBreakdown)) {
           requests.push(dashboardService.getOrderBreakdown());
           requestLabels.push("orderBreakdown");
         }

         // If no permissions, return early
         if (requests.length === 0) {
           setLoading(false);
           return;
         }

         const results = await Promise.allSettled(requests);

         // Map results back to state variables
         results.forEach((result, index) => {
           const label = requestLabels[index];
           if (result.status === "fulfilled") {
             switch (label) {
               case "stats": setStats(result.value); break;
               case "salesData": setSalesData(result.value); break;
               case "recentOrders": setRecentOrders(result.value); break;
               case "lowStockProducts": setLowStockProducts(result.value); break;
               case "topProducts": setTopProducts(result.value); break;
               case "orderBreakdown": setOrderBreakdown(result.value); break;
             }
           }
         });

         // Only show toast for failed requests that are NOT 403 errors
         const failed = results.filter(r => r.status === "rejected");
         if (failed.length > 0) {
           const nonPermissionErrors = failed.filter(f => {
             // Check if error is a 403 (permission denied)
             // For now, we'll show toast for all failures and improve later if needed
             return true; // Show all errors for now
           });
           if (nonPermissionErrors.length > 0) {
             if (nonPermissionErrors.length < results.length) {
               toast("Some dashboard sections could not be loaded.", "warning");
             } else {
               toast(extractError(nonPermissionErrors[0].reason, "Failed to load dashboard data"), "error");
             }
           }
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
         { title: "Total Revenue", value: formatCurrency(stats?.totalRevenue ?? 0), icon: AttachMoney, change: changeStr(stats?.revenueChange ?? 0), changeColor: isPositive(stats?.revenueChange ?? 0) ? "var(--color-admin-success)" : "var(--color-admin-danger)" },
         { title: "Orders", value: (stats?.totalOrders ?? 0).toLocaleString(), icon: ShoppingCart, change: changeStr(stats?.ordersChange ?? 0), changeColor: isPositive(stats?.ordersChange ?? 0) ? "var(--color-admin-success)" : "var(--color-admin-danger)" },
         { title: "Products", value: (stats?.totalProducts ?? 0).toLocaleString(), icon: Inventory, change: changeStr(stats?.productsChange ?? 0), changeColor: isPositive(stats?.productsChange ?? 0) ? "var(--color-admin-success)" : "var(--color-admin-danger)" },
         { title: "Customers", value: (stats?.totalCustomers ?? 0).toLocaleString(), icon: People, change: changeStr(stats?.customersChange ?? 0), changeColor: isPositive(stats?.customersChange ?? 0) ? "var(--color-admin-success)" : "var(--color-admin-danger)" },
       ]
     : [];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hasAnyDashboardPermission) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-admin-text)" }}>Access Denied</h2>
          <p className="text-sm" style={{ color: "var(--color-admin-text-secondary)" }}>
            You don't have permission to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

   const canRead = hasPermission(PERMISSIONS.dashboard.read);
   const canSales = hasPermission(PERMISSIONS.dashboard.sales);
   const canRecentOrders = hasPermission(PERMISSIONS.dashboard.recentOrders);
   const canLowStock = hasPermission(PERMISSIONS.dashboard.lowStock);
   const canTopProducts = hasPermission(PERMISSIONS.dashboard.topProducts);
   const canOrderBreakdown = hasPermission(PERMISSIONS.dashboard.orderBreakdown);

   return (
    <div className="p-4 md:p-6">
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

      {canRead && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, idx) => (
            <div key={card.title} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-admin-fade-in-up opacity-0">
              <StatCard {...card} />
            </div>
          ))}
        </div>
      )}

      {canSales && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.4s" }}>
            <RevenueChart data={salesData} />
          </div>
          <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.5s" }}>
            <SalesChart data={salesData} />
          </div>
        </div>
      )}

      {(canRecentOrders || canOrderBreakdown || canLowStock || canTopProducts) && (
        <div className="flex flex-col gap-4 mb-6">
          {(canRecentOrders || canOrderBreakdown) && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
              {canRecentOrders && (
                <div className="xl:col-span-2 animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.6s" }}>
                  <RecentOrders orders={recentOrders} />
                </div>
              )}
              {canOrderBreakdown && (
                <div className={`animate-admin-fade-in-up opacity-0 ${!canRecentOrders ? "xl:col-span-3" : ""}`} style={{ animationDelay: "0.7s" }}>
                  <OrderChart data={orderBreakdown} />
                </div>
              )}
            </div>
          )}
          {(canLowStock || canTopProducts) && (
            <div className={`grid gap-4 min-h-0 ${canLowStock && canTopProducts ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
              {canLowStock && (
                <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.8s" }}>
                  <LowStockProducts products={lowStockProducts} />
                </div>
              )}
              {canTopProducts && (
                <div className="animate-admin-fade-in-up opacity-0" style={{ animationDelay: "0.9s" }}>
                  <TopProducts products={topProducts} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
