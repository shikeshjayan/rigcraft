import BaseRepository from "./base.repository.js";
import Newsletter from "../models/newsletter.model.js";

class NewsletterRepository extends BaseRepository {
  constructor() {
    super(Newsletter);
  }

  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase().trim() });
  }
}

export default new NewsletterRepository();
