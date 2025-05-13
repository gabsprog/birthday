import { NextResponse } from 'next/server';

export const config = {
  matcher: '/api/:path*',
};

export default function middleware(request) {
  // Aumenta o timeout para requisições de API
  const response = NextResponse.next();
  
  // Adiciona headers para aumentar o timeout
  response.headers.set('Connection', 'keep-alive');
  response.headers.set('Keep-Alive', 'timeout=60');
  
  return response;
}