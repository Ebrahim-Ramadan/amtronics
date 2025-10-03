'use client';

import { useState } from 'react';
import { useCart } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, Code, Cpu, Loader2, CircleCheck, HelpCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function HWSD() {
  const { state } = useCart();
  const isArabic = state.language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 'hardware',
    price: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceType: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isArabic ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/hwsd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setFormSuccess(true);
      setSubmittedData({
        ...formData,
        id: data.id,
        createdAt: new Date().toISOString()
      });
      
      toast.success(isArabic ? 'تم تقديم طلبك بنجاح' : 'Your request has been submitted successfully');

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(isArabic ? 'حدث خطأ أثناء تقديم طلبك' : 'An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'hardware':
        return isArabic ? 'هاردوير' : 'Hardware';
      case 'software':
        return isArabic ? 'سوفتوير' : 'Software';
      case 'both':
        return isArabic ? 'كلاهما' : 'Both';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isArabic ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mb-6 flex items-center">
        <Link href="/" className="flex items-center text-sm text-neutral-600 hover:text-[#00B8DB]">
          <ChevronLeft className="mr-1 h-5 w-5" />
          {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="border shadow-md">
          <CardHeader className="text-center rounded-t-lg">
            <CardTitle className="text-2xl md:text-3xl font-bold text-[#091638]">
              {isArabic ? 'خدمات تطوير النماذج الأولية' : 'Prototyping Services'}
            </CardTitle>
            <CardDescription className="text-neutral-600">
              {isArabic 
                ? 'قدم طلبك للحصول على خدمات تطوير النماذج الأولية' 
                : 'Submit your request for prototyping services'}
            </CardDescription>
          </CardHeader>

          {formSuccess ? (
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <CircleCheck className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-green-700 mb-2">
                  {isArabic ? 'تم تقديم طلبك بنجاح!' : 'Request Submitted Successfully!'}
                </h3>
              </div>

              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-lg">
                      {isArabic ? 'تفاصيل الطلب' : 'Request Details'}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(submittedData.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-dashed">
                    <span className="text-sm font-medium text-gray-600">
                      {isArabic ? 'رقم الطلب' : 'Request ID'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {submittedData.id}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(submittedData.id)}
                        className="text-gray-500 hover:text-gray-700"
                        title={isArabic ? 'نسخ' : 'Copy'}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-1">
                        {isArabic ? 'عنوان المشروع' : 'Project Title'}
                      </span>
                      <span className="block">{submittedData.title}</span>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-1">
                        {isArabic ? 'نوع الخدمة' : 'Service Type'}
                      </span>
                      <div className="flex items-center">
                        {submittedData.serviceType === 'hardware' && (
                          <Cpu className="h-4 w-4 mr-2 text-purple-600" />
                        )}
                        {submittedData.serviceType === 'software' && (
                          <Code className="h-4 w-4 mr-2 text-blue-600" />
                        )}
                        {submittedData.serviceType === 'both' && (
                          <div className="flex">
                            <Cpu className="h-4 w-4 mr-1 text-purple-600" />
                            <Code className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <span className="ml-1">{getServiceTypeName(submittedData.serviceType)}</span>
                      </div>
                    </div>

                    {submittedData.price > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">
                          {isArabic ? 'السعر التقريبي' : 'Estimated Price'}
                        </span>
                        <span className="block font-medium text-green-700">
                          {parseFloat(submittedData.price).toFixed(2)} {isArabic ? 'د.ك' : 'KWD'}
                        </span>
                      </div>
                    )}
                  </div>

                  
                </div>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">
                      {isArabic ? 'عنوان المشروع' : 'Project Title'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder={isArabic ? 'عنوان مختصر لمشروعك' : 'A brief title for your project'}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {isArabic ? 'نوع الخدمة' : 'Service Type'} <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup 
                      value={formData.serviceType} 
                      onValueChange={handleRadioChange}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hardware" id="hardware" />
                        <Label htmlFor="hardware" className="flex items-center cursor-pointer">
                          <Cpu className="h-4 w-4 mr-2" />
                          {isArabic ? 'هاردوير' : 'Hardware'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="software" id="software" />
                        <Label htmlFor="software" className="flex items-center cursor-pointer">
                          <Code className="h-4 w-4 mr-2" />
                          {isArabic ? 'سوفتوير' : 'Software'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both" className="cursor-pointer">
                          {isArabic ? 'كلاهما' : 'Both'}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">
                      {isArabic ? 'السعر التقريبي (د.ك)' : 'Estimated Price (KWD)'} 
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      value={formData.price || ''}
                      onChange={handleChange}
                      placeholder={isArabic ? 'السعر التقريبي بالدينار الكويتي' : 'Estimated price in KWD'}
                    />
                   
                  </div>

                 
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-[#00B8DB] hover:bg-[#009cba]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isArabic ? 'جاري الإرسال...' : 'Submitting...'}
                    </>
                  ) : (
                    isArabic ? 'تقديم الطلب' : 'Submit Request'
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}