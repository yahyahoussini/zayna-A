import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

// --- Section pour l'effet de particules ---
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
// --- Fin de la section ---

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Initialisation des particules ---
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // Action lors du chargement des particules
  }, []);
  // --- Fin de l'initialisation ---

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError || !authData.user) {
        toast({ title: 'Échec de la connexion', description: 'Email ou mot de passe invalide.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        toast({ title: 'Accès Refusé', description: "Vous n'avez pas la permission d'accéder à ce panneau.", variant: 'destructive' });
        setLoading(false);
        return;
      }

      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminUser', JSON.stringify({ email: authData.user.email, loginTime: new Date().toISOString() }));
      toast({ title: 'Connexion réussie', description: 'Bienvenue dans le panneau d\'administration!' });
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      toast({ title: 'Erreur de connexion', description: 'Une erreur est survenue lors de la connexion.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const particleOptions = {
    background: {
      color: { value: "#ffffff" }, // Fond blanc
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 150, links: { opacity: 1 } },
        push: { quantity: 2 },
      },
    },
    particles: {
      color: { value: "#374151" }, // Particules gris foncé
      links: {
        color: "#6B7280", // Liens gris
        distance: 150,
        enable: true,
        opacity: 0.4,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: true,
        speed: 1,
        straight: false,
      },
      number: {
        density: { enable: true, area: 800 },
        value: 80,
      },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2 } },
    },
    detectRetina: true,
  };

  return (
    <div className="min-h-screen w-full relative">
      <Helmet><title>Admin Login | Zayna</title></Helmet>

      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particleOptions}
        className="absolute top-0 left-0 w-full h-full z-0"
      />

      <div className="relative z-10 min-h-screen w-full lg:grid lg:grid-cols-2">
        {/* --- Panneau de gauche (Marque) --- */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Link to="/" className="inline-block mb-6">
                    <img src="/logo.svg" alt="Zayna Logo" className="h-20" />
                </Link>
                <h1 className="text-4xl font-bold text-gray-800">
                    Bienvenue, Administrateur
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-sm mx-auto">
                    Gérez vos produits, suivez vos commandes et analysez les performances de votre boutique.
                </p>
            </motion.div>
        </div>

        {/* --- Panneau de droite (Formulaire) --- */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                <Card className="bg-white shadow-xl shadow-gray-400/10">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Accès Administrateur</CardTitle>
                        <CardDescription>
                            Veuillez vous connecter pour continuer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Adresse e-mail</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input id="email" type="email" placeholder="admin@zayna.ma"
                                    value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="pl-10 bg-gray-50" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                    value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="pl-10 pr-10 bg-gray-50" required />
                                <Button type="button" variant="ghost" size="sm"
                                    className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <Link to="/" className="font-semibold text-primary hover:underline">
                            Retourner à la boutique
                        </Link>
                    </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} Zayna. Tous droits réservés.
                </p>
                </motion.div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default AdminLogin;