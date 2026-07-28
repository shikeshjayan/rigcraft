import BaseRepository from './base.repository.js';
import Settings from '../models/settings.model.js';

const SCHEMA_DEFAULTS = {
  storeName: 'RigCraft',
  storeEmail: '',
  storePhone: '',
  description: '',
  address: '',
  whatsapp: '',
  logo: {},
  favicon: {},
  shipping: {
    standardRate: 100,
    freeShippingThreshold: 500,
    expressRate: 200,
    estimatedDelivery: '3-5 Business Days',
    codAvailable: true,
  },
  tax: {
    rate: 0.18,
    name: 'GST',
    pricesIncludeTax: false,
  },
  payment: {
    enableRazorpay: true,
    enableCod: true,
    minOrderAmount: 0,
    maxOrderAmount: 0,
  },
  seo: {
    defaultTitle: '',
    defaultDescription: '',
    defaultOgImage: {},
    metaKeywords: '',
  },
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    twitter: '',
  },
  order: {
    prefix: 'RC-',
    allowCancellation: true,
    cancellationTimeLimit: 24,
    cancelPendingAfter: 24,
  },
  inventory: {
    lowStockThreshold: 10,
    allowBackorders: false,
    hideOutOfStock: false,
    autoUpdateInventory: true,
  },
  review: {
    allowReviews: true,
    verifiedPurchaseOnly: true,
    autoApprove: false,
    allowImages: true,
    maxImages: 5,
  },
  maintenanceMode: false,
  maintenanceMessage: "We'll be back soon!",
  currency: {
    code: 'INR',
    symbol: '\u20b9',
  },
};

class SettingsRepository extends BaseRepository {
  constructor() {
    super(Settings);
  }

  async getOrCreate() {
    let settings = await this.model.findOne();
    if (!settings) {
      settings = await this.model.create({});
    } else {
      await this.fillDefaults(settings);
    }
    return settings;
  }

  async fillDefaults(doc) {
    let needsSave = false;
    for (const [key, val] of Object.entries(SCHEMA_DEFAULTS)) {
      if (doc.get(key) === undefined) {
        doc.set(key, val);
        needsSave = true;
      }
    }
    if (needsSave) await doc.save();
  }
}

export default new SettingsRepository();
