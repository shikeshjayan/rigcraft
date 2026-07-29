import Settings from "../models/settings.model.js";

const PUBLIC_PREFIXES = ["/api/v1/auth", "/api/v1/settings"];

const maintenanceMode = async (req, res, next) => {
  if (req.path.startsWith("/api/v1/admin/")) return next();
  if (PUBLIC_PREFIXES.some((p) => req.path.startsWith(p) || req.path === p)) return next();
  if (req.path.startsWith("/uploads")) return next();
  if (req.path === "/") return next();

  try {
    const settings = await Settings.findOne();
    if (settings?.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: settings.maintenanceMessage || "We'll be back soon!",
        data: { maintenanceMode: true },
      });
    }
  } catch {
    // fail open — if DB is unreachable let traffic through
  }

  next();
};

export default maintenanceMode;
