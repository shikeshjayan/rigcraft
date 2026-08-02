import mongoose from 'mongoose';
import Product from './models/product.model.js';
mongoose.connect('mongodb://localhost:27017/rigcraft').then(async () => {
  const p = await Product.findOne();
  console.log('Product:', p.name);
  const search = p.name.split(' ')[0]; // search first word
  const regex = { $regex: search, $options: 'i' };
  const r2 = await Product.find({ $or: [{ name: regex }, { tags: regex }, { shortDescription: regex }] });
  console.log('Found with all $or:', r2.length);
  process.exit(0);
});
