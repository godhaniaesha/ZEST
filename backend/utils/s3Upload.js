const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');

const isS3Configured = () =>
  Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET &&
      process.env.AWS_REGION
  );

const getBucket = () => process.env.AWS_S3_BUCKET;
const getRegion = () => process.env.AWS_REGION;

const getS3Client = () => {
  const region = getRegion();
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

const buildFileKey = (folder, originalname) => {
  const ext = path.extname(originalname) || '.jpg';
  return `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

const getPublicUrl = (key) => {
  const bucket = getBucket();
  const region = getRegion();

  if (process.env.AWS_S3_BASE_URL) {
    return `${process.env.AWS_S3_BASE_URL.replace(/\/$/, '')}/${key}`;
  }

  if (region === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const uploadBufferToS3 = async (file, folder = 'uploads') => {
  const key = buildFileKey(folder, file.originalname);
  const bucket = getBucket();
  const region = getRegion();

  try {
    const client = getS3Client();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return getPublicUrl(key);
  } catch (error) {
    const hint =
      error.name === 'PermanentRedirect' || error.Code === 'PermanentRedirect'
        ? ` Bucket "${bucket}" is not in region "${region}". Set AWS_REGION to the bucket's actual region in .env.`
        : '';
    throw new Error(`S3 upload failed: ${error.message}.${hint}`);
  }
};

const saveFileLocally = async (file, folder = 'uploads') => {
  const uploadsDir = path.join(__dirname, '..', folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = buildFileKey('', file.originalname).replace(/^\//, '');
  const filepath = path.join(uploadsDir, path.basename(filename));
  await fs.promises.writeFile(filepath, file.buffer);

  const port = process.env.PORT || 5000;
  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;
  return `${baseUrl}/${folder}/${path.basename(filename)}`;
};

const uploadImage = async (file, folder = 'menu') => {
  if (!file) return null;

  if (isS3Configured()) {
    return uploadBufferToS3(file, folder);
  }

  return saveFileLocally(file, 'uploads');
};

module.exports = { uploadImage, isS3Configured, getPublicUrl };
