import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { AppError } from '../utils/errors';
import { prisma } from '../config/prisma';

import fs from 'fs';
import path from 'path';

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
    try {
      const existingNotice = await prisma.notice.findUnique({
        where: { rawFileHash: hash },
      });

      if (existingNotice) {
        throw new AppError('File already uploaded (Duplicate SHA-256 Hash)', 409, 'DUPLICATE_FILE');
      }
    } catch (dbErr: any) {
      if (dbErr instanceof AppError) throw dbErr;
      // If DB is offline, continue safely
    }

    // 2. Upload to Cloudinary if configured; otherwise use safe local file on disk
    const hasCloudinary = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      console.warn('Cloudinary credentials missing or unconfigured. Saving to local uploads folder.');
      return this.saveToLocal(buffer, originalName, hash);
    }

    try {
      return await new Promise<{ hash: string; secure_url: string; bytes: number }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'campusflow_notices',
            resource_type: mimeType === 'application/pdf' ? 'raw' : 'image',
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Cloudinary upload failed'));
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
    } catch (cloudErr: any) {
      console.warn('Cloudinary upload failed, using safe local upload fallback:', cloudErr.message || cloudErr);
      return this.saveToLocal(buffer, originalName, hash);
    }
  }

  private static saveToLocal(buffer: Buffer, originalName: string, hash: string) {
    const safeFilename = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${hash.slice(0, 10)}_${safeFilename}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return {
      hash,
      secure_url: `/uploads/${filename}`,
      bytes: buffer.length,
    };
  }
}
