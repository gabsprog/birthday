import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';
import BirthdayTemplate from '@/components/templates/BirthdayTemplate';
import AnniversaryTemplate from '@/components/templates/AnniversaryTemplate';
import DeclarationTemplate from '@/components/templates/DeclarationTemplate';

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
      notFound();
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
    
    // Render the appropriate template based on the site's template type
    const templateProps = {
      title: site.title,
      message: site.message,
      specialDate: site.specialDate,
      youtubeLink: site.youtubeLink,
      images: site.images,
      mode: 'view',
    };
    
    // Add custom texts for each template type
    if (site.templateType === 'birthday') {
      templateProps.customTexts = site.birthdayTexts || {};
    } else if (site.templateType === 'anniversary') {
      templateProps.customTexts = site.anniversaryTexts || {};
    } else if (site.templateType === 'declaration') {
      templateProps.customTexts = site.declarationTexts || {};
    }
    
    let TemplateComponent;
    
    switch (site.templateType) {
      case 'birthday':
        TemplateComponent = BirthdayTemplate;
        break;
      case 'anniversary':
        TemplateComponent = AnniversaryTemplate;
        break;
      case 'declaration':
        TemplateComponent = DeclarationTemplate;
        break;
      default:
        TemplateComponent = BirthdayTemplate;
    }
    
    return <TemplateComponent {...templateProps} />;
    
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