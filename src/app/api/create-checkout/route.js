// src/app/api/create-checkout/route.js - Versão otimizada para Vercel
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import mongoose from 'mongoose';

// Configuração do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  timeout: 10000, // 10 segundos de timeout
});

// Configuração da rota para ambiente serverless
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Máximo de 30 segundos para Vercel Hobby/Pro

// Função auxiliar otimizada para conectar ao MongoDB
async function getMongoConnection() {
  if (mongoose.connection.readyState === 1) {
    console.log('Usando conexão MongoDB existente');
    return mongoose.connection;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI não está definido nas variáveis de ambiente');
  }

  console.log('Iniciando nova conexão com MongoDB...');
  try {
    const options = {
      bufferCommands: true,
      maxPoolSize: 5,
      minPoolSize: 1,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      serverSelectionTimeoutMS: 10000,
      family: 4, // Forçar IPv4
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('Conexão MongoDB estabelecida com sucesso');
    return mongoose.connection;
  } catch (error) {
    console.error('Falha ao conectar ao MongoDB:', error.message);
    throw error;
  }
}

export async function POST(request) {
  console.log('Iniciando processamento do checkout em:', new Date().toISOString());
  const startTime = Date.now();
  
  try {
    // Parse do corpo da requisição
    const body = await request.text();
    let data;
    
    try {
      data = JSON.parse(body);
      console.log('Dados recebidos:', { siteId: data.siteId });
    } catch (parseError) {
      console.error('Erro ao analisar corpo da requisição:', parseError);
      return NextResponse.json(
        { error: 'Formato de requisição inválido' },
        { status: 400 }
      );
    }
    
    // Validação básica
    const { siteId } = data;
    if (!siteId) {
      console.error('siteId não fornecido');
      return NextResponse.json(
        { error: 'ID do site é obrigatório' },
        { status: 400 }
      );
    }
    
    // Validar configuração do Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY não configurado');
      return NextResponse.json(
        { error: 'Sistema de pagamento não está configurado corretamente' },
        { status: 500 }
      );
    }
    
    // Conectar ao banco de dados
    console.log('Tempo até conexão DB:', Date.now() - startTime, 'ms');
    const db = await getMongoConnection();
    
    // Buscar o site
    const Site = mongoose.models.Site || mongoose.model('Site', new mongoose.Schema({
      slug: String,
      paid: Boolean,
      customerEmail: String,
      checkoutSessionId: String
    }));
    
    console.log('Buscando site:', siteId);
    const site = await Site.findById(siteId).lean();
    
    if (!site) {
      console.error('Site não encontrado:', siteId);
      return NextResponse.json(
        { error: 'Site não encontrado' },
        { status: 404 }
      );
    }
    
    console.log('Site encontrado:', {
      slug: site.slug,
      paid: site.paid
    });
    console.log('Tempo após busca do site:', Date.now() - startTime, 'ms');
    
    // Se o site já estiver pago, apenas retorna o slug
    if (site.paid) {
      console.log('Site já está pago, retornando slug');
      return NextResponse.json({
        success: true,
        paid: true,
        slug: site.slug
      });
    }
    
    // Criar sessão de checkout no Stripe
    console.log('Criando sessão de checkout no Stripe');
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      // Fallback para a URL da Vercel se a variável de ambiente não estiver definida
      baseUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}`;
      console.log('URL base não configurada, usando fallback:', baseUrl);
    }
    
    const successUrl = `${baseUrl}/success?site_id=${site._id}`;
    const cancelUrl = `${baseUrl}/create`;
    
    console.log('URLs de redirecionamento configuradas:', {
      success: successUrl,
      cancel: cancelUrl
    });
    
    // Criar sessão no Stripe com configurações otimizadas
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Site Digital Personalizado',
              description: `Presente para "${site.title || 'Pessoa Especial'}"`,
            },
            unit_amount: 400, // $4.00 em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        siteId: site._id.toString(),
        slug: site.slug,
      },
      customer_email: site.customerEmail || undefined,
    });
    
    console.log('Sessão de checkout criada:', session.id);
    console.log('Tempo após criação da sessão:', Date.now() - startTime, 'ms');
    
    // Atualizar site com o ID da sessão - não crítico para o fluxo
    try {
      await Site.findByIdAndUpdate(site._id, { checkoutSessionId: session.id });
      console.log('Site atualizado com ID da sessão de checkout');
    } catch (updateError) {
      console.error('Falha ao atualizar site com ID da sessão:', updateError.message);
      // Continuar mesmo com erro, não é crítico
    }
    
    // Retornar resposta de sucesso
    console.log('Requisição completa em:', Date.now() - startTime, 'ms');
    
    return NextResponse.json({
      success: true,
      url: session.url,
    });
    
  } catch (error) {
    console.error('Erro não tratado em create-checkout:', error);
    console.log('Requisição falhou após:', Date.now() - startTime, 'ms');
    
    // Log mais detalhado para depuração
    if (error.type && error.type.startsWith('Stripe')) {
      console.error('Erro do Stripe:', {
        type: error.type,
        code: error.code,
        param: error.param,
        detail: error.detail
      });
    }
    
    return NextResponse.json(
      { error: 'Falha ao criar sessão de pagamento: ' + error.message },
      { status: 500 }
    );
  }
}