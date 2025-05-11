import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the site
    const site = await Site.findOne({ slug });
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    
    // Check if the site is paid or not expired
    if (!site.paid && site.expiresAt && new Date(site.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Site has expired' },
        { status: 410 } // Gone
      );
    }
    
    // Return the site data
    return NextResponse.json({
      success: true,
      site: {
        templateType: site.templateType,
        title: site.title,
        message: site.message,
        specialDate: site.specialDate,
        youtubeLink: site.youtubeLink,
        images: site.images,
        paid: site.paid,
      },
    });
    
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}