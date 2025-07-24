import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, Mail, MapPin, Send, Clock, Loader2 } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { toast } from '../hooks/use-toast';

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// --- Form Validation Schema ---
const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  subject: z.string().min(5, { message: "Le sujet doit contenir au moins 5 caractères." }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères." }),
});

// --- Reusable Contact Info Card ---
const InfoCard = ({ icon, title, children }) => (
    <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.03 }}
        className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 h-full"
    >
        <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mt-1">
            <div className="h-6 w-6 text-primary">{icon}</div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div className="text-gray-600">{children}</div>
        </div>
    </motion.div>
);

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate a short delay for user feedback
    await new Promise(resolve => setTimeout(resolve, 1000));

    const yourWhatsAppNumber = "212600000000";
    const formattedMessage = `*Nouveau Message de Zayna.ma*\n\n*Nom:* ${values.name}\n*Email:* ${values.email}\n*Sujet:* ${values.subject}\n\n*Message:*\n${values.message}`;
    const whatsappUrl = `https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(formattedMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Prêt à envoyer !",
      description: "Votre message a été préparé pour WhatsApp.",
    });
    
    form.reset();
    setIsSubmitting(false);
  }
  
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "url": "https://www.zayna.ma/contact",
    "name": "Contactez Zayna",
    "description": "Contactez l'équipe de Zayna pour toute question sur nos produits bio marocains, commandes ou partenariats.",
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      <Helmet>
        <title>Contactez-Nous | Zayna - Service Client</title>
        <meta name="description" content="Contactez l'équipe de Zayna pour toute question sur nos produits, commandes ou partenariats. Nous sommes là pour vous aider." />
        <meta property="og:title" content="Contactez-Nous | Zayna" />
        <meta property="og:description" content="Une question ? Une suggestion ? N'hésitez pas à nous écrire. Notre équipe est à votre écoute." />
        <meta property="og:url" content="https://www.zayna.ma/contact" />
        <script type="application/ld+json">{JSON.stringify(contactSchema)}</script>
      </Helmet>
      
      <Header />

      <main>
        <motion.section 
          className="py-16 md:py-20 text-center bg-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-Nous</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Une question ? Une suggestion ? N'hésitez pas à nous écrire. Notre équipe est à votre écoute.</p>
          </div>
        </motion.section>

        {/* --- NEW: Contact Info Cards Section --- */}
        <motion.section
            className="py-16 md:py-20"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InfoCard icon={<Mail />} title="Email">
                        <a href="mailto:contact@zayna.ma" className="hover:text-primary transition-colors">contact@zayna.ma</a>
                    </InfoCard>
                    <InfoCard icon={<Phone />} title="Téléphone / WhatsApp">
                        <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">+212 6 00 00 00 00</a>
                    </InfoCard>
                    <InfoCard icon={<Clock />} title="Horaires">
                        <p>Lundi - Vendredi : 9h - 18h</p>
                        <p className="text-sm text-gray-500">Samedi : 10h - 14h</p>
                    </InfoCard>
                </div>
            </div>
        </motion.section>

        {/* --- Form & Map Section --- */}
        <section className="py-16 md:py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-gray-50 p-8 rounded-xl shadow-lg"
                    >
                        <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                              <FormItem><FormLabel>Nom complet</FormLabel><FormControl><Input placeholder="Votre nom" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Votre email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="subject" render={({ field }) => (
                              <FormItem><FormLabel>Sujet</FormLabel><FormControl><Input placeholder="Sujet de votre message" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="message" render={({ field }) => (
                              <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Écrivez votre message ici..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="mr-2 h-4 w-4" />
                              )}
                              {isSubmitting ? 'Envoi en cours...' : 'Envoyer via WhatsApp'}
                            </Button>
                          </form>
                        </Form>
                    </motion.div>

                    <motion.div 
                      className="space-y-8"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Retrouvez-nous</h2>
                            <div className="flex items-start space-x-4 mb-4">
                                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                <p className="text-gray-600">123 Rue de l'Arganier, Casablanca, Maroc</p>
                            </div>
                            <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212726.5743491918!2d-7.779343994433589!3d33.57239034920679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0x400c4209da49380!2sCasablanca!5e0!3m2!1sen!2sma!4v1672531234567!5m2!1sen!2sma"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen={false}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Location of Zayna"
                                ></iframe>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* --- FAQ Section --- */}
        <motion.section 
            className="py-16 md:py-20"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Quels sont les délais de livraison ?</AccordionTrigger>
                    <AccordionContent>La livraison prend généralement entre 24 et 72 heures, selon votre ville au Maroc.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Puis-je retourner un produit ?</AccordionTrigger>
                    <AccordionContent>Oui, vous disposez de 7 jours pour nous retourner un produit s'il ne vous convient pas, à condition qu'il n'ait pas été ouvert.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Proposez-vous des consultations personnalisées ?</AccordionTrigger>
                    <AccordionContent>Absolument ! Contactez-nous via WhatsApp pour des conseils personnalisés sur votre routine de soins.</AccordionContent>
                  </AccordionItem>
                </Accordion>
            </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
