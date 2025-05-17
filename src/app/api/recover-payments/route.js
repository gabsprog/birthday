// src/app/api/cron/recover-payments/route.js
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose';
import stripe from '@/lib/stripe';
import Site from '@/models/Site';
import connectToDatabase from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  // Verifique a autorização
  const authHeader = headers().get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;
  
  if (!authHeader || authHeader !== expectedAuth) {
    console.log('Tentativa de acesso não autorizado ao cron job');
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  console.log('Iniciando job de recuperação de pagamentos');
  
  try {
    // Conectar ao banco de dados
    await connectToDatabase();
    
    // Encontrar sites expirados
    const expiredSites = await Site.find({
      paid: false,
      expiresAt: { $lt: new Date() },
      $or: [
        { checkoutSessionId: { $exists: true, $ne: null } },
        { paymentIntentId: { $exists: true, $ne: null } }
      ]
    });
    
    console.log(`Encontrados ${expiredSites.length} sites expirados para verificar`);
    
    let recoveredCount = 0;
    const results = [];
    
    for (const site of expiredSites) {
      console.log(`Verificando site: ${site.slug}`);
      
      let isPaidInStripe = false;
      let stripeStatus = 'unknown';
      
      if (site.checkoutSessionId) {
        try {
          const session = await stripe.checkout.sessions.retrieve(site.checkoutSessionId);
          isPaidInStripe = session.payment_status === 'paid';
          stripeStatus = session.payment_status;
          console.log(`Sessão do Stripe ${site.checkoutSessionId}: ${session.payment_status}`);
        } catch (error) {
          console.error(`Erro ao verificar sessão ${site.checkoutSessionId}:`, error.message);
        }
      }
      
      if (!isPaidInStripe && site.paymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(site.paymentIntentId);
          isPaidInStripe = paymentIntent.status === 'succeeded';
          stripeStatus = paymentIntent.status;
          console.log(`Payment Intent ${site.paymentIntentId}: ${paymentIntent.status}`);
        } catch (error) {
          console.error(`Erro ao verificar payment intent ${site.paymentIntentId}:`, error.message);
        }
      }
      
      results.push({
        slug: site.slug,
        isPaidInStripe,
        stripeStatus
      });
      
      if (isPaidInStripe) {
        // Atualizar o site
        site.paid = true;
        site.expiresAt = null;
        await site.save();
        console.log(`✅ Site ${site.slug} recuperado e marcado como pago!`);
        recoveredCount++;
      } else {
        console.log(`❌ Site ${site.slug} não tem pagamento confirmado no Stripe`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Recuperados ${recoveredCount} sites de ${expiredSites.length} verificados`,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Erro ao recuperar pagamentos:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}