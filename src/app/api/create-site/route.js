// src/app/api/create-site/route.js - Versão otimizada para evitar timeouts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { createPaymentIntent } from '@/lib/stripe';
import Site from '@/models/Site';

// Define generateSlug function directly as a fallback
function generateSlug() {
  const uuid = uuidv4();
  return uuid.substring(0, 8);
}

// Configuração otimizada para conexão MongoDB
async function getMongoConnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  try {
    // Se já existe uma conexão pendente mas não completa, force uma nova
    if (mongoose.connection.readyState === 2) {
      await mongoose.disconnect();
    }
    
    // Opções otimizadas para performance e confiabilidade em serverless
    const options = {
      bufferCommands: true,
      maxPoolSize: 5,
      minPoolSize: 1,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 10000,
      family: 4
    };
    if (process.env.NODE_ENV === 'production') {
      options.keepAlive = true;
      options.keepAliveInitialDelay = 300000;
    }

    await mongoose.connect(MONGODB_URI, options);
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

export async function POST(request) {
  // Marcar o início do processamento para monitorar o tempo
  const startTime = Date.now();
  console.log('Starting site creation process at:', new Date().toISOString());
  
  try {
    // Parse the request body - com timeout de 5 segundos
    let data;
    try {
      const requestText = await request.text();
      data = JSON.parse(requestText);
      console.log('Request parsed, size:', requestText.length);
      console.log('Request processing time (parse):', Date.now() - startTime, 'ms');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format: ' + parseError.message },
        { status: 400 }
      );
    }
    
    // Validate required fields (rápido, não precisa de banco de dados)
    if (!data.title || !data.message || !data.templateType || !data.customerEmail) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate a unique slug (não requer banco de dados)
    let slug = generateSlug();
    console.log('Generated initial slug:', slug);
    console.log('Request processing time (pre-db):', Date.now() - startTime, 'ms');
    
    // Connect to database
    console.log('Connecting to database...');
    try {
      await getMongoConnection();
      console.log('Database connection established');
      console.log('Request processing time (db-connect):', Date.now() - startTime, 'ms');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed: ' + dbError.message },
        { status: 500 }
      );
    }
    
    // Check for existing slug
    let existingSite;
    try {
      existingSite = await Site.findOne({ slug }).lean().exec();
      console.log('Request processing time (slug-check):', Date.now() - startTime, 'ms');
    } catch (findError) {
      console.error('Error checking for existing slug:', findError);
      return NextResponse.json(
        { error: 'Database query failed: ' + findError.message },
        { status: 500 }
      );
    }
    
    // Ensure slug is unique
    let slugAttempts = 1;
    while (existingSite) {
      slug = generateSlug();
      console.log(`Slug attempt ${slugAttempts}:`, slug);
      
      try {
        existingSite = await Site.findOne({ slug }).lean().exec();
      } catch (findError) {
        console.error('Error checking for existing slug:', findError);
        return NextResponse.json(
          { error: 'Database query failed: ' + findError.message },
          { status: 500 }
        );
      }
      
      slugAttempts++;
      if (slugAttempts > 3) {
        console.error('Failed to generate unique slug after 3 attempts');
        return NextResponse.json(
          { error: 'Failed to generate unique site ID' },
          { status: 500 }
        );
      }
    }
    
    // Prepare site data - simplificando para aumentar performance
    const siteData = {
      slug,
      uniqueHash: uuidv4(),
      editHash: uuidv4(),
      templateType: data.templateType,
      title: data.title,
      message: data.message,
      specialDate: data.specialDate || null,
      youtubeLink: data.youtubeLink || '',
      images: data.images || [],
      customerEmail: data.customerEmail,
      paid: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    };
    
    // Add template-specific data using a more eficiente approach
    if (data.templateType === 'birthday' && data.birthday) {
      siteData.birthdayTexts = data.birthday;
    } else if (data.templateType === 'anniversary' && data.anniversary) {
      siteData.anniversaryTexts = data.anniversary;
    } else if (data.templateType === 'declaration' && data.declaration) {
      siteData.declarationTexts = data.declaration;
    }
    
    console.log('Request processing time (data-prep):', Date.now() - startTime, 'ms');
    
    // Create site document
    let site;
    try {
      console.log('Creating site document...');
      site = new Site(siteData);
      await site.save();
      console.log('Site document created with ID:', site._id.toString());
      console.log('Request processing time (site-save):', Date.now() - startTime, 'ms');
    } catch (saveError) {
      console.error('Error saving site:', saveError);
      return NextResponse.json(
        { error: 'Failed to save site: ' + saveError.message },
        { status: 500 }
      );
    }
    
    // Create Stripe payment intent
    let clientSecret, paymentIntentId;
    try {
      console.log('Creating payment intent...');
      
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured');
      }
      
      const metadata = {
        siteId: site._id.toString(),
        slug: site.slug,
        customerEmail: data.customerEmail,
      };
      
      const result = await createPaymentIntent(4, metadata);
      clientSecret = result.clientSecret;
      paymentIntentId = result.id;
      
      console.log('Payment intent created:', paymentIntentId);
      console.log('Request processing time (payment-intent):', Date.now() - startTime, 'ms');
    } catch (stripeError) {
      console.error('Payment intent creation failed:', stripeError);
      
      // Clean up site on payment intent failure
      try {
        await Site.findByIdAndDelete(site._id);
      } catch (cleanupError) {
        console.error('Failed to clean up site after payment error:', cleanupError);
      }
      
      return NextResponse.json(
        { error: 'Payment processing failed: ' + stripeError.message },
        { status: 500 }
      );
    }
    
    // Update site with payment intent ID - não crítico, pode falhar
    try {
      await Site.findByIdAndUpdate(site._id, { paymentIntentId });
    } catch (updateError) {
      console.error('Failed to update site with payment intent ID:', updateError);
      // Continuar mesmo com erro, não é crítico
    }
    
    // Return success response
    const response = {
      success: true,
      clientSecret,
      siteId: site._id.toString(),
      slug: site.slug,
    };
    
    console.log('Request completed successfully');
    console.log('Total request processing time:', Date.now() - startTime, 'ms');
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Unhandled error in create-site route:', error);
    console.log('Request failed after:', Date.now() - startTime, 'ms');
    
    return NextResponse.json(
      { error: 'Failed to create site: ' + error.message },
      { status: 500 }
    );
  }
}