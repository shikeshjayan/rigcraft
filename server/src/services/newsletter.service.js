import newsletterRepository from "../repositories/newsletter.repository.js";
import ApiError from "../utils/ApiError.js";

export const subscribe = async (email) => {
  const existing = await newsletterRepository.findByEmail(email);

  if (existing) {
    if (existing.status === "active") {
      throw ApiError.conflict("This email is already subscribed");
    }

    existing.status = "active";
    existing.subscribedAt = new Date();
    existing.unsubscribedAt = null;
    await existing.save();
    return existing;
  }

  return newsletterRepository.create({
    email,
    subscribedAt: new Date(),
  });
};

export const unsubscribe = async (email) => {
  const subscriber = await newsletterRepository.findByEmail(email);
  if (!subscriber) throw ApiError.notFound("Email not found");

  if (subscriber.status === "unsubscribed") {
    throw ApiError.badRequest("This email is already unsubscribed");
  }

  subscriber.status = "unsubscribed";
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();
  return subscriber;
};

export const getSubscribers = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    status,
    search,
  } = query;

  const filter = {};

  if (status) filter.status = status;
  if (search) {
    filter.email = { $regex: search, $options: "i" };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [subscribers, total] = await Promise.all([
    newsletterRepository.findAll(filter, { sort, skip, limit: limitNum }),
    newsletterRepository.count(filter),
  ]);

  return {
    subscribers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getSubscriber = async (id) => {
  return newsletterRepository.findById(id);
};

export const updateSubscriber = async (id, data) => {
  const subscriber = await newsletterRepository.findById(id);

  if (data.status === "unsubscribed" && subscriber.status !== "unsubscribed") {
    data.unsubscribedAt = new Date();
  }

  if (data.status === "active" && subscriber.status !== "active") {
    data.unsubscribedAt = null;
  }

  return newsletterRepository.updateById(id, data);
};

export const deleteSubscriber = async (id) => {
  return newsletterRepository.deleteById(id);
};

export const exportSubscribers = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  const subscribers = await newsletterRepository.findAll(filter, {
    sort: { createdAt: -1 },
  });

  return subscribers.map((s) => ({
    email: s.email,
    status: s.status,
    subscribedAt: s.subscribedAt,
    unsubscribedAt: s.unsubscribedAt || null,
    lastEmailSent: s.lastEmailSent || null,
    notes: s.notes || "",
    createdAt: s.createdAt,
  }));
};
