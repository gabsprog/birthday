'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import TemplateSelector from './TemplateSelector';
import BirthdayTemplate from './templates/BirthdayTemplate';
import AnniversaryTemplate from './templates/AnniversaryTemplate';
import DeclarationTemplate from './templates/DeclarationTemplate';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import ImageUpload from './ui/ImageUpload';
import { validateYoutubeUrl, isValidEmail } from '@/lib/utils';
import Select from './ui/Select';
import { Tab } from '@headlessui/react';

const SiteEditor = ({ 
    initialData = null, 
    editMode = false, 
    editHash = null,
    onUpdateSuccess = () => {} 
  }) => {
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [currentTab, setCurrentTab] = useState(0);
  
  // Extended form state for full customization
  const [formData, setFormData] = useState(
    initialData ? 
    {
      templateType: initialData.templateType,
      title: initialData.title,
      message: initialData.message,
      specialDate: initialData.specialDate ? new Date(initialData.specialDate).toISOString().split('T')[0] : '',
      youtubeLink: initialData.youtubeLink || '',
      customerEmail: initialData.customerEmail || '',
      images: initialData.images || [],
      
      // Template-specific data
      birthday: initialData.birthday || { /* default birthday values */ },
      anniversary: initialData.anniversary || { /* default anniversary values */ },
      declaration: initialData.declaration || { /* default declaration values */ }
    } 
    : 
    {

    templateType: 'birthday',
    title: '',
    message: '',
    specialDate: '',
    youtubeLink: '',
    customerEmail: '',
    images: [],
    
    // Custom birthday template text fields
    birthday: {
      headerTitle: 'Happy Birthday!',
      aboutSectionTitle: 'About You',
      favoritesSectionTitle: 'What I Love About You',
      gallerySectionTitle: 'Memory Gallery',
      messageSectionTitle: 'Birthday Message',
      favorites: [
        { title: 'Your Smile', description: 'A smile that lights up any room and brightens everyone around. Your smile has the power to transform bad days into special moments.' },
        { title: 'Your Intelligence', description: 'The way you think and solve problems is admirable. Your brilliant mind sees solutions where others only see obstacles.' },
        { title: 'Your Heart', description: 'A heart full of love and compassion, always ready to help others and make a difference in the lives of those around you.' },
        { title: 'Your Determination', description: 'When you set your mind to something, there\'s no obstacle that can stop you. Your willpower and perseverance are inspiring.' },
        { title: 'Your Authenticity', description: 'You are genuinely yourself, without masks or pretensions. Your authenticity is rare and precious in today\'s world.' }
      ],
      aboutCards: [
        { title: 'Amazing Person ❤️', description: 'You are the most incredible person I\'ve ever met. A life journey marked by achievements, smiles, and special moments. Your presence brightens any room, and your smile can transform the gloomiest days into colorful ones.' },
        { title: 'Our Story', description: 'From the very first moment, I knew you were special. The way we met, every moment together, every shared laugh. We\'ve built memories that I\'ll cherish forever.' },
        { title: 'Unforgettable Moments', description: 'Every moment by your side becomes unforgettable. Your unique way of seeing the world, your determination, and your generous heart make any experience more special.' }
      ],
      footerText: 'Made with love',
      buttonText: 'Click For Birthday Surprise'
    },
    
    // Custom anniversary template text fields
    anniversary: {
      headerTitle: 'Our Anniversary',
      timeTogetherTitle: 'Time Together',
      journeyTitle: 'Our Journey Together',
      momentsTitle: 'Our Special Moments',
      messageTitle: 'Anniversary Message',
      journeyMilestones: [
        { title: 'First Meeting', description: 'The day our paths crossed for the first time. It was the beginning of a beautiful journey.' },
        { title: 'First Date', description: 'The butterflies, the excitement, the conversations that seemed to never end.' },
        { title: 'Official Relationship', description: 'The day we decided to commit to each other, beginning this beautiful journey together.' },
        { title: 'Special Milestone', description: 'A significant moment that made our bond even stronger. The journey continues with love growing each day.' }
      ],
      songTitle: 'Our Special Song',
      songCaption: 'This melody speaks the words my heart cannot express',
      footerText: 'Happy Anniversary!'
    },
    
    // Custom declaration template text fields
    declaration: {
      headerTitle: 'Declaration of Love',
      headerQuote: 'Just as the stars are constant in the night sky, so is my love for you: eternal, bright, and guiding my way.',
      journeyTitle: 'Our Journey Among the Stars',
      universeTitle: 'The Universe of Our Love',
      universeSymbols: [
        { title: 'Loyalty', description: 'Like a distant star that remains constant, my loyalty to you will never waver.' },
        { title: 'Infinite Love', description: 'As vast as the universe itself, my love for you knows no limits or boundaries.' },
        { title: 'Destiny', description: 'Like celestial bodies drawn together by gravity, we were meant to find each other.' }
      ],
      songTitle: 'The Soundtrack of Our Love',
      songCaption: 'This melody speaks the words my heart cannot express',
      messageTitle: 'My Declaration of Love',
      signatureText: 'With all my love,',
      signatureName: 'Always Yours',
      promiseTitle: 'My Promise',
      promiseText: 'I promise to love you, to cherish you, and to stand by your side through all of life\'s adventures. Like the stars that light up the darkest night, I will be there to illuminate your path, forever and always.',
      footerText: 'Made with love'
    }
  });
  
  // Handle input changes for main fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for this field when it changes
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle template-specific text changes
  const handleTemplateTextChange = (templateType, field, value, index = null) => {
    setFormData(prev => {
      const updatedData = { ...prev };
      
      if (index !== null) {
        // Handle array fields (like favorites, milestones, etc.)
        if (field.includes('.')) {
          // Handle nested properties in arrays (e.g., "favorites.title")
          const [arrayField, property] = field.split('.');
          updatedData[templateType][arrayField][index][property] = value;
        } else {
          // Handle direct array updates
          updatedData[templateType][field][index] = value;
        }
      } else if (field.includes('.')) {
        // Handle nested properties (e.g., "aboutCards.0.title")
        const parts = field.split('.');
        let target = updatedData[templateType];
        
        // Navigate to the nested object
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!isNaN(part)) {
            // It's an array index
            target = target[parts[i-1]][parseInt(part)];
          } else if (i < parts.length - 2 && !isNaN(parts[i+1])) {
            // Skip - this is an array name and will be handled in the next iteration
            continue;
          } else {
            // It's an object property
            if (!target[part]) target[part] = {};
            target = target[part];
          }
        }
        
        // Set the final value
        target[parts[parts.length - 1]] = value;
      } else {
        // Handle direct property update
        updatedData[templateType][field] = value;
      }
      
      return updatedData;
    });
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateType) => {
    setFormData((prev) => ({ ...prev, templateType }));
  };
  
  // Handle image upload
  const handleImageUpload = async (files) => {
    setIsLoading(true);
    setFormErrors((prev) => ({ ...prev, imageUpload: '' }));
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 second timeout
          });
          
          return response.data.url;
        } catch (uploadError) {
          console.error('Error uploading file:', file.name, uploadError);
          
          // Capture more detailed error information
          let errorMessage = 'Upload failed';
          if (uploadError.response) {
            // The server responded with an error
            errorMessage = uploadError.response.data?.error || `Server error: ${uploadError.response.status}`;
          } else if (uploadError.request) {
            // The request was made but no response was received
            errorMessage = 'No response from server. Please check your internet connection.';
          } else {
            // Something happened in setting up the request
            errorMessage = uploadError.message;
          }
          
          throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      });
      
      try {
        const uploadedImageUrls = await Promise.all(uploadPromises);
        
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImageUrls],
        }));
      } catch (error) {
        setFormErrors((prev) => ({ 
          ...prev, 
          imageUpload: error.message 
        }));
      }
    } catch (error) {
      console.error('Error in image upload process:', error);
      setFormErrors((prev) => ({ 
        ...prev, 
        imageUpload: 'Failed to upload images. Please try again.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle image removal
  const handleImageRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    if (formData.templateType === 'anniversary' && !formData.specialDate) {
      errors.specialDate = 'Date is required for anniversary template';
    }
    
    if (formData.youtubeLink) {
      const youtubeValid = validateYoutubeUrl(formData.youtubeLink);
      if (!youtubeValid.isValid) {
        errors.youtubeLink = 'Please enter a valid YouTube URL';
      }
    }
    
    // Só validar email se não estiver no modo de edição
    if (!editMode) {
      if (!formData.customerEmail) {
        errors.customerEmail = 'Email is required';
      } else if (!isValidEmail(formData.customerEmail)) {
        errors.customerEmail = 'Please enter a valid email address';
      }
    }
    
    return errors;
  };
  
  // Handle form submission
  // Locate this function in src/components/SiteEditor.js and replace it with this version
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (editMode) {
        // Se estamos no modo de edição, enviamos uma requisição PUT para a API de edição
        console.log('Atualizando site existente...');
        
        // Prepare dados para atualização - não inclua customerEmail em edições
        const updateData = { ...formData };
        delete updateData.customerEmail; // Não permitir alterar o email nas edições
        
        // Adicionar o editHash para autenticação
        updateData.editHash = editHash;
        updateData.slug = initialData.slug;
        
        const updateResponse = await axios.put('/api/edit-site', updateData, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Resposta de atualização:', updateResponse.data);
        
        if (updateResponse.data.success) {
          // Notificar que a atualização foi bem-sucedida
          alert('Site atualizado com sucesso!');
          onUpdateSuccess();
        } else {
          console.error('Erro na resposta de atualização:', updateResponse.data);
          alert('Erro ao atualizar o site. Por favor, tente novamente.');
        }
      } else {
        // Adicionar log para depuração
        console.log('Iniciando processo de criação do site...');
        console.log('Dados do formulário:', {
          templateType: formData.templateType,
          title: formData.title,
          customerEmail: formData.customerEmail,
          // Não logar a mensagem completa por privacidade
        });
        
        // Criar o site
        console.log('Enviando requisição para /api/create-site...');
        const createSiteResponse = await axios.post('/api/create-site', formData, {
          timeout: 30000, // Aumentar timeout para 30 segundos
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Resposta recebida de create-site:', createSiteResponse.data);
        
        if (createSiteResponse.data.success) {
          const siteId = createSiteResponse.data.siteId;
          
          // Criar a sessão de checkout
          console.log('Criando sessão de checkout para o site:', siteId);
          const checkoutResponse = await axios.post('/api/create-checkout', {
            siteId: siteId
          });
          
          console.log('Resposta de checkout:', checkoutResponse.data);
          
          if (checkoutResponse.data.success) {
            // Se já estiver pago, redirecionar para a página de sucesso
            if (checkoutResponse.data.paid) {
              router.push(`/success?site_id=${siteId}`);
              return;
            }
            
            // Redirecionar para a página de checkout do Stripe
            console.log('Redirecionando para:', checkoutResponse.data.url);
            window.location.href = checkoutResponse.data.url;
          } else {
            console.error('Erro na resposta do checkout:', checkoutResponse.data);
            alert('Erro ao criar a sessão de pagamento. Por favor, tente novamente.');
          }
        } else {
          console.error('Erro na resposta de criação do site:', createSiteResponse.data);
          alert('Erro ao criar o site. Por favor, tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro durante o processo:', error);
      
      // Tratamento de erro aprimorado
      let errorMessage = 'Falha ao criar seu site. Por favor, tente novamente.';
      
      if (error.response) {
        // O servidor respondeu com um status de erro
        console.error('Erro do servidor:', {
          status: error.response.status,
          data: error.response.data
        });
        
        errorMessage = `Erro do servidor (${error.response.status}): ${
          error.response.data?.error || 'Erro desconhecido'
        }`;
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Sem resposta do servidor. Requisição:', error.request);
        errorMessage = 'Sem resposta do servidor. A requisição expirou ou o servidor está inacessível.';
      } else {
        // Erro na configuração da requisição
        console.error('Erro na configuração da requisição:', error.message);
        errorMessage = `Erro: ${error.message}`;
      }
      
      // Mostrar alerta com detalhes
      alert(`${errorMessage}\n\nVerifique o console para mais detalhes ou tente novamente mais tarde.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render template preview based on the selected template
  const renderTemplatePreview = () => {
    // Common preview props
    const previewProps = {
      title: formData.title || 'Your Title Here',
      message: formData.message || 'Your message will appear here. Write something special for your loved one.',
      specialDate: formData.specialDate,
      youtubeLink: formData.youtubeLink,
      images: formData.images.length > 0 ? formData.images : ['/images/templates/placeholder.jpg'],
      mode: 'preview',
    };
    
    switch (formData.templateType) {
      case 'birthday':
        return <BirthdayTemplate 
          {...previewProps} 
          customTexts={formData.birthday}
        />;
      case 'anniversary':
        return <AnniversaryTemplate 
          {...previewProps}
          customTexts={formData.anniversary}
        />;
      case 'declaration':
        return <DeclarationTemplate 
          {...previewProps}
          customTexts={formData.declaration}
        />;
      default:
        return <BirthdayTemplate {...previewProps} />;
    }
  };
  
  // Add a new item to an array field
  const addArrayItem = (templateType, field, defaultItem) => {
    setFormData(prev => {
      const updatedData = { ...prev };
      updatedData[templateType][field] = [...updatedData[templateType][field], defaultItem];
      return updatedData;
    });
  };
  
  // Remove an item from an array field
  const removeArrayItem = (templateType, field, index) => {
    setFormData(prev => {
      const updatedData = { ...prev };
      updatedData[templateType][field] = updatedData[templateType][field].filter((_, i) => i !== index);
      return updatedData;
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 xl:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selection */}
            <TemplateSelector
              selectedTemplate={formData.templateType}
              onSelectTemplate={handleTemplateSelect}
            />
            
            {/* Tab navigation for form sections */}
            <div className="mb-4">
              <Tab.Group selectedIndex={currentTab} onChange={setCurrentTab}>
                <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                  <Tab 
                    className={({ selected }) =>
                      `w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all
                       ${selected 
                         ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400' 
                         : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-500'
                       }`
                    }
                  >
                    Basic Info
                  </Tab>
                  <Tab 
                    className={({ selected }) =>
                      `w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all
                       ${selected 
                         ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400' 
                         : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-500'
                       }`
                    }
                  >
                    Custom Text
                  </Tab>
                  <Tab 
                    className={({ selected }) =>
                      `w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all
                       ${selected 
                         ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400' 
                         : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-500'
                       }`
                    }
                  >
                    Media
                  </Tab>
                </Tab.List>
                
                <Tab.Panels className="mt-4">
                  {/* Basic Info Panel */}
                  <Tab.Panel>
                    <div className="space-y-4">
                      {/* Title */}
                      <Input
                        id="title"
                        name="title"
                        label="Title"
                        placeholder="E.g., Happy Birthday Sarah! or John & Lisa's Anniversary"
                        value={formData.title}
                        onChange={handleChange}
                        error={formErrors.title}
                        required
                      />

                      <Input
                        label="Custom Age"
                        value={formData.birthday.customAge || ''}
                        onChange={(e) => handleTemplateTextChange('birthday', 'customAge', e.target.value)}
                        placeholder="Ex: 30"
                        type="number"
                        />
                      
                      {/* Special Date (conditional based on template) */}
                      {(formData.templateType === 'anniversary' || formData.templateType === 'birthday' || formData.templateType === 'declaration') && (
                        <Input
                          id="specialDate"
                          name="specialDate"
                          type="date"
                          label={
                            formData.templateType === 'anniversary' 
                              ? 'Anniversary Date' 
                              : formData.templateType === 'birthday'
                                ? 'Birth Date'
                                : 'Special Date'
                          }
                          value={formData.specialDate}
                          onChange={handleChange}
                          error={formErrors.specialDate}
                          required={formData.templateType === 'anniversary'}
                        />
                      )}
                      
                      {/* Main Message */}
                      <Textarea
                        id="message"
                        name="message"
                        label="Your Message"
                        placeholder="Write your special message here..."
                        value={formData.message}
                        onChange={handleChange}
                        error={formErrors.message}
                        required
                        rows={8}
                      />
                      
                      {!editMode && (
                        <Input
                          id="customerEmail"
                          name="customerEmail"
                          type="email"
                          label="Your Email"
                          placeholder="We'll send the site link to this email"
                          value={formData.customerEmail}
                          onChange={handleChange}
                          error={formErrors.customerEmail}
                          required
                        />
                      )}
                      
                    </div>
                  </Tab.Panel>
                  
                  {/* Custom Text Panel */}
                  <Tab.Panel>
                    <div className="space-y-4">
                      {/* Render different customization options based on template type */}
                      {formData.templateType === 'birthday' && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Birthday Template Text</h3>
                          
                          {/* Section Titles */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Section Titles</h4>
                            
                            <Input
                              label="Header Title"
                              value={formData.birthday.headerTitle}
                              onChange={(e) => handleTemplateTextChange('birthday', 'headerTitle', e.target.value)}
                              placeholder="Happy Birthday!"
                            />
                            
                            <Input
                              label="About Section Title"
                              value={formData.birthday.aboutSectionTitle}
                              onChange={(e) => handleTemplateTextChange('birthday', 'aboutSectionTitle', e.target.value)}
                              placeholder="About You"
                            />
                            
                            <Input
                              label="Favorites Section Title"
                              value={formData.birthday.favoritesSectionTitle}
                              onChange={(e) => handleTemplateTextChange('birthday', 'favoritesSectionTitle', e.target.value)}
                              placeholder="What I Love About You"
                            />
                            
                            <Input
                              label="Gallery Section Title"
                              value={formData.birthday.gallerySectionTitle}
                              onChange={(e) => handleTemplateTextChange('birthday', 'gallerySectionTitle', e.target.value)}
                              placeholder="Memory Gallery"
                            />
                            
                            <Input
                              label="Message Section Title"
                              value={formData.birthday.messageSectionTitle}
                              onChange={(e) => handleTemplateTextChange('birthday', 'messageSectionTitle', e.target.value)}
                              placeholder="Birthday Message"
                            />
                          </div>
                          
                          {/* Favorite Things Section */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-700 dark:text-gray-300">Favorite Things</h4>
                              <Button 
                                onClick={() => addArrayItem('birthday', 'favorites', { title: 'New Item', description: 'Description here' })}
                                variant="outline" 
                                size="sm"
                              >
                                Add Item
                              </Button>
                            </div>
                            
                            {formData.birthday.favorites.map((item, index) => (
                              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium">Item {index + 1}</h5>
                                  <Button 
                                    onClick={() => removeArrayItem('birthday', 'favorites', index)}
                                    variant="danger" 
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                
                                <Input
                                  label="Title"
                                  value={item.title}
                                  onChange={(e) => handleTemplateTextChange('birthday', 'favorites.title', e.target.value, index)}
                                />
                                
                                <Textarea
                                  label="Description"
                                  value={item.description}
                                  onChange={(e) => handleTemplateTextChange('birthday', 'favorites.description', e.target.value, index)}
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* About Cards Section */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-700 dark:text-gray-300">About Cards</h4>
                              <Button 
                                onClick={() => addArrayItem('birthday', 'aboutCards', { title: 'New Card', description: 'Card description here' })}
                                variant="outline" 
                                size="sm"
                              >
                                Add Card
                              </Button>
                            </div>
                            
                            {formData.birthday.aboutCards.map((card, index) => (
                              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium">Card {index + 1}</h5>
                                  <Button 
                                    onClick={() => removeArrayItem('birthday', 'aboutCards', index)}
                                    variant="danger" 
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                
                                <Input
                                  label="Title"
                                  value={card.title}
                                  onChange={(e) => handleTemplateTextChange('birthday', 'aboutCards.title', e.target.value, index)}
                                />
                                
                                <Textarea
                                  label="Description"
                                  value={card.description}
                                  onChange={(e) => handleTemplateTextChange('birthday', 'aboutCards.description', e.target.value, index)}
                                  rows={3}
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Other Elements */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Other Elements</h4>
                            
                            <Input
                              label="Button Text"
                              value={formData.birthday.buttonText}
                              onChange={(e) => handleTemplateTextChange('birthday', 'buttonText', e.target.value)}
                              placeholder="Click For Birthday Surprise"
                            />
                            
                            <Input
                              label="Footer Text"
                              value={formData.birthday.footerText}
                              onChange={(e) => handleTemplateTextChange('birthday', 'footerText', e.target.value)}
                              placeholder="Made with love"
                            />
                          </div>
                        </div>
                      )}
                      
                      {formData.templateType === 'anniversary' && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Anniversary Template Text</h3>
                          
                          {/* Section Titles */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Section Titles</h4>
                            
                            <Input
                              label="Header Title"
                              value={formData.anniversary.headerTitle}
                              onChange={(e) => handleTemplateTextChange('anniversary', 'headerTitle', e.target.value)}
                              placeholder="Our Anniversary"
                            />
                            
                            <Input
                              label="Time Together Title"
                              value={formData.anniversary.timeTogetherTitle}
                              onChange={(e) => handleTemplateTextChange('anniversary', 'timeTogetherTitle', e.target.value)}
                              placeholder="Time Together"
                            />
                            
                            <Input
                              label="Journey Title"
                              value={formData.anniversary.journeyTitle}
                              onChange={(e) => handleTemplateTextChange('anniversary', 'journeyTitle', e.target.value)}
                              placeholder="Our Journey Together"
                            />
                            
                            <Input
                              label="Moments Title"
                              value={formData.anniversary.momentsTitle}
                              onChange={(e) => handleTemplateTextChange('anniversary', 'momentsTitle', e.target.value)}
                              placeholder="Our Special Moments"
                            />
                            
                            <Input
                              label="Message Title"
                              value={formData.anniversary.messageTitle}
                              onChange={(e) => handleTemplateTextChange('anniversary', 'messageTitle', e.target.value)}
                              placeholder="Anniversary Message"
                            />
                          </div>
                          
                          {/* Journey Milestones */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-700 dark:text-gray-300">Journey Milestones</h4>
                              <Button 
                                onClick={() => addArrayItem('anniversary', 'journeyMilestones', { title: 'New Milestone', description: 'Description here' })}
                                variant="outline" 
                                size="sm"
                              >
                                Add Milestone
                              </Button>
                            </div>
                            
                            {formData.anniversary.journeyMilestones.map((milestone, index) => (
                              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium">Milestone {index + 1}</h5>
                                  <Button 
                                    onClick={() => removeArrayItem('anniversary', 'journeyMilestones', index)}
                                    variant="danger" 
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                
                                <Input
                                  label="Title"
                                  value={milestone.title}
                                  onChange={(e) => handleTemplateTextChange('anniversary', 'journeyMilestones.title', e.target.value, index)}
                                />
                                
                                <Textarea
                                  label="Description"
                                  value={milestone.description}
                                  onChange={(e) => handleTemplateTextChange('anniversary', 'journeyMilestones.description', e.target.value, index)}
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Song Section */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Song Section</h4>
                            
                            <Input
                              label="Song Title"
                              value={formData.anniversary.songTitle}
                              onChange={(e) => handleTemplateTextChange('anniversary', 'songTitle', e.target.value)}
                              placeholder="Our Special Song"
                            />
                            
                            <Input
                              label="Song Caption"
                              value={formData.anniversary.songCaption}
                              onChange={(e) => handleTemplateTextChange('anniversary', 'songCaption', e.target.value)}
                              placeholder="This melody speaks the words my heart cannot express"
                            />
                          </div>
                          
                          {/* Footer */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Footer</h4>
                            
                            <Input
                              label="Footer Text"
                              value={formData.anniversary.footerText}
                              onChange={(e) => handleTemplateTextChange('anniversary', 'footerText', e.target.value)}
                              placeholder="Happy Anniversary!"
                            />
                          </div>
                        </div>
                      )}
                      
                      {formData.templateType === 'declaration' && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Declaration Template Text</h3>
                          
                          {/* Header Section */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Header Section</h4>
                            
                            <Input
                              label="Header Title"
                              value={formData.declaration.headerTitle}
                              onChange={(e) => handleTemplateTextChange('declaration', 'headerTitle', e.target.value)}
                              placeholder="Declaration of Love"
                            />
                            
                            <Textarea
                              label="Header Quote"
                              value={formData.declaration.headerQuote}
                              onChange={(e) => handleTemplateTextChange('declaration', 'headerQuote', e.target.value)}
                              placeholder="Just as the stars are constant in the night sky, so is my love for you: eternal, bright, and guiding my way."
                              rows={3}
                            />
                          </div>
                          
                          {/* Section Titles */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Section Titles</h4>
                            
                            <Input
                              label="Journey Title"
                              value={formData.declaration.journeyTitle}
                              onChange={(e) => handleTemplateTextChange('declaration', 'journeyTitle', e.target.value)}
                              placeholder="Our Journey Among the Stars"
                            />
                            
                            <Input
                              label="Universe Title"
                              value={formData.declaration.universeTitle}
                              onChange={(e) => handleTemplateTextChange('declaration', 'universeTitle', e.target.value)}
                              placeholder="The Universe of Our Love"
                            />
                            
                            <Input
                              label="Song Title"
                              value={formData.declaration.songTitle}
                              onChange={(e) => handleTemplateTextChange('declaration', 'songTitle', e.target.value)}
                              placeholder="The Soundtrack of Our Love"
                            />
                            
                            <Input
                              label="Message Title"
                              value={formData.declaration.messageTitle}
                              onChange={(e) => handleTemplateTextChange('declaration', 'messageTitle', e.target.value)}
                              placeholder="My Declaration of Love"
                            />
                            
                            <Input
                              label="Promise Title"
                              value={formData.declaration.promiseTitle}
                              onChange={(e) => handleTemplateTextChange('declaration', 'promiseTitle', e.target.value)}
                              placeholder="My Promise"
                            />
                          </div>
                          
                          {/* Universe Symbols */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-700 dark:text-gray-300">Universe Symbols</h4>
                              <Button 
                                onClick={() => addArrayItem('declaration', 'universeSymbols', { title: 'New Symbol', description: 'Description here' })}
                                variant="outline" 
                                size="sm"
                              >
                                Add Symbol
                              </Button>
                            </div>
                            
                            {formData.declaration.universeSymbols.map((symbol, index) => (
                              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium">Symbol {index + 1}</h5>
                                  <Button 
                                    onClick={() => removeArrayItem('declaration', 'universeSymbols', index)}
                                    variant="danger" 
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                
                                <Input
                                  label="Title"
                                  value={symbol.title}
                                  onChange={(e) => handleTemplateTextChange('declaration', 'universeSymbols.title', e.target.value, index)}
                                />
                                
                                <Textarea
                                  label="Description"
                                  value={symbol.description}
                                  onChange={(e) => handleTemplateTextChange('declaration', 'universeSymbols.description', e.target.value, index)}
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Song Section */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Song Section</h4>
                            
                            <Input
                              label="Song Caption"
                              value={formData.declaration.songCaption}
                              onChange={(e) => handleTemplateTextChange('declaration', 'songCaption', e.target.value)}
                              placeholder="This melody speaks the words my heart cannot express"
                            />
                          </div>
                          
                          {/* Signature */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Signature</h4>
                            
                            <Input
                              label="Signature Text"
                              value={formData.declaration.signatureText}
                              onChange={(e) => handleTemplateTextChange('declaration', 'signatureText', e.target.value)}
                              placeholder="With all my love,"
                            />
                            
                            <Input
                              label="Signature Name"
                              value={formData.declaration.signatureName}
                              onChange={(e) => handleTemplateTextChange('declaration', 'signatureName', e.target.value)}
                              placeholder="Always Yours"
                            />
                          </div>
                          
                          {/* Promise */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Promise</h4>
                            
                            <Textarea
                              label="Promise Text"
                              value={formData.declaration.promiseText}
                              onChange={(e) => handleTemplateTextChange('declaration', 'promiseText', e.target.value)}
                              placeholder="I promise to love you, to cherish you, and to stand by your side through all of life's adventures."
                              rows={4}
                            />
                          </div>
                          
                          {/* Footer */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Footer</h4>
                            
                            <Input
                              label="Footer Text"
                              value={formData.declaration.footerText}
                              onChange={(e) => handleTemplateTextChange('declaration', 'footerText', e.target.value)}
                              placeholder="Made with love"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Tab.Panel>
                  
                  {/* Media Panel */}
                  <Tab.Panel>
                    <div className="space-y-6">
                      {/* YouTube Link */}
                      <div>
                        <Input
                          id="youtubeLink"
                          name="youtubeLink"
                          label="YouTube Video Link (Optional)"
                          placeholder="E.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          value={formData.youtubeLink}
                          onChange={handleChange}
                          error={formErrors.youtubeLink}
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {formData.templateType === 'birthday' && "Add a special birthday song or video!"}
                          {formData.templateType === 'anniversary' && "Add your special song or a memorable video from your journey together."}
                          {formData.templateType === 'declaration' && "Add a romantic song that expresses your feelings."}
                        </p>
                      </div>
                      
                      {/* Image Upload */}
                      <div className="space-y-2">
                        <ImageUpload
                          onImageUpload={handleImageUpload}
                          onImageRemove={handleImageRemove}
                          maxImages={5}
                          uploadedImages={formData.images}
                          label="Upload Images (Max 5)"
                        />
                        {isLoading && <p className="text-sm text-gray-500">Uploading images...</p>}
                        
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Image Tips</h4>
                          <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
                            <li>Upload high-quality images for the best visual experience</li>
                            <li>The first image will be featured prominently in all templates</li>
                            <li>For {formData.templateType === 'birthday' ? 'birthday templates' : formData.templateType === 'anniversary' ? 'anniversary templates' : 'declaration templates'}, landscape orientation works best</li>
                            <li>Images will be automatically optimized for the best display</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
            
            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                fullWidth
                size="lg"
              >
                {editMode ? 'Save Changes' : 'Continue to Payment ($4.00)'}
              </Button>
              {editMode ? (
                <p className="mt-2 text-center text-sm text-gray-500">
                  Changes will be available immediately after saving
                </p>
              ) : (
                <p className="mt-2 text-center text-sm text-gray-500">
                  You will be redirected to our secure payment page
                </p>
              )}
            </div>
          </form>
        </div>
        
        {/* Preview Column */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTab(0)}
                >
                  Edit Basic Info
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTab(1)}
                >
                  Edit Text
                </Button>
              </div>
            </div>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-[600px] relative">
              <div className="absolute inset-0 overflow-y-auto">
                {renderTemplatePreview()}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 text-center">
              This is a preview of how your site will look
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteEditor;