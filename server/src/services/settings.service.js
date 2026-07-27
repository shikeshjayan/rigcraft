import settingsRepository from '../repositories/settings.repository.js';

export const get = async () => {
  return settingsRepository.getOrCreate();
};

export const update = async (data) => {
  const settings = await settingsRepository.getOrCreate();
  return settingsRepository.updateById(settings._id, data);
};
