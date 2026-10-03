import multer from 'multer';

// Use memory storage for Cloudinary upload and extraction
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit as per specs
  },
});
