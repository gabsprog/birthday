'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SiteEditor from '@/components/SiteEditor';

// Componente que usa useSearchParams precisa estar dentro de um limite de Suspense
function EditPageContent() {
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
    <div className="container mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Edit Your Site</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Update your Messages, Photos, etc.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <span className="ml-4 text-lg">Loading your site...</span>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            Error
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg"
          >
            Back to initial page
          </button>
        </div>
      ) : site ? (
        <div>
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
            <p className="text-blue-700 dark:text-blue-300">
              Editing <strong>{site.title}</strong> - {site.templateType === 'birthday' ? 'Birthday' : site.templateType === 'anniversary' ? 'Anniversary' : 'Love Declaration'}
            </p>
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              Site link: <a href={`/${site.slug}`} className="underline" target="_blank">{site.slug}</a>
            </p>
          </div>
          
          <SiteEditor 
            initialData={site} 
            editMode={true}
            editHash={editHash}
            onUpdateSuccess={handleUpdateSuccess}
          />
        </div>
      ) : null}
    </div>
  );
}

// Componente principal que envolve o conteúdo com Suspense
export default function EditPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      
      <main className="flex-grow pt-24 mb-16">
        <Suspense fallback={
          <div className="container mx-auto px-4 text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading...</p>
          </div>
        }>
          <EditPageContent />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}