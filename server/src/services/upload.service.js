import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT =
  process.env.VERCEL_ENV === "production"
    ? path.resolve("/tmp/uploads")
    : path.resolve(__dirname, "../../uploads");

const isCloudinaryConfigured = () => {
  const config = cloudinary.config();
  return !!(config.cloud_name && config.api_key && config.api_secret);
};

const serverOrigin = () => process.env.SERVER_ORIGIN || `http://localhost:${process.env.PORT || 5000}`;

const saveLocally = async (file, folder) => {
  const dir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });

  const ext = path.extname(file.originalname) || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, file.buffer);

  return {
    url: `${serverOrigin()}/uploads/${folder}/${filename}`,
    publicId: null,
  };
};

const uploadToCloudinary = async (file, folder) => {
  const isImage = (file.mimetype || "").startsWith("image/");
  const ext = path.extname(file.originalname) || (isImage ? ".jpg" : "");
  const publicId = `${crypto.randomUUID()}${ext}`;
  const dataUri = `data:${file.mimetype || "application/octet-stream"};base64,${file.buffer.toString("base64")}`;

  const options = {
    folder: `rigcraft/${folder}`,
    public_id: publicId,
    resource_type: isImage ? "image" : "raw",
  };
  if (isImage) {
    options.transformation = { quality: "auto", fetch_format: "auto" };
  }

  const result = await cloudinary.uploader.upload(dataUri, options);

  console.log(
    `[upload] ${folder}/${file.originalname} -> ${result.resource_type} bytes=${result.bytes} url=${result.secure_url}`
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const uploadImage = async (file, folder) => {
  if (!file || !file.buffer) return null;

  if (isCloudinaryConfigured()) {
    try {
      return await uploadToCloudinary(file, folder);
    } catch (err) {
      console.error("Cloudinary upload failed, falling back to local storage:", err.message);
    }
  }

  return saveLocally(file, folder);
};

export const uploadMultipleImages = async (files, folder) => {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map((file) => uploadImage(file, folder)));
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;

  if (!isCloudinaryConfigured()) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
  }
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch {
  }
};

export const replaceImage = async (oldPublicId, newFile, folder) => {
  if (oldPublicId) {
    await deleteImage(oldPublicId);
  }
  return uploadImage(newFile, folder);
};
