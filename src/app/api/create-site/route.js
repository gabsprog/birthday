import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';
import { generateSlug } from '@/lib/utils';
import { createPaymentIntent } from '@/lib/stripe';

export async function POST(request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.message || !data.templateType || !data.customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Generate a unique slug
    let slug = generateSlug();
    let existingSite = await Site.findOne({ slug });
    
    // Ensure slug is unique
    while (existingSite) {
      slug = generateSlug();
      existingSite = await Site.findOne({ slug });
    }
    
    // Prepare the site data
    const siteData = {
      slug,
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
    const site = new Site(siteData);
    
    // Save the site to the database
    await site.save();
    
    // Create a payment intent with Stripe
    const amount = 4; // $4.00 USD
    const metadata = {
        siteId: site._id.toString(),
        slug: site.slug,
        customerEmail: data.customerEmail,
    };

    const { clientSecret, id: paymentIntentId } = await createPaymentIntent(amount, metadata);

    // Update the site with the payment intent ID
    site.paymentIntentId = paymentIntentId;
    await site.save();

    return NextResponse.json({
        success: true,
        clientSecret,
        siteId: site._id.toString(),
        slug: site.slug,
    });
    
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}