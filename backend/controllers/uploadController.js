const cloudinary = require('../config/cloudinary');
const stream = require('stream');

// @desc    Upload profile image to Cloudinary
// @route   POST /api/upload/profile
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const upload = await new Promise((resolve, reject) => {
      const cld = cloudinary.uploader.upload_stream(
        {
          folder: 'biteReelsProfiles',
          resource_type: 'image',
          overwrite: true,
          transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      bufferStream.pipe(cld);
    });

    return res.json({
      success: true,
      url: upload.secure_url,
      public_id: upload.public_id,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// @desc    Upload menu item image to Cloudinary
// @route   POST /api/menu/upload-image
// @access  Private (Restaurant)
const uploadMenuImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const upload = await new Promise((resolve, reject) => {
      const cld = cloudinary.uploader.upload_stream(
        {
          folder: 'biteReelsMenu',
          resource_type: 'image',
          overwrite: true,
          transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      bufferStream.pipe(cld);
    });

    return res.json({
      success: true,
      url: upload.secure_url,
      public_id: upload.public_id,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = { uploadProfileImage, uploadMenuImage };
