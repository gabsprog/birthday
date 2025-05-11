import mongoose from 'mongoose';

// Create schemas for the customized text objects to provide structure to the data
const FavoriteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

const AboutCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

const UniverseSymbolSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

// Birthday template custom texts schema
const BirthdayCustomTextSchema = new mongoose.Schema({
  headerTitle: {
    type: String,
    default: 'Happy Birthday!'
  },
  aboutSectionTitle: {
    type: String,
    default: 'About You'
  },
  favoritesSectionTitle: {
    type: String,
    default: 'What I Love About You'
  },
  gallerySectionTitle: {
    type: String,
    default: 'Memory Gallery'
  },
  messageSectionTitle: {
    type: String,
    default: 'Birthday Message'
  },
  buttonText: {
    type: String,
    default: 'Click For Birthday Surprise'
  },
  footerText: {
    type: String,
    default: 'Made with love'
  },
  favorites: {
    type: [FavoriteSchema],
    default: [
      { title: 'Your Smile', description: 'A smile that lights up any room and brightens everyone around.' },
      { title: 'Your Intelligence', description: 'The way you think and solve problems is admirable.' },
      { title: 'Your Heart', description: 'A heart full of love and compassion, always ready to help others.' },
      { title: 'Your Determination', description: 'When you set your mind to something, there\'s no obstacle that can stop you.' },
      { title: 'Your Authenticity', description: 'You are genuinely yourself, without masks or pretensions.' }
    ]
  },
  aboutCards: {
    type: [AboutCardSchema],
    default: [
      { title: 'Amazing Person ❤️', description: 'You are the most incredible person I\'ve ever met.' },
      { title: 'Our Story', description: 'From the very first moment, I knew you were special.' },
      { title: 'Unforgettable Moments', description: 'Every moment by your side becomes unforgettable.' }
    ]
  }
}, { _id: false });

// Anniversary template custom texts schema
const AnniversaryCustomTextSchema = new mongoose.Schema({
  headerTitle: {
    type: String,
    default: 'Our Anniversary'
  },
  timeTogetherTitle: {
    type: String,
    default: 'Time Together'
  },
  journeyTitle: {
    type: String,
    default: 'Our Journey Together'
  },
  momentsTitle: {
    type: String,
    default: 'Our Special Moments'
  },
  messageTitle: {
    type: String,
    default: 'Anniversary Message'
  },
  songTitle: {
    type: String,
    default: 'Our Special Song'
  },
  songCaption: {
    type: String,
    default: 'This melody speaks the words my heart cannot express'
  },
  footerText: {
    type: String,
    default: 'Happy Anniversary!'
  },
  journeyMilestones: {
    type: [MilestoneSchema],
    default: [
      { title: 'First Meeting', description: 'The day our paths crossed for the first time.' },
      { title: 'First Date', description: 'The butterflies, the excitement, the conversations.' },
      { title: 'Official Relationship', description: 'The day we decided to commit to each other.' },
      { title: 'Special Milestone', description: 'A significant moment that made our bond even stronger.' }
    ]
  }
}, { _id: false });

// Declaration template custom texts schema
const DeclarationCustomTextSchema = new mongoose.Schema({
  headerTitle: {
    type: String,
    default: 'Declaration of Love'
  },
  headerQuote: {
    type: String,
    default: 'Just as the stars are constant in the night sky, so is my love for you: eternal, bright, and guiding my way.'
  },
  journeyTitle: {
    type: String,
    default: 'Our Journey Among the Stars'
  },
  universeTitle: {
    type: String,
    default: 'The Universe of Our Love'
  },
  songTitle: {
    type: String,
    default: 'The Soundtrack of Our Love'
  },
  songCaption: {
    type: String,
    default: 'This melody speaks the words my heart cannot express'
  },
  messageTitle: {
    type: String,
    default: 'My Declaration of Love'
  },
  promiseTitle: {
    type: String,
    default: 'My Promise'
  },
  promiseText: {
    type: String,
    default: 'I promise to love you, to cherish you, and to stand by your side through all of life\'s adventures.'
  },
  signatureText: {
    type: String,
    default: 'With all my love,'
  },
  signatureName: {
    type: String,
    default: 'Always Yours'
  },
  footerText: {
    type: String,
    default: 'Made with love'
  },
  universeSymbols: {
    type: [UniverseSymbolSchema],
    default: [
      { title: 'Loyalty', description: 'Like a distant star that remains constant, my loyalty to you will never waver.' },
      { title: 'Infinite Love', description: 'As vast as the universe itself, my love for you knows no limits or boundaries.' },
      { title: 'Destiny', description: 'Like celestial bodies drawn together by gravity, we were meant to find each other.' }
    ]
  }
}, { _id: false });

// Main Site schema
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
  // Add custom text fields for each template type
  birthdayTexts: {
    type: BirthdayCustomTextSchema,
    required: false,
    default: () => ({})
  },
  anniversaryTexts: {
    type: AnniversaryCustomTextSchema,
    required: false,
    default: () => ({})
  },
  declarationTexts: {
    type: DeclarationCustomTextSchema,
    required: false,
    default: () => ({})
  }
});

// Use the existing model if it exists, otherwise create a new one
const Site = mongoose.models.Site || mongoose.model('Site', SiteSchema);

export default Site;