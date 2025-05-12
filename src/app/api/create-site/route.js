import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';
import { v4 as uuidv4 } from 'uuid'; // Direct import for generateSlug fallback
import { createPaymentIntent } from '@/lib/stripe';

// Define generateSlug function directly as a fallback
function generateSlug() {
  const uuid = uuidv4();
  return uuid.substring(0, 8);
}

export async function POST(request) {
  try {
    console.log('Starting site creation process');
    
    // Parse the request body
    const data = await request.json();
    console.log('Received data for site creation:', JSON.stringify({
      templateType: data.templateType,
      title: data.title,
      customerEmail: data.customerEmail
      // Don't log full message for privacy and console clarity
    }));
    
    // Validate required fields
    if (!data.title || !data.message || !data.templateType || !data.customerEmail) {
      console.error('Missing required fields', { 
        hasTitle: Boolean(data.title), 
        hasMessage: Boolean(data.message),
        hasTemplateType: Boolean(data.templateType),
        hasEmail: Boolean(data.customerEmail)
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    console.log('Connecting to database...');
    try {
      await connectToDatabase();
      console.log('Database connection established');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed: ' + dbError.message },
        { status: 500 }
      );
    }
    
    // Generate a unique slug - using the function directly as defined above
    let slug = generateSlug();
    let existingSite = await Site.findOne({ slug });
    
    // Ensure slug is unique
    let slugAttempts = 1;
    while (existingSite) {
      console.log(`Slug "${slug}" already exists, generating new one (attempt ${slugAttempts})`);
      slug = generateSlug();
      existingSite = await Site.findOne({ slug });
      slugAttempts++;
      
      if (slugAttempts > 5) {
        console.error('Failed to generate unique slug after 5 attempts');
        return NextResponse.json(
          { error: 'Failed to generate unique site ID' },
          { status: 500 }
        );
      }
    }
    
    // Prepare the site data
    console.log('Preparing site data with slug:', slug);
    const siteData = {
      slug,
      uniqueHash: uuidv4(), // Generate a unique hash for the site
      editHash: uuidv4(),   // Generate a unique edit hash for the site
      templateType: data.templateType,
      title: data.title,
      message: data.message,
      specialDate: data.specialDate || null,
      youtubeLink: data.youtubeLink || '',
      images: data.images || [],
      customerEmail: data.customerEmail,
      paid: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours if not paid
    };
    
    // Add template-specific custom text data
    if (data.templateType === 'birthday' && data.birthday) {
      siteData.birthdayTexts = {
        headerTitle: data.birthday.headerTitle || undefined,
        customAge: data.birthday.customAge || undefined,
        aboutSectionTitle: data.birthday.aboutSectionTitle || undefined,
        favoritesSectionTitle: data.birthday.favoritesSectionTitle || undefined,
        gallerySectionTitle: data.birthday.gallerySectionTitle || undefined,
        messageSectionTitle: data.birthday.messageSectionTitle || undefined,
        buttonText: data.birthday.buttonText || undefined,
        footerText: data.birthday.footerText || undefined,
        favorites: data.birthday.favorites || undefined,
        aboutCards: data.birthday.aboutCards || undefined
      };
    }
    
    if (data.templateType === 'anniversary' && data.anniversary) {
      siteData.anniversaryTexts = {
        headerTitle: data.anniversary.headerTitle || undefined,
        timeTogetherTitle: data.anniversary.timeTogetherTitle || undefined,
        journeyTitle: data.anniversary.journeyTitle || undefined,
        momentsTitle: data.anniversary.momentsTitle || undefined,
        messageTitle: data.anniversary.messageTitle || undefined,
        songTitle: data.anniversary.songTitle || undefined,
        songCaption: data.anniversary.songCaption || undefined,
        footerText: data.anniversary.footerText || undefined,
        journeyMilestones: data.anniversary.journeyMilestones || undefined
      };
    }
    
    if (data.templateType === 'declaration' && data.declaration) {
      siteData.declarationTexts = {
        headerTitle: data.declaration.headerTitle || undefined,
        headerQuote: data.declaration.headerQuote || undefined,
        journeyTitle: data.declaration.journeyTitle || undefined,
        universeTitle: data.declaration.universeTitle || undefined,
        songTitle: data.declaration.songTitle || undefined,
        songCaption: data.declaration.songCaption || undefined,
        messageTitle: data.declaration.messageTitle || undefined,
        promiseTitle: data.declaration.promiseTitle || undefined,
        promiseText: data.declaration.promiseText || undefined,
        signatureText: data.declaration.signatureText || undefined,
        signatureName: data.declaration.signatureName || undefined,
        footerText: data.declaration.footerText || undefined,
        universeSymbols: data.declaration.universeSymbols || undefined
      };
    }
    
    // Create a new site document
    console.log('Creating site document...');
    const site = new Site(siteData);
    
    // Save the site to the database
    try {
      await site.save();
      console.log('Site document saved successfully with ID:', site._id.toString());
    } catch (saveError) {
      console.error('Error saving site document:', saveError);
      return NextResponse.json(
        { error: 'Failed to save site: ' + saveError.message },
        { status: 500 }
      );
    }
    
    // Create a payment intent with Stripe
    console.log('Creating Stripe payment intent...');
    try {
      const amount = 4; // $4.00 USD
      const metadata = {
        siteId: site._id.toString(),
        slug: site.slug,
        customerEmail: data.customerEmail,
      };
      
      const { clientSecret, id: paymentIntentId } = await createPaymentIntent(amount, metadata);
      console.log('Payment intent created with ID:', paymentIntentId);
      
      // Update the site with the payment intent ID
      site.paymentIntentId = paymentIntentId;
      await site.save();
      console.log('Site document updated with payment intent ID');
      
      return NextResponse.json({
        success: true,
        clientSecret,
        siteId: site._id.toString(),
        slug: site.slug,
      });
    } catch (stripeError) {
      console.error('Stripe payment intent creation failed:', stripeError);
      
      // Clean up the site document if payment intent fails
      try {
        await Site.findByIdAndDelete(site._id);
        console.log('Cleaned up site document after payment intent failure');
      } catch (cleanupError) {
        console.error('Failed to clean up site document:', cleanupError);
      }
      
      return NextResponse.json(
        { error: 'Payment processing failed: ' + stripeError.message },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unhandled error in create-site route:', error);
    return NextResponse.json(
      { error: 'Failed to create site: ' + error.message },
      { status: 500 }
    );
  }
}