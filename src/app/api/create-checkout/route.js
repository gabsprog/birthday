// src/app/api/create-checkout/route.js

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
    
    // Conecta ao banco de dados com configuração robusta
    try {
      console.log('Conectando ao banco de dados...');
      await connectToDatabase({
        maxRetries: 5,
        retryDelayMs: 1500,
        forceNewConnection: false
      });
      console.log('Conexão com banco de dados estabelecida e verificada');
    } catch (dbError) {
      console.error('Falha na conexão com o banco de dados após múltiplas tentativas:', dbError);
      return NextResponse.json(
        { error: 'Falha na conexão com o banco de dados: ' + dbError.message },
        { status: 500 }
      );
    }
    
    // Busca o site com tratamento explícito de erros
    let site = null;
    try {
      site = await Site.findById(siteId).exec();
      
      if (!site) {
        console.error(`Site não encontrado: ${siteId}`);
        return NextResponse.json(
          { error: 'Site não encontrado' },
          { status: 404 }
        );
      }
      
      console.log('Site encontrado:', {
        id: site._id.toString(),
        slug: site.slug,
        paid: site.paid
      });
    } catch (findError) {
      console.error('Erro ao buscar site:', findError);
      return NextResponse.json(
        { error: 'Erro ao buscar site: ' + findError.message },
        { status: 500 }
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
    
    // Verifica se Stripe está configurado corretamente
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY não está configurado');
      return NextResponse.json(
        { error: 'Sistema de pagamento não está configurado corretamente' },
        { status: 500 }
      );
    }
    
    // Verifica se a URL base está configurada
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('NEXT_PUBLIC_BASE_URL não está configurado');
      return NextResponse.json(
        { error: 'URL base não está configurada corretamente' },
        { status: 500 }
      );
    }
    
    // Cria uma sessão de checkout no Stripe com tratamento explícito de erros
    let session;
    try {
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
      
      console.log('Sessão de checkout criada com sucesso:', {
        sessionId: session.id,
        url: session.url
      });
    } catch (stripeError) {
      console.error('Erro ao criar sessão de checkout no Stripe:', stripeError);
      return NextResponse.json(
        { error: 'Falha ao criar sessão de checkout: ' + stripeError.message },
        { status: 500 }
      );
    }
    
    // Atualiza o site com o ID da sessão - tratado separadamente
    try {
      site.checkoutSessionId = session.id;
      await site.save();
      console.log('Site atualizado com ID da sessão de checkout');
    } catch (updateError) {
      console.error('Erro ao atualizar site com ID da sessão:', updateError);
      // Não crítico - continua mesmo se esta atualização falhar
    }
    
    return NextResponse.json({
      success: true,
      url: session.url,
    });
    
  } catch (error) {
    console.error('Erro não tratado ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Falha ao criar sessão de checkout: ' + error.message },
      { status: 500 }
    );
  }
}