import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

export const uploadImage = async (file, folder) => {
  if (!file || !file.buffer) return null;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `rigcraft/${folder}`,
        transformation: { quality: "auto", fetch_format: "auto" },
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          reject(ApiError.badRequest(error.message || "Image upload failed. Check your Cloudinary configuration."));
        } else {
          resolve(result);
        }
      }
    );
    stream.end(file.buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const uploadMultipleImages = async (files, folder) => {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map((file) => uploadImage(file, folder)));
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

export const replaceImage = async (oldPublicId, newFile, folder) => {
  if (oldPublicId) {
    await deleteImage(oldPublicId);
  }
  return uploadImage(newFile, folder);
};
