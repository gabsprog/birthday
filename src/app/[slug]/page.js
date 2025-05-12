import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';
import dynamic from 'next/dynamic';

// Importação dinâmica dos templates para evitar problemas de renderização
const BirthdayTemplate = dynamic(() => import('@/components/templates/BirthdayTemplate'), { ssr: false });
const AnniversaryTemplate = dynamic(() => import('@/components/templates/AnniversaryTemplate'), { ssr: false });
const DeclarationTemplate = dynamic(() => import('@/components/templates/DeclarationTemplate'), { ssr: false });

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    await connectToDatabase();
    const site = await Site.findOne({ slug });
    
    if (!site || (!site.paid && site.expiresAt && new Date(site.expiresAt) < new Date())) {
      return {
        title: 'Gift Not Found | BirthdayLove.site',
      };
    }
    
    return {
      title: `${site.title} | BirthdayLove.site`,
      description: `A special digital gift created with love on BirthdayLove.site`,
    };
  } catch (error) {
    console.error('Error fetching site metadata:', error);
    return {
      title: 'Digital Gift | BirthdayLove.site',
    };
  }
}

export default async function SitePage({ params }) {
  const { slug } = params;
  
  try {
    await connectToDatabase();
    const site = await Site.findOne({ slug });
    
    if (!site) {
      console.log(`Site not found with slug: ${slug}`);
      return notFound();
    }
    
    // Check if the site is paid or not expired
    if (!site.paid && site.expiresAt && new Date(site.expiresAt) < new Date()) {
      // Render expired page
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 dark:text-white">
            This Gift Has Expired
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
            This gift was created but never completed the payment process.
          </p>
          <a
            href="/"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg inline-block shadow-md transition-colors"
          >
            Create Your Own Gift
          </a>
        </div>
      );
    }
    
    // Preparar dados seguros para renderização 
    // Converter valores complexos para garantir que são serializáveis
    const safeProps = {
      title: site.title || '',
      message: site.message || '',
      specialDate: site.specialDate ? site.specialDate.toISOString() : null,
      youtubeLink: site.youtubeLink || '',
      images: Array.isArray(site.images) ? site.images : [],
      mode: 'view',
    };
    
    // Add custom texts for each template type, garantindo que são objetos simplificados
    if (site.templateType === 'birthday') {
      safeProps.customTexts = {
        headerTitle: site.birthdayTexts?.headerTitle || 'Happy Birthday!',
        customAge: site.birthdayTexts?.customAge || '',
        aboutSectionTitle: site.birthdayTexts?.aboutSectionTitle || 'About You',
        favoritesSectionTitle: site.birthdayTexts?.favoritesSectionTitle || 'What I Love About You',
        gallerySectionTitle: site.birthdayTexts?.gallerySectionTitle || 'Memory Gallery',
        messageSectionTitle: site.birthdayTexts?.messageSectionTitle || 'Birthday Message',
        buttonText: site.birthdayTexts?.buttonText || 'Click For Birthday Surprise',
        footerText: site.birthdayTexts?.footerText || 'Made with love',
        // Simplificar arrays complexos para array de objetos simples
        favorites: (site.birthdayTexts?.favorites || []).map(f => ({
          title: f.title || '', 
          description: f.description || ''
        })),
        aboutCards: (site.birthdayTexts?.aboutCards || []).map(c => ({
          title: c.title || '', 
          description: c.description || ''
        }))
      };
    } else if (site.templateType === 'anniversary') {
      safeProps.customTexts = {
        headerTitle: site.anniversaryTexts?.headerTitle || 'Our Anniversary',
        timeTogetherTitle: site.anniversaryTexts?.timeTogetherTitle || 'Time Together',
        journeyTitle: site.anniversaryTexts?.journeyTitle || 'Our Journey Together',
        momentsTitle: site.anniversaryTexts?.momentsTitle || 'Our Special Moments',
        messageTitle: site.anniversaryTexts?.messageTitle || 'Anniversary Message',
        songTitle: site.anniversaryTexts?.songTitle || 'Our Special Song',
        songCaption: site.anniversaryTexts?.songCaption || 'This melody speaks the words my heart cannot express',
        footerText: site.anniversaryTexts?.footerText || 'Happy Anniversary!',
        journeyMilestones: (site.anniversaryTexts?.journeyMilestones || []).map(m => ({
          title: m.title || '', 
          description: m.description || ''
        }))
      };
    } else if (site.templateType === 'declaration') {
      safeProps.customTexts = {
        headerTitle: site.declarationTexts?.headerTitle || 'Declaration of Love',
        headerQuote: site.declarationTexts?.headerQuote || 'Just as the stars are constant in the night sky, so is my love for you: eternal, bright, and guiding my way.',
        journeyTitle: site.declarationTexts?.journeyTitle || 'Our Journey Among the Stars',
        universeTitle: site.declarationTexts?.universeTitle || 'The Universe of Our Love',
        songTitle: site.declarationTexts?.songTitle || 'The Soundtrack of Our Love',
        songCaption: site.declarationTexts?.songCaption || 'This melody speaks the words my heart cannot express',
        messageTitle: site.declarationTexts?.messageTitle || 'My Declaration of Love',
        promiseTitle: site.declarationTexts?.promiseTitle || 'My Promise',
        promiseText: site.declarationTexts?.promiseText || 'I promise to love you, to cherish you, and to stand by your side through all of life\'s adventures.',
        signatureText: site.declarationTexts?.signatureText || 'With all my love,',
        signatureName: site.declarationTexts?.signatureName || 'Always Yours',
        footerText: site.declarationTexts?.footerText || 'Made with love',
        universeSymbols: (site.declarationTexts?.universeSymbols || []).map(s => ({
          title: s.title || '', 
          description: s.description || ''
        }))
      };
    }
    
    // Renderizar o template apropriado com client-side rendering
    // O "noSSR" é crucial para evitar problemas de hidratação
    switch (site.templateType) {
      case 'birthday':
        return <BirthdayTemplate {...safeProps} />;
      case 'anniversary':
        return <AnniversaryTemplate {...safeProps} />;
      case 'declaration':
        return <DeclarationTemplate {...safeProps} />;
      default:
        return <BirthdayTemplate {...safeProps} />;
    }
    
  } catch (error) {
    console.error('Error fetching site:', error);
    // Render error page
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 dark:text-white">
          Something Went Wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          We're having trouble loading this gift. Please try again later.
        </p>
        <a
          href="/"
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg inline-block shadow-md transition-colors"
        >
          Go to Homepage
        </a>
      </div>
    );
  }
}