import settingsRepository from '../repositories/settings.repository.js';
import * as uploadService from './upload.service.js';

export const get = async () => {
  return settingsRepository.getOrCreate();
};

export const update = async (data) => {
  const settings = await settingsRepository.getOrCreate();
  return settingsRepository.updateById(settings._id, data);
};

export const updateLogo = async (file) => {
  const settings = await settingsRepository.getOrCreate();

  if (settings.logo?.publicId) {
    await uploadService.deleteImage(settings.logo.publicId);
  }

  const result = await uploadService.uploadImage(file, 'settings');

  return settingsRepository.updateById(settings._id, {
    logo: {
      url: result.url,
      publicId: result.publicId,
      alt: 'Store Logo',
    },
  });
};

export const deleteLogo = async () => {
  const settings = await settingsRepository.getOrCreate();

  if (settings.logo?.publicId) {
    await uploadService.deleteImage(settings.logo.publicId);
  }

  return settingsRepository.updateById(settings._id, {
    logo: { url: '', publicId: '', alt: '' },
  });
};

export const getPublic = async () => {
  const s = await settingsRepository.getOrCreate();
  return {
    general: {
      storeName: s.storeName || 'RigCraft',
      logo: s.logo || {},
      favicon: s.favicon || {},
      description: s.description || '',
      currency: s.currency?.code || 'INR',
    },
    contact: {
      email: s.storeEmail || '',
      phone: s.storePhone || '',
      whatsapp: s.whatsapp || '',
      address: s.address || '',
    },
    social: {
      facebook: s.social?.facebook || '',
      instagram: s.social?.instagram || '',
      youtube: s.social?.youtube || '',
      linkedin: s.social?.linkedin || '',
      twitter: s.social?.twitter || '',
    },
    shipping: {
      freeShippingAbove: s.shipping?.freeShippingThreshold || 0,
      estimatedDelivery: s.shipping?.estimatedDelivery || '',
    },
    tax: {
      pricesIncludeTax: s.tax?.pricesIncludeTax ?? false,
      rate: s.tax?.rate ?? 0,
      name: s.tax?.name || 'GST',
    },
    seo: {
      defaultTitle: s.seo?.defaultTitle || '',
      defaultDescription: s.seo?.defaultDescription || '',
      defaultOgImage: s.seo?.defaultOgImage || {},
    },
  };
};
