import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import * as env from '../config/env.js';
import logger from '../utils/logger.js';
import stream from 'stream';

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUD_NAME,
    api_key: env.CLOUDINARY.API_KEY,
    api_secret: env.CLOUDINARY.API_SECRET
});

logger.info(`[Cloudinary] Initialized with Cloud Name: ${env.CLOUDINARY.CLOUD_NAME}`);

// Configure Multer Storage (Memory Storage)
const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

export const uploadToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'aibase_uploads',
                resource_type: 'auto',
                ...options
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);
        bufferStream.pipe(uploadStream);
    });
};

export const uploadFileToCloudinary = (filePath, options = {}) => {
    return cloudinary.uploader.upload(filePath, {
        folder: 'aibase_uploads',
        resource_type: 'auto',
        ...options
    });
};

export { cloudinary };
