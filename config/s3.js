const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

// Configure multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const uploadToS3 = async (file) => {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `profile-photos/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }
  });

  const result = await upload.done();
  return result.Location;
};

module.exports = {
  upload,
  uploadToS3
};
