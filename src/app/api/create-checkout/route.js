// src/app/api/create-checkout/route.js - Versão otimizada para evitar timeouts
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import mongoose from 'mongoose';
import Site from '@/models/Site';

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
      family: 4, // Forçar IPv4
      keepAlive: true,
      keepAliveInitialDelay: 300000
    };

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
  console.log('Starting checkout session creation at:', new Date().toISOString());
  
  try {
    // Parse request body - com timeout de 5 segundos
    let data;
    try {
      const requestText = await request.text();
      data = JSON.parse(requestText);
      console.log('Request parsed, data:', data);
      console.log('Request processing time (parse):', Date.now() - startTime, 'ms');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format: ' + parseError.message },
        { status: 400 }
      );
    }
    
    // Validate siteId (rápido, não precisa de banco de dados)
    const { siteId } = data;
    if (!siteId) {
      console.error('Missing siteId');
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }
    
    // Verificar configuração do Stripe (rápido, não precisa de banco de dados)
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe API key');
      return NextResponse.json(
        { error: 'Payment system is not properly configured' },
        { status: 500 }
      );
    }
    
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('Missing base URL');
      return NextResponse.json(
        { error: 'Site URL configuration is missing' },
        { status: 500 }
      );
    }
    
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
    
    // Buscar site usando lean() para melhor performance
    let site;
    try {
      site = await Site.findById(siteId).lean().exec();
      
      if (!site) {
        console.error('Site not found:', siteId);
        return NextResponse.json(
          { error: 'Site not found' },
          { status: 404 }
        );
      }
      
      console.log('Site found:', {
        id: site._id.toString(),
        slug: site.slug,
        paid: site.paid
      });
      console.log('Request processing time (site-fetch):', Date.now() - startTime, 'ms');
    } catch (findError) {
      console.error('Error fetching site:', findError);
      return NextResponse.json(
        { error: 'Error fetching site data: ' + findError.message },
        { status: 500 }
      );
    }
    
    // Se o site já estiver pago, apenas retorna o slug (rápido, evita processamento)
    if (site.paid) {
      console.log('Site is already paid, returning slug');
      return NextResponse.json({
        success: true,
        paid: true,
        slug: site.slug
      });
    }
    
    // Criar sessão no Stripe
    let session;
    try {
      console.log('Creating Stripe checkout session...');
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Site Digital Personalizado',
                description: `Presente para "${site.title}"`,
              },
              unit_amount: 400, // $4.00 em centavos
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?site_id=${site._id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/create`,
        metadata: {
          siteId: site._id.toString(),
          slug: site.slug,
        },
        customer_email: site.customerEmail || undefined,
      });
      
      console.log('Checkout session created:', session.id);
      console.log('Request processing time (checkout-session):', Date.now() - startTime, 'ms');
    } catch (stripeError) {
      console.error('Error creating Stripe checkout session:', stripeError);
      return NextResponse.json(
        { error: 'Payment processing failed: ' + stripeError.message },
        { status: 500 }
      );
    }
    
    // Update site with session ID - não crítico, pode falhar
    try {
      await Site.findByIdAndUpdate(site._id, { checkoutSessionId: session.id });
      console.log('Site updated with checkout session ID');
    } catch (updateError) {
      console.error('Failed to update site with checkout session ID:', updateError);
      // Continuar mesmo com erro, não é crítico
    }
    
    // Return success response
    const response = {
      success: true,
      url: session.url,
    };
    
    console.log('Request completed successfully');
    console.log('Total request processing time:', Date.now() - startTime, 'ms');
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Unhandled error in create-checkout route:', error);
    console.log('Request failed after:', Date.now() - startTime, 'ms');
    
    return NextResponse.json(
      { error: 'Failed to create checkout session: ' + error.message },
      { status: 500 }
    );
  }
}