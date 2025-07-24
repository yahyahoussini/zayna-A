import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleWhatsAppClick = () => {
    const phoneNumber = '+212600000000'; // **IMPORTANT: Remplacez par votre numéro WhatsApp Marocain**
    const message = 'Bonjour Zayna! J\'ai une question concernant vos produits bio.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
               <Leaf className="h-7 w-7 text-emerald-500" />
              <span className="text-2xl font-bold">Zayna</span>
            </div>
            <p className="text-gray-400 mb-4">
              La beauté naturelle, purement marocaine. Des soins cosmétiques bio, authentiques et efficaces.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">Produits</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">À Propos</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Client</h3>
            <ul className="space-y-2">
              <li><Link to="/track-order" className="text-gray-400 hover:text-white transition-colors">Suivre ma Commande</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Conditions Générales</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Politique de Confidentialité</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contactez-nous</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                <span className="text-gray-400">
                  123 Rue de l'Arganier, Casablanca, Maroc
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">+212 6 00 00 00 00</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">contact@zayna.ma</span>
              </div>
              <Button
                onClick={handleWhatsAppClick}
                className="bg-green-600 hover:bg-green-700 text-white mt-4 w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Discuter sur WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Zayna. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
