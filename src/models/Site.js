import mongoose from 'mongoose';

const SiteSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  templateType: {
    type: String,
    enum: ['birthday', 'anniversary', 'declaration'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  specialDate: {
    type: Date,
    required: false,
  },
  youtubeLink: {
    type: String,
    required: false,
    trim: true,
  },
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v && v.length <= 5; // Maximum 5 images allowed
      },
      message: 'A maximum of 5 images are allowed'
    },
    required: false,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paymentIntentId: {
    type: String,
    required: false,
  },
  customerEmail: {
    type: String,
    required: false,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: false,
  },
});

// Use the existing model if it exists, otherwise create a new one
const Site = mongoose.models.Site || mongoose.model('Site', SiteSchema);

export default Site;