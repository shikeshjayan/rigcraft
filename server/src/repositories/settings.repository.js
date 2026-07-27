import BaseRepository from './base.repository.js';
import Settings from '../models/settings.model.js';

class SettingsRepository extends BaseRepository {
  constructor() {
    super(Settings);
  }

  async getOrCreate() {
    let settings = await this.model.findOne();
    if (!settings) {
      settings = await this.model.create({});
    }
    return settings;
  }
}

export default new SettingsRepository();
