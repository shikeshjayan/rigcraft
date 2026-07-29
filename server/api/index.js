import app from '../src/app.js';
import connectDB from '../src/config/db.js';

let appInstance;

export default async function (req, res) {
  if (!appInstance) {
    await connectDB();
    appInstance = app;
  }
  return appInstance(req, res);
}
