import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';

export async function GET(request, { params }) {
  try {
    const { siteId } = params;
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the site
    const site = await Site.findById(siteId);
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    
    // Return the site data
    return NextResponse.json({
      success: true,
      site: {
        slug: site.slug,
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