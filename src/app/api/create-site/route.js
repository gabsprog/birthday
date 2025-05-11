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
    
    // Create a new site document
    const site = new Site({
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
    });
    
    // Save the site to the database
    await site.save();
    
    // Create a payment intent with Stripe
    const amount = 4; // $4.00 USD
    const metadata = {
      siteId: site._id.toString(),
      slug,
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
      slug,
    });
    
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}