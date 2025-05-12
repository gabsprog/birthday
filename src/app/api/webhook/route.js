// Atualização para src/app/api/webhook/route.js

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';
import { sendSiteEmail } from '@/lib/email';

// Configuração da rota
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');
    
    if (!signature) {
      console.error('Assinatura do Stripe ausente');
      return NextResponse.json(
        { error: 'Assinatura ausente' },
        { status: 400 }
      );
    }
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error(`Falha na verificação da assinatura: ${error.message}`);
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 400 }
      );
    }
    
    // Lidar com o evento
    console.log('Evento recebido do Stripe:', event.type);
    
    // Atualização principal: adicionar suporte para checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      // Processar evento checkout.session.completed
      await handleCheckoutSessionCompleted(event.data.object);
    } else if (event.type === 'payment_intent.succeeded') {
      // Manter o processamento do payment_intent.succeeded para backward compatibility
      await handlePaymentIntentSucceeded(event.data.object);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Falha ao processar webhook' },
      { status: 500 }
    );
  }
}

// Nova função para processar checkout.session.completed
async function handleCheckoutSessionCompleted(session) {
  // Extrair siteId dos metadados
  const { siteId } = session.metadata;
  
  if (!siteId) {
    console.error('siteId ausente nos metadados da sessão');
    return;
  }
  
  console.log(`Processando pagamento completado para o site: ${siteId}`);
  
  // Conectar ao banco de dados
  await connectToDatabase();
  
  // Encontrar o site
  const site = await Site.findById(siteId);
  
  if (!site) {
    console.error(`Site não encontrado: ${siteId}`);
    return;
  }
  
  // Atualizar o site
  site.paid = true;
  site.expiresAt = null; // Remover data de expiração (o site agora é permanente)
  await site.save();
  
  console.log(`Site ${siteId} marcado como pago com sucesso`);
  
  // Enviar email para o cliente
  const customerEmail = session.customer_email || site.customerEmail;
  if (customerEmail) {
    try {
      await sendSiteEmail(customerEmail, site);
      console.log(`Email enviado para ${customerEmail}`);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }
  }
}

// Manter função existente para backward compatibility
async function handlePaymentIntentSucceeded(paymentIntent) {
  // Extrair metadados
  const { siteId, customerEmail } = paymentIntent.metadata;
  
  if (!siteId) {
    console.error('siteId ausente nos metadados do paymentIntent');
    return;
  }
  
  console.log(`Processando payment_intent.succeeded para o site: ${siteId}`);
  
  // Conectar ao banco de dados
  await connectToDatabase();
  
  // Encontrar o site
  const site = await Site.findById(siteId);
  
  if (!site) {
    console.error(`Site não encontrado: ${siteId}`);
    return;
  }
  
  // Atualizar o site
  site.paid = true;
  site.expiresAt = null; // Remover data de expiração (o site agora é permanente)
  await site.save();
  
  console.log(`Site ${siteId} marcado como pago com sucesso`);
  
  // Enviar email para o cliente
  if (customerEmail || site.customerEmail) {
    try {
      await sendSiteEmail(customerEmail || site.customerEmail, site);
      console.log(`Email enviado para ${customerEmail || site.customerEmail}`);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }
  }
}