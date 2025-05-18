'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import SiteEditor from '@/components/SiteEditor';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [site, setSite] = useState(null);
  
  // Get slug and editHash from URL
  const slug = searchParams.get('slug');
  const editHash = searchParams.get('editHash');
  
  // Load site data on page load
  useEffect(() => {
    const fetchSite = async () => {
      if (!slug || !editHash) {
        setError('URL de edição inválida. Verifique se você está usando o link correto.');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Fetch site data from API
        const response = await axios.get(`/api/edit-site?slug=${slug}&editHash=${editHash}`);
        
        if (response.data && response.data.success) {
          setSite(response.data.site);
        } else {
          setError('Não foi possível carregar o site para edição.');
        }
      } catch (err) {
        console.error('Error fetching site for editing:', err);
        if (err.response) {
          if (err.response.status === 404) {
            setError('Site não encontrado ou código de edição inválido.');
          } else if (err.response.status === 403) {
            setError('Você não tem permissão para editar este site.');
          } else {
            setError(`Erro ao carregar o site: ${err.response.data?.error || 'Erro desconhecido'}`);
          }
        } else {
          setError('Não foi possível se conectar ao servidor. Verifique sua conexão e tente novamente.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSite();
  }, [slug, editHash]);
  
  // Handle update success
  const handleUpdateSuccess = () => {
    router.push(`/${slug}?updated=true`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      
      <main className="flex-grow pt-24 mb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Editar Seu Site</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Atualize sua mensagem especial, fotos e mais.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              <span className="ml-4 text-lg">Carregando seu site...</span>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                Erro
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {error}
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg"
              >
                Voltar à Página Inicial
              </button>
            </div>
          ) : site ? (
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
              <p className="text-blue-700 dark:text-blue-300">
                Editando <strong>{site.title}</strong> - {site.templateType === 'birthday' ? 'Aniversário' : site.templateType === 'anniversary' ? 'Aniversário de Casamento' : 'Declaração de Amor'}
              </p>
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                Link do site: <a href={`/${site.slug}`} className="underline" target="_blank">{site.slug}</a>
              </p>
            </div>
          ) : null}
          
          {site && (
            <SiteEditor 
              initialData={site} 
              editMode={true}
              editHash={editHash}
              onUpdateSuccess={handleUpdateSuccess}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}