'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import QRCode from 'qrcode.react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link'; // Certifique-se de importar o Link

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [site, setSite] = useState(null);
  
  const siteId = searchParams.get('site_id');
  
  useEffect(() => {
    console.log('Página de sucesso carregada com site_id:', siteId);
    
    if (!siteId) {
      setError('Informações do site ausentes. Seu pagamento pode ter sido processado, mas não foi possível localizar seu site.');
      setIsLoading(false);
      return;
    }
    
    const fetchSite = async () => {
      try {
        // Para desenvolvimento sem uma API real
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          console.log('MODO DEV: Simulando busca de site');
          // Criar dados mockados para teste
          const mockSite = {
            slug: `test-site-${Math.random().toString(36).substring(2, 7)}`,
            title: 'Site de Teste',
            customerEmail: 'test@example.com',
            paid: true
          };
          
          // Simular atraso de carregamento
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          setSite(mockSite);
          setIsLoading(false);
          return;
        }
        
        // Chamada da API real para produção
        console.log('Buscando dados do site...');
        const response = await axios.get(`/api/site/${siteId}`);
        
        if (response.data.success) {
          console.log('Dados do site recebidos:', response.data);
          setSite(response.data.site);
        } else {
          throw new Error('Falha ao buscar detalhes do site');
        }
      } catch (error) {
        console.error('Erro ao buscar site:', error);
        setError('Não foi possível carregar os detalhes do seu site. Por favor, verifique seu e-mail para o link do site.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Adicionar um pequeno atraso para permitir que o webhook processe o pagamento
    const timer = setTimeout(() => {
      fetchSite();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [siteId]);
  
  const siteUrl = site ? `${window.location.origin}/${site.slug}` : '';
  
  return (
    <>
      <Header />
      
      <main className="mt-24 mb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Processando seu pagamento...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Isso pode levar alguns instantes.
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                  <p>{error}</p>
                </div>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Se você concluiu o pagamento, deverá receber um e-mail com o link do seu site em breve.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg"
                >
                  Voltar à Página Inicial
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6">
                    <h1 className="text-2xl font-bold mb-2">Pagamento Concluído!</h1>
                    <p>Seu presente especial está pronto para ser compartilhado.</p>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">QR Code do Seu Site</h2>
                    <div className="bg-white p-4 rounded-lg mx-auto w-fit">
                      <QRCode 
                        value={siteUrl} 
                        size={200} 
                        level="H"
                        fgColor="#f05252"
                        renderAs="svg"
                      />
                    </div>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      Escaneie este QR code para abrir seu site
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Link do Seu Site</h2>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg break-all">
                      <a 
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {siteUrl}
                      </a>
                    </div>
                    <div className="mt-4 flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(siteUrl);
                          alert('Link copiado para a área de transferência!');
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg inline-block"
                      >
                        Copiar Link
                      </button>
                      <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg inline-block"
                      >
                        Visitar Site
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                  <h3 className="font-medium mb-4">O que acontece agora?</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Enviamos um e-mail para {site?.customerEmail || 'seu endereço de e-mail'} com o link do site e o QR code.
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Seu site estará disponível permanentemente.
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Compartilhe o link ou QR code com seu ente querido para surpreendê-lo!
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 text-center">
                  <Link
                    href="/create"
                    className="bg-white border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium px-6 py-3 rounded-lg inline-block"
                  >
                    Criar Outro Presente
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}