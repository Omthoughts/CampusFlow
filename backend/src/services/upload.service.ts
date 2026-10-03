import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { AppError } from '../utils/errors';
import { prisma } from '../config/prisma';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class UploadService {
  /**
   * Computes the SHA-256 hash of a buffer.
   */
  static computeHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Uploads a file to Cloudinary if its hash doesn't already exist.
   * Returns { hash, url } or throws an error if duplicate.
   */
  static async uploadFile(buffer: Buffer, originalName: string, mimeType: string) {
    const hash = this.computeHash(buffer);

    // 1. Deduplication BEFORE Cloudinary upload
    const existingNotice = await prisma.notice.findUnique({
      where: { rawFileHash: hash },
    });

    if (existingNotice) {
      throw new AppError('File already uploaded', 409, 'DUPLICATE_FILE');
    }

    // 2. Upload to Cloudinary
    return new Promise<{ hash: string; secure_url: string; bytes: number }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'campusflow_notices',
          resource_type: mimeType === 'application/pdf' ? 'raw' : 'image', // Cloudinary treats PDFs as 'raw' or 'image'. Often 'raw' or 'image' works depending on exact requirement. 'auto' is safest.
        },
        (error, result) => {
          if (error || !result) {
            reject(new AppError('Cloudinary upload failed', 500, 'UPLOAD_FAILED'));
          } else {
            resolve({
              hash,
              secure_url: result.secure_url,
              bytes: result.bytes,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });
  }
}
