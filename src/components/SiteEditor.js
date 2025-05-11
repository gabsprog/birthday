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

const SiteEditor = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    templateType: 'birthday',
    title: '',
    message: '',
    specialDate: '',
    youtubeLink: '',
    customerEmail: '',
    images: [],
  });
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for this field when it changes
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateType) => {
    setFormData((prev) => ({ ...prev, templateType }));
  };
  
  // Handle image upload
  const handleImageUpload = async (files) => {
    setIsLoading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data.url;
      });
      
      const uploadedImageUrls = await Promise.all(uploadPromises);
      
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImageUrls],
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
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
    
    if (!formData.customerEmail) {
      errors.customerEmail = 'Email is required';
    } else if (!isValidEmail(formData.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
    }
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the site
      const response = await axios.post('/api/create-site', formData);
      
      // Redirect to payment
      if (response.data.success && response.data.clientSecret) {
        router.push(`/payment?client_secret=${response.data.clientSecret}&site_id=${response.data.siteId}`);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Failed to create your site. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render template preview based on the selected template
  const renderTemplatePreview = () => {
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
        return <BirthdayTemplate {...previewProps} />;
      case 'anniversary':
        return <AnniversaryTemplate {...previewProps} />;
      case 'declaration':
        return <DeclarationTemplate {...previewProps} />;
      default:
        return <BirthdayTemplate {...previewProps} />;
    }
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
            
            {/* Special Date (conditional based on template) */}
            {(formData.templateType === 'anniversary' || formData.templateType === 'declaration') && (
              <Input
                id="specialDate"
                name="specialDate"
                type="date"
                label={formData.templateType === 'anniversary' ? 'Anniversary Date' : 'Special Date (Optional)'}
                value={formData.specialDate}
                onChange={handleChange}
                error={formErrors.specialDate}
                required={formData.templateType === 'anniversary'}
              />
            )}
            
            {/* Message */}
            <Textarea
              id="message"
              name="message"
              label="Your Message"
              placeholder="Write your special message here..."
              value={formData.message}
              onChange={handleChange}
              error={formErrors.message}
              required
              rows={6}
            />
            
            {/* YouTube Link */}
            <Input
              id="youtubeLink"
              name="youtubeLink"
              label="YouTube Video Link (Optional)"
              placeholder="E.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={formData.youtubeLink}
              onChange={handleChange}
              error={formErrors.youtubeLink}
            />
            
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
            </div>
            
            {/* Email */}
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
            
            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                fullWidth
                size="lg"
              >
                Continue to Payment ($4.00)
              </Button>
              <p className="mt-2 text-center text-sm text-gray-500">
                You'll be redirected to our secure payment page
              </p>
            </div>
          </form>
        </div>
        
        {/* Preview Column */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
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