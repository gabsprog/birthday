// src/app/api/webhook/route.js - Versão corrigida
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';
import { sendSiteEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');
    
    console.log(`Webhook recebido: ${new Date().toISOString()}`);
    
    if (!signature) {
      console.error('Assinatura do Stripe ausente');
      return NextResponse.json(
        { error: 'Assinatura ausente' },
        { status: 400 }
      );
    }
    
    // Verificar assinatura do webhook
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
    
    console.log(`Evento recebido do Stripe: ${event.type} - ${event.id}`);
    
    // Tratar eventos de pagamento bem-sucedido
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(event.data.object);
    } else if (event.type === 'payment_intent.succeeded') {
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

// Função para processar checkout.session.completed
async function handleCheckoutSessionCompleted(session) {
  const { siteId, slug } = session.metadata;
  
  if (!siteId && !slug) {
    console.error('siteId e slug ausentes nos metadados da sessão');
    return;
  }
  
  console.log(`Processando pagamento completado para: ${siteId || slug}`);
  
  // Conectar ao banco de dados
  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error(`Erro de conexão ao banco de dados: ${dbError.message}`);
    throw dbError;
  }
  
  // Encontrar o site por ID ou slug
  let site;
  if (siteId) {
    site = await Site.findById(siteId);
  } else if (slug) {
    site = await Site.findOne({ slug });
  }
  
  if (!site) {
    console.error(`Site não encontrado: ${siteId || slug}`);
    return;
  }
  
  // Verificar se o site já está marcado como pago
  if (site.paid) {
    console.log(`Site ${site._id} (${site.slug}) já está marcado como pago`);
    return;
  }
  
  // Atualizar o site
  site.paid = true;
  site.expiresAt = null; // Remover data de expiração
  site.checkoutSessionId = session.id; // Armazenar ID da sessão
  
  try {
    await site.save();
    console.log(`Site ${site._id} (${site.slug}) marcado como pago com sucesso!`);
  } catch (saveError) {
    console.error(`Erro ao salvar site: ${saveError.message}`);
    throw saveError;
  }
  
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

// Função para processar payment_intent.succeeded
async function handlePaymentIntentSucceeded(paymentIntent) {
  const { siteId, slug } = paymentIntent.metadata;
  
  if (!siteId && !slug) {
    console.error('siteId e slug ausentes nos metadados do paymentIntent');
    return;
  }
  
  console.log(`Processando payment_intent.succeeded para: ${siteId || slug}`);
  
  // Conectar ao banco de dados
  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error(`Erro de conexão ao banco de dados: ${dbError.message}`);
    throw dbError;
  }
  
  // Encontrar o site por ID ou slug
  let site;
  if (siteId) {
    site = await Site.findById(siteId);
  } else if (slug) {
    site = await Site.findOne({ slug });
  }
  
  if (!site) {
    console.error(`Site não encontrado: ${siteId || slug}`);
    return;
  }
  
  // Verificar se o site já está marcado como pago
  if (site.paid) {
    console.log(`Site ${site._id} (${site.slug}) já está marcado como pago`);
    return;
  }
  
  // Atualizar o site
  site.paid = true;
  site.expiresAt = null; // Remover data de expiração
  site.paymentIntentId = paymentIntent.id; // Armazenar ID do payment intent
  
  try {
    await site.save();
    console.log(`Site ${site._id} (${site.slug}) marcado como pago com sucesso!`);
  } catch (saveError) {
    console.error(`Erro ao salvar site: ${saveError.message}`);
    throw saveError;
  }
  
  // Enviar email para o cliente
  const customerEmail = site.customerEmail;
  if (customerEmail) {
    try {
      await sendSiteEmail(customerEmail, site);
      console.log(`Email enviado para ${customerEmail}`);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }
  }
}