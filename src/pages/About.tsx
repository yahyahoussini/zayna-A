import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Leaf, Users, Heart, Award, ArrowRight, FlaskConical, Gem, Microscope, Sparkles, BookOpen, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

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

// --- Parallax Image Component ---
const ParallaxImage = ({ src, alt }: { src: string, alt: string }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    return (
        <div ref={ref} className="w-full h-80 md:h-96 overflow-hidden rounded-2xl shadow-lg">
             <motion.img
                src={src}
                alt={alt}
                className="w-full h-[130%] object-cover"
                style={{ y }}
             />
        </div>
    )
}

// --- ENHANCED: 3D Value Card Component ---
const ValueCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.03 }}
            className="flex items-start space-x-4 p-6 bg-white/50 backdrop-blur-lg rounded-xl border border-white/30 shadow-md h-full transition-shadow duration-300 hover:shadow-2xl"
        >
            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mt-1">
                <div className="h-6 w-6 text-primary">{icon}</div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-1 text-gray-800">{title}</h3>
                <p className="text-gray-600">{text}</p>
            </div>
        </motion.div>
    );
};

// --- Timeline Component ---
const TimelineItem = ({ icon, year, title, text, isLast = false }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["center end", "start start"]
    });
    const scale = useTransform(scrollYProgress, [0, 0.7], [0.5, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.7], [0.3, 1]);

    return (
        <div ref={ref} className="flex items-start gap-6">
            <div className="flex flex-col items-center">
                <motion.div 
                    style={{ scale, opacity }}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white z-10 border-4 border-gray-50"
                >
                    {icon}
                </motion.div>
                {!isLast && <div className="w-0.5 h-48 bg-gray-200 mt-2"></div>}
            </div>
            <motion.div style={{ opacity }} className="pt-4">
                <p className="text-sm font-semibold text-primary mb-1">{year}</p>
                <h4 className="text-xl font-bold mb-2 text-gray-800">{title}</h4>
                <p className="text-gray-600">{text}</p>
            </motion.div>
        </div>
    );
};

const About = () => {
  // --- FIX: Use useMotionValue for mouse tracking ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Update motion values instead of state
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // --- Use motion values with useTransform ---
  const rotateX = useTransform(mouseY, [0, window.innerHeight], [10, -10]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-10, 10]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 20 });
    
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Zayna",
    "url": "https://www.zayna.ma",
    "logo": "https://www.zayna.ma/logo.png",
    "description": "Cosmétiques bio et naturels inspirés des rituels de beauté marocains.",
    "address": { "@type": "PostalAddress", "streetAddress": "123 Rue de l'Arganier", "addressLocality": "Casablanca", "postalCode": "20000", "addressCountry": "MA" },
    "contactPoint": { "@type": "ContactPoint", "telephone": "+212-522-000000", "contactType": "customer service" }
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      <Helmet>
        <title>Notre Histoire | Zayna - Cosmétiques Bio Marocains</title>
        <meta name="description" content="Découvrez l'histoire de Zayna, une marque née de la passion pour la nature marocaine et le savoir-faire ancestral. Notre mission est de vous offrir des soins bio, authentiques et efficaces." />
        <meta property="og:title" content="Notre Histoire | Zayna - Cosmétiques Bio Marocains" />
        <meta property="og:description" content="Découvrez comment Zayna allie tradition et science pour créer des soins de beauté uniques." />
        <meta property="og:image" content="https://placehold.co/1200x630/7a956b/f5f5f0?text=Zayna" />
        <meta property="og:url" content="https://www.zayna.ma/about" />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      </Helmet>
      
      <Header />

      <main>
        {/* --- Hero Section with 3D text --- */}
        <section className="relative h-[60vh] overflow-hidden flex items-center justify-center text-white [perspective:800px]">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/7262995/pexels-photo-7262995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }} />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative text-center z-10 p-4">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold"
              style={{ rotateX: springRotateX, rotateY: springRotateY }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              L'Âme de la Nature Marocaine
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl mt-4 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              Plus qu'une marque, une promesse de beauté authentique et consciente.
            </motion.p>
          </div>
        </section>

        {/* --- Story & Timeline Section --- */}
        <motion.section 
          className="py-16 md:py-24 bg-white"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="lg:sticky top-24">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Notre Histoire</h2>
                <p className="text-primary font-semibold mb-4">De l'inspiration à la création</p>
                <p className="text-gray-600 mb-4">
                  Zayna est née d'une frustration : le marché était saturé de produits de beauté complexes, remplis d'ingrédients synthétiques. Nous rêvions d'un retour à l'essentiel, à la pureté des rituels de beauté marocains qui ont fait leurs preuves depuis des générations.
                </p>
                <p className="text-gray-600">
                  Inspirés par la richesse de la nature marocaine et le savoir-faire de ses femmes, nous avons décidé de créer une marque qui célèbre cette authenticité. Une marque qui offre des soins simples, naturels et profondément efficaces.
                </p>
              </div>
              <div className="space-y-4">
                <TimelineItem icon={<BookOpen size={24}/>} year="2021" title="L'Idée Germe" text="Frustrés par le manque de produits naturels authentiques, nous commençons nos recherches sur les rituels de beauté marocains." />
                <TimelineItem icon={<Users size={24}/>} year="2022" title="Partenariats Éthiques" text="Nous tissons des liens avec des coopératives féminines dans le sud du Maroc, assurant un sourcing équitable." />
                <TimelineItem icon={<FlaskConical size={24}/>} year="2023" title="Premières Formules" text="Après des mois de R&D, nos premières formules alliant tradition et science voient le jour dans notre laboratoire." />
                <TimelineItem icon={<Flag size={24}/>} year="2024" title="Lancement Officiel" text="Zayna est lancée, offrant une gamme de soins bio authentiques au public marocain." isLast={true} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- Meet the Founder Section with 3D hover --- */}
        <motion.section
          className="py-16 md:py-24 bg-gray-50 [perspective:1000px]"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <div className="group relative flex flex-col lg:flex-row items-center gap-12 bg-white p-8 md:p-12 rounded-2xl shadow-lg transition-all duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(5deg)]">
              <motion.img 
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Fondatrice de Zayna"
                className="w-48 h-48 rounded-full object-cover shadow-xl border-4 border-white transition-transform duration-500 [transform:translateZ(40px)] group-hover:scale-110"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.5 }}
              />
              <div className="text-center lg:text-left transition-transform duration-500 [transform:translateZ(20px)]">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Un mot de la fondatrice</h3>
                <p className="text-primary font-semibold mb-4">Amina Alami</p>
                <blockquote className="text-lg text-gray-600 italic border-l-4 border-primary pl-6">
                  "Zayna est le reflet de mes racines et de ma conviction profonde que la nature nous offre tout ce dont nous avons besoin. Chaque produit est une invitation à prendre soin de soi de manière authentique, à célébrer sa beauté naturelle, et à honorer le patrimoine exceptionnel du Maroc."
                </blockquote>
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- Values Section --- */}
        <motion.section 
          className="py-16 md:py-24 bg-white"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Nos Valeurs Fondamentales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Leaf />, title: "Authenticité", text: "Nous utilisons des ingrédients purs et des formules inspirées de traditions ancestrales." },
                { icon: <Award />, title: "Qualité", text: "Aucun compromis sur la qualité, de la sélection des ingrédients à la fabrication." },
                { icon: <Heart />, title: "Respect", text: "Respect de votre peau, de l'environnement et de nos partenaires artisans." },
                { icon: <Users />, title: "Éthique", text: "Nous soutenons les coopératives féminines via un commerce juste et équitable." },
                { icon: <Microscope />, title: "Transparence", text: "Nous sommes ouverts sur nos ingrédients, nos processus et nos partenaires." },
                { icon: <Sparkles />, title: "Efficacité", text: "Nous allions nature et science pour créer des soins qui donnent de vrais résultats." },
              ].map((value, i) => (
                <ValueCard key={i} {...value} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* --- What Makes You Different Section --- */}
        <motion.section 
          className="py-16 md:py-24 bg-gray-50"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center">
                <ParallaxImage src="https://images.pexels.com/photos/3762451/pexels-photo-3762451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Combinaison de nature et science" />
              </div>
              <div className="row-start-1 md:row-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Ce Qui Nous Rend Uniques</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Zayna est le pont entre deux mondes : la sagesse des rituels de beauté ancestraux et la précision de la science moderne.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start"><Gem className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" /><span><b>Ingrédients Rares :</b> Nous allons chercher des trésors botaniques uniques au cœur du Maroc.</span></li>
                  <li className="flex items-start"><FlaskConical className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" /><span><b>Formules Hybrides :</b> Chaque produit est un équilibre parfait entre tradition et innovation pour une efficacité maximale.</span></li>
                  <li className="flex items-start"><Users className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" /><span><b>Impact Direct :</b> Votre achat soutient directement les femmes artisanes de nos coopératives partenaires.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- CTA Section --- */}
        <motion.section 
          className="bg-primary text-white py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Rejoignez l'Aventure Zayna</h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Explorez une collection qui célèbre votre beauté naturelle et authentique.
            </p>
            <Link to="/products">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Découvrir nos produits <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
