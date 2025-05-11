import SiteEditor from '@/components/SiteEditor';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Create Your Gift | BirthdayLove.site',
  description: 'Create a personalized digital gift for your loved ones. Choose from birthday, anniversary, or love declaration templates.',
};

export default function CreatePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow mt-24 mb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Your Special Gift</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Personalize your digital gift with a message, photos, and more.
            </p>
          </div>
          
          <SiteEditor />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}