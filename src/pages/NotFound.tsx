import { useLocation, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Home, Compass, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// --- Section pour l'effet de particules ---
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
// --- Fin de la section pour l'effet de particules ---

// Définir un type pour la catégorie
interface Category {
  id: string;
  name: string;
  slug: string;
}

const NotFound = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Initialisation des particules ---
  const particlesInit = useCallback(async (engine: Engine) => {
    // Vous pouvez initialiser ici tout ce dont vous avez besoin, en chargeant des formes ou des plugins
    // Cette démo charge le bundle 'slim', vous pouvez donc utiliser toutes les fonctionnalités incluses
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // Vous pouvez faire quelque chose ici lorsque les particules sont chargées
  }, []);
  // --- Fin de l'initialisation des particules ---

  useEffect(() => {
    console.error(
      "404 Erreur: L'utilisateur a tenté d'accéder à une route inexistante:",
      location.pathname
    );

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .limit(4);
        if (error) throw error;
        if (data) setCategories(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des catégories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [location.pathname]);

  const particleOptions = {
    background: {
      color: {
        value: "#0D0C0F", // Fond sombre et profond
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
        onClick: {
          enable: true,
          mode: "push",
        },
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 1,
          },
        },
        push: {
          quantity: 2,
        },
      },
    },
    particles: {
      color: {
        value: "#C0A080", // Couleur dorée subtile pour les particules
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 0.5,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet><title>404 - Perdu dans l'espace | Zayna</title></Helmet>
      
      {/* --- Conteneur des particules --- */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particleOptions}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      
      {/* --- Le contenu est placé au-dessus avec un z-index plus élevé --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <motion.div 
            className="container mx-auto px-4 py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-lg mx-auto">
              <Compass className="h-24 w-24 text-primary/70 mx-auto mb-6" />
              <h1 className="text-5xl font-bold text-gray-100 mb-4">404</h1>
              <h2 className="text-3xl font-semibold text-gray-200 mb-4">
                Oups! Vous semblez perdu.
              </h2>
              <p className="text-lg text-gray-400 mb-10">
                Cette page est une constellation lointaine. Laissez-nous vous guider vers des chemins plus familiers.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Retourner à la galaxie d'accueil
                  </Link>
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => window.history.back()} 
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Revenir sur vos pas
                </Button>
              </div>

              {!loading && categories.length > 0 && (
                <>
                  <Separator className="my-12 bg-gray-700" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Explorez ces nébuleuses :</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                      {categories.map((cat) => (
                        <Button asChild variant="ghost" className="text-gray-300 hover:bg-gray-800 hover:text-white" key={cat.id}>
                          <Link to={`/products?category=${cat.slug}`}>{cat.name}</Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {loading && (
                  <div className="mt-12 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
              )}
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default NotFound;