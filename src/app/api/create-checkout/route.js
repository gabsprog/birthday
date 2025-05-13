// src/app/api/create-checkout/route.js

import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import mongoose from 'mongoose';
import Site from '@/models/Site';

// Improved MongoDB connection function with retry logic
async function connectWithRetry(retries = 5, delay = 500) {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1}/${retries}...`);
      
      // Connect with proper options
      const connection = await mongoose.connect(MONGODB_URI, {
        bufferCommands: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
      });
      
      console.log('MongoDB connection successful');
      return connection;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      lastError = error;
      
      // Wait before trying again
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        // Exponential backoff
        delay *= 2;
      }
    }
  }
  
  throw new Error(`Failed to connect to MongoDB after ${retries} attempts: ${lastError.message}`);
}

export async function POST(request) {
  try {
    console.log('Iniciando criação de sessão de checkout');
    
    // Parse do corpo da requisição
    const data = await request.json();
    const { siteId } = data;
    
    if (!siteId) {
      console.error('Missing siteId in request');
      return NextResponse.json(
        { error: 'ID do site não fornecido' },
        { status: 400 }
      );
    }
    
    // Connect to the database with retry logic
    try {
      console.log('Conectando ao banco de dados...');
      await connectWithRetry();
      console.log('Database connection established for checkout');
    } catch (dbError) {
      console.error('Database connection failed for checkout:', dbError);
      return NextResponse.json(
        { error: 'Failed to connect to database: ' + dbError.message },
        { status: 500 }
      );
    }
    
    // Busca o site
    const site = await Site.findById(siteId);
    
    if (!site) {
      console.error(`Site não encontrado: ${siteId}`);
      return NextResponse.json(
        { error: 'Site não encontrado' },
        { status: 404 }
      );
    }
    
    // Se o site já estiver pago, apenas retorna o slug
    if (site.paid) {
      return NextResponse.json({
        success: true,
        paid: true,
        slug: site.slug
      });
    }
    
    console.log('Criando sessão de checkout para o site:', {
      id: site._id.toString(),
      slug: site.slug,
      customerEmail: site.customerEmail
    });
    
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system is not properly configured' },
        { status: 500 }
      );
    }
    
    // Cria uma sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
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
    
    // Atualiza o site com o ID da sessão
    site.checkoutSessionId = session.id;
    await site.save();
    
    console.log('Sessão de checkout criada com sucesso:', {
      sessionId: session.id,
      url: session.url
    });
    
    return NextResponse.json({
      success: true,
      url: session.url,
    });
    
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Falha ao criar sessão de checkout: ' + error.message },
      { status: 500 }
    );
  }
}