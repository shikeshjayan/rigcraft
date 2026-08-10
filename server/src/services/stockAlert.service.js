import stockAlertRepository from "../repositories/stockAlert.repository.js";
import productRepository from "../repositories/product.repository.js";
import prebuiltPCRepository from "../repositories/prebuiltPC.repository.js";
import userRepository from "../repositories/user.repository.js";
import ApiError from "../utils/ApiError.js";
import { CART_ITEM_TYPES } from "../constants/constants.js";
import { sendEmail } from "./email.service.js";
import { createNotification } from "./notification.service.js";

const ITEM_MODEL_MAP = {
  [CART_ITEM_TYPES.PRODUCT]: "Product",
  [CART_ITEM_TYPES.PREBUILT]: "PrebuiltPC",
};

const getItemByType = async (itemType, itemId) => {
  if (itemType === CART_ITEM_TYPES.PRODUCT) {
    const product = await productRepository.findById(itemId);
    if (product.isDeleted) throw ApiError.notFound("Product not found");
    return product;
  }

  if (itemType === CART_ITEM_TYPES.PREBUILT) {
    const prebuilt = await prebuiltPCRepository.findById(itemId);
    if (prebuilt.isDeleted) throw ApiError.notFound("Prebuilt PC not found");
    return prebuilt;
  }

  throw ApiError.badRequest("Invalid item type");
};

export const subscribe = async (userId, { itemType, itemId }) => {
  const item = await getItemByType(itemType, itemId);

  if ((item.stock ?? 0) > 0) {
    throw ApiError.badRequest("This item is currently in stock");
  }

  const existing = await stockAlertRepository.findByUserAndItem(
    userId,
    itemType,
    itemId
  );

  if (existing) {
    if (existing.status === "pending") {
      throw ApiError.conflict("You're already subscribed for this item");
    }

    existing.status = "pending";
    existing.notifiedAt = null;
    await existing.save();
    return existing;
  }

  return stockAlertRepository.create({
    user: userId,
    itemType,
    item: item._id,
    itemModel: ITEM_MODEL_MAP[itemType],
  });
};

export const getMyAlerts = async (userId, query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 20);

  const [alerts, total] = await Promise.all([
    stockAlertRepository.findByUser(userId, { page, limit }),
    stockAlertRepository.count({ user: userId }),
  ]);

  await Promise.all(alerts.map((alert) => alert.populate("item")));

  return {
    alerts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const cancel = async (userId, alertId) => {
  const alert = await stockAlertRepository.findById(alertId);

  if (alert.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only cancel your own stock alerts");
  }

  return stockAlertRepository.updateById(alertId, { status: "cancelled" });
};

export const notifyRestockIfNeeded = async (
  itemType,
  itemId,
  oldStock,
  newStock
) => {
  const prev = Number(oldStock ?? 0);
  const next = Number(newStock ?? 0);

  if (prev > 0 || next <= 0) return;

  const item = await getItemByType(itemType, itemId);
  const alerts = await stockAlertRepository.findPendingByItem(itemType, itemId);
  if (alerts.length === 0) return;

  const actionUrl = `/detail/${item.slug}/${item._id}?type=${itemType}`;

  for (const alert of alerts) {
    try {
      const user = await userRepository.findById(alert.user);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: `Back in stock: ${item.name}`,
          html: `<p>Good news! <strong>${item.name}</strong> is back in stock at RigCraft.</p><p><a href="${actionUrl}">View product</a></p>`,
        });
      }
    } catch (err) {
      console.warn(`[stockAlert] email failed for ${alert.user}:`, err.message);
    }

    try {
      await createNotification({
        recipient: alert.user,
        recipientRole: "customer",
        type: "inventory",
        module: "Inventory",
        reference: item._id,
        referenceModel: ITEM_MODEL_MAP[itemType],
        title: "Back in stock",
        message: `${item.name} is back in stock`,
        actionUrl,
        metadata: {
          itemType,
          itemId: item._id,
          name: item.name,
        },
      });
    } catch (err) {
      console.warn("[stockAlert] notification failed:", err.message);
    }

    alert.status = "sent";
    alert.notifiedAt = new Date();
    await alert.save();
  }
};
