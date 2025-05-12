// Salve este arquivo como: src/app/api/create-checkout/route.js

import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';

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
    
    // Conecta ao banco de dados
    console.log('Conectando ao banco de dados...');
    await connectToDatabase();
    
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