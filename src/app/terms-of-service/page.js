import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | BirthdayLove.site',
  description: 'Terms of Service for BirthdayLove.site, including our policies on refunds and customer support.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Terms of Service</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to BirthdayLove.site. This website is operated by BirthdayLove Enterprise. 
              By accessing and using this website, you agree to comply with and be bound by the 
              following terms and conditions.
            </p>
            
            <h2>2. Service Description</h2>
            <p>
              BirthdayLove.site provides a platform for creating digital gifts for special occasions 
              such as birthdays, anniversaries, and love declarations. The digital gifts created on 
              our platform are intended for personal use only.
            </p>
            
            <h2>3. User Accounts</h2>
            <p>
              When you create a site on BirthdayLove.site, you are responsible for maintaining the 
              confidentiality of your site information, including your unique URLs. You are fully 
              responsible for all activities that occur under your account.
            </p>
            
            <h2>4. Payment Terms</h2>
            <p>
              The price for creating a digital gift is clearly stated on our website. Payment is required 
              to make your site permanent and accessible indefinitely. Unpaid sites will expire after 
              24 hours.
            </p>
            
            <h2>5. Refund Policy</h2>
            <p>
              <strong>No refunds are provided</strong> for purchases made on BirthdayLove.site, unless there is a 
              technical error that prevents your site from being created or accessed properly. In case 
              of a technical error, please contact us at birthdayloveenterprise@gmail.com for assistance.
            </p>
            
            <h2>6. Content Restrictions</h2>
            <p>
              You agree not to upload, share, or create content that:
            </p>
            <ul>
              <li>Is illegal or promotes illegal activities</li>
              <li>Is defamatory, obscene, or offensive</li>
              <li>Infringes on the intellectual property rights of others</li>
              <li>Contains malware, viruses, or other harmful code</li>
              <li>Violates the privacy of others</li>
            </ul>
            
            <h2>7. Limitation of Liability</h2>
            <p>
              BirthdayLove.site and its operators shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages resulting from your use of or inability to 
              use the service.
            </p>
            
            <h2>8. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting to the website. Your continued use of the website after any 
              changes indicates your acceptance of the modified terms.
            </p>
            
            <h2>9. Contact Information</h2>
            <p>
              If you have any questions or concerns about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:birthdayloveenterprise@gmail.com" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                birthdayloveenterprise@gmail.com
              </a>
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-12">
              Last updated: May 2025
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}