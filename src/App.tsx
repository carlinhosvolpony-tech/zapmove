/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Package, 
  MapPin, 
  Navigation, 
  Send, 
  ChevronRight, 
  MapPinned,
  Clock,
  Info,
  CheckCircle2,
  Bike,
  MessageSquare,
  ArrowUpRight,
  Download,
  ArrowLeft,
  Smartphone,
  Map as MapIcon,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---
type ServiceType = 'ride' | 'delivery' | null;
type VehicleType = 'car' | 'moto' | null;
type RegionType = 'Centro' | 'Bairros' | 'Trizidela/Perimirim' | null;

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

// --- Constants ---
const WHATSAPP_NUMBER = '5598984595785';

const PRICES = {
  ride: {
    moto: {
      'Centro': 5.00,
      'Bairros': 7.00,
      'Trizidela/Perimirim': 10.00
    },
    car: {
      'Centro': 15.00,
      'Bairros': 20.00,
      'Trizidela/Perimirim': 25.00
    }
  },
  delivery: {
    'Centro': 2.00,
    'Bairros': 3.00,
    'Trizidela/Perimirim': 5.00
  }
};

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className, 
  disabled,
  icon: Icon
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark';
  className?: string;
  disabled?: boolean;
  icon?: any;
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-brand hover:shadow-brand/50 hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-white/90 backdrop-blur-md text-slate-900 border border-white/50 hover:bg-white shadow-sm',
    ghost: 'bg-transparent text-slate-500 hover:text-brand-green hover:bg-brand-green/5',
    outline: 'bg-transparent border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white',
    dark: 'bg-brand-dark text-white hover:bg-brand-dark/90'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        variants[variant],
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

const Card = ({ children, className, onClick, active }: { children: React.ReactNode; className?: string; onClick?: () => void; active?: boolean }) => (
  <div 
    onClick={onClick}
    className={cn(
      'glass-card p-6 rounded-[32px] transition-all duration-500',
      onClick && 'cursor-pointer hover:border-brand-green/40 hover:shadow-premium active:scale-[0.98]',
      active && 'border-brand-green ring-2 ring-brand-green/20 bg-white/90',
      className
    )}
  >
    {children}
  </div>
);

const Input = ({ label, icon: Icon, ...props }: { label: string; icon?: any } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-green transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input 
        {...props}
        className={cn(
          'glass-input w-full px-5 py-4 rounded-2xl text-slate-900 placeholder:text-slate-400',
          Icon && 'pl-12',
          props.className
        )}
      />
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [service, setService] = useState<ServiceType>(null);
  const [vehicle, setVehicle] = useState<VehicleType>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [details, setDetails] = useState('');
  const [region, setRegion] = useState<RegionType>(null);
  const [step, setStep] = useState(1);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else if (isIOS()) {
      setShowInstallModal(true);
    }
  };

  const getGeolocation = () => {
    setLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
          // Fallback or silent error
        }
      );
    } else {
      setLoadingLocation(false);
    }
  };

  const getPrice = () => {
    if (!region) return null;
    if (service === 'delivery') return PRICES.delivery[region];
    if (service === 'ride' && vehicle) return PRICES.ride[vehicle][region];
    return null;
  };

  const handleSendRequest = () => {
    const locationLink = location 
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : 'Localização não informada';
    
    const serviceLabel = service === 'ride' 
      ? `TRANSPORTE (${vehicle === 'car' ? 'CARRO' : 'MOTO'})` 
      : 'DELIVERY';

    const price = getPrice();
    const priceText = price ? `R$ ${price.toFixed(2).replace('.', ',')}` : 'A combinar';

    const message = `*NOVO CHAMADO - ${serviceLabel}*%0A%0A` +
      `*Nome:* ${name}%0A` +
      `*Região:* ${region}%0A` +
      `*Origem:* ${origin}%0A` +
      `*Destino/Pedido:* ${destination}%0A` +
      `*Valor Estimado:* ${priceText}%0A` +
      `*Detalhes:* ${details || 'Nenhum'}%0A%0A` +
      `*Minha Localização:* ${locationLink}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const reset = () => {
    setService(null);
    setVehicle(null);
    setStep(1);
    setName('');
    setOrigin('');
    setDestination('');
    setDetails('');
    setRegion(null);
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) {
      if (service === 'ride') setStep(2);
      else setStep(1);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 flex flex-col items-center relative">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/zapmove-bg/1920/1080?blur=5" 
          alt="Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/60" />
      </div>

      {/* Header */}
      <header className="w-full max-w-md bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 premium-gradient rounded-2xl shadow-brand rotate-3 group-hover:rotate-6 transition-transform duration-500" />
            <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm" />
            <Zap className="text-white w-6 h-6 relative z-10 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-gradient leading-none">
              ZAPMOVE
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Premium Mobility</span>
              <div className="w-1 h-1 bg-brand-green rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button 
              onClick={goBack}
              className="p-3 rounded-2xl bg-slate-100/80 text-slate-500 hover:bg-brand-green/10 hover:text-brand-green transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {(deferredPrompt || isIOS()) && (
            <button 
              onClick={handleInstallClick}
              className="p-3 rounded-2xl premium-gradient text-white shadow-brand hover:scale-110 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-md flex-1 p-6 flex flex-col gap-8 relative z-10">
        {/* Progress Bar */}
        <div className="flex gap-2.5 px-1">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-700 relative overflow-hidden",
                step >= s ? "bg-brand-green/20" : "bg-slate-200/50"
              )} 
            >
              {step >= s && (
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  className="absolute inset-0 bg-brand-green shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-green font-bold text-xs uppercase tracking-widest">
                  <Star className="w-3 h-3 fill-brand-green" />
                  <span>Seja bem-vindo</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Para onde vamos <br/> <span className="text-gradient">hoje?</span>
                </h2>
                <p className="text-slate-500 font-medium text-sm">Escolha o serviço ideal para sua necessidade.</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <Card 
                  onClick={() => { setService('ride'); setStep(2); }}
                  className="flex items-center gap-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
                  <div className="w-20 h-20 bg-brand-green/10 rounded-3xl flex items-center justify-center group-hover:bg-brand-green group-hover:rotate-6 transition-all duration-500">
                    <Car className="w-10 h-10 text-brand-green group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className="font-black text-2xl text-slate-900">Transporte</h3>
                    <p className="text-sm text-slate-500 font-medium">Viagens rápidas e seguras</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:bg-brand-green/20 group-hover:translate-x-2 transition-all duration-300">
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-brand-green" />
                  </div>
                </Card>

                <Card 
                  onClick={() => { setService('delivery'); setStep(3); }}
                  className="flex items-center gap-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
                  <div className="w-20 h-20 bg-brand-blue/10 rounded-3xl flex items-center justify-center group-hover:bg-brand-blue group-hover:-rotate-6 transition-all duration-500">
                    <Package className="w-10 h-10 text-brand-blue group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className="font-black text-2xl text-slate-900">Delivery</h3>
                    <p className="text-sm text-slate-500 font-medium">Entregas em minutos</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:bg-brand-blue/20 group-hover:translate-x-2 transition-all duration-300">
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-brand-blue" />
                  </div>
                </Card>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-2">
                {[
                  { icon: ShieldCheck, text: 'Seguro', color: 'text-brand-green' },
                  { icon: Clock, text: 'Rápido', color: 'text-brand-blue' },
                  { icon: Star, text: 'Premium', color: 'text-amber-500' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white/40 rounded-3xl border border-white/50">
                    <item.icon className={cn("w-6 h-6", item.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Qual o <span className="text-gradient">veículo?</span></h2>
                <p className="text-slate-500 font-medium">Selecione como você deseja viajar.</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <Card 
                  onClick={() => { setVehicle('moto'); setStep(3); }}
                  className="flex items-center gap-6 group"
                >
                  <div className="w-20 h-20 bg-brand-green/10 rounded-3xl flex items-center justify-center group-hover:bg-brand-green transition-all duration-500">
                    <Bike className="w-10 h-10 text-brand-green group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-slate-900">Moto</h3>
                    <p className="text-sm text-slate-500 font-medium">Agilidade para o dia a dia</p>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-brand-green transition-colors" />
                </Card>

                <Card 
                  onClick={() => { setVehicle('car'); setStep(3); }}
                  className="flex items-center gap-6 group"
                >
                  <div className="w-20 h-20 bg-brand-blue/10 rounded-3xl flex items-center justify-center group-hover:bg-brand-blue transition-all duration-500">
                    <Car className="w-10 h-10 text-brand-blue group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-slate-900">Carro</h3>
                    <p className="text-sm text-slate-500 font-medium">Conforto e climatização</p>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-brand-blue transition-colors" />
                </Card>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                  {service === 'ride' ? 'Sua Viagem' : 'Seu Pedido'}
                </h2>
                <p className="text-slate-500 font-medium">Preencha os detalhes para solicitar.</p>
              </div>

              {/* Location Card */}
              <Card className="p-6 flex flex-col gap-5 border-none bg-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full -mr-12 -mt-12" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-brand-blue" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Localização</h4>
                      <p className="text-base font-bold text-slate-800">
                        {location ? 'GPS Conectado' : 'Aguardando GPS'}
                      </p>
                    </div>
                  </div>
                  {!location && (
                    <button 
                      onClick={getGeolocation}
                      disabled={loadingLocation}
                      className="text-[11px] font-black uppercase tracking-widest bg-brand-blue text-white px-5 py-3 rounded-2xl shadow-xl shadow-brand-blue/20 disabled:opacity-50 active:scale-95 transition-all"
                    >
                      {loadingLocation ? '...' : 'Ativar'}
                    </button>
                  )}
                </div>
                {location && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-[11px] font-mono text-brand-green bg-brand-green/5 p-3 rounded-xl border border-brand-green/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Coordenadas: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</span>
                  </motion.div>
                )}
              </Card>

              {/* Form */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Selecione a Região
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Centro', 'Bairros', 'Trizidela/Perimirim'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRegion(r)}
                        className={cn(
                          "py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-tight border-2 transition-all duration-300",
                          region === r 
                            ? "bg-brand-green border-brand-green text-white shadow-brand scale-[1.02]" 
                            : "bg-white/60 border-white/80 text-slate-500 hover:border-brand-green/30"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <Input 
                  label="Seu Nome" 
                  icon={Smartphone}
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Como podemos te chamar?" 
                />

                <Input 
                  label="Local de Origem" 
                  icon={Navigation}
                  value={origin} 
                  onChange={(e) => setOrigin(e.target.value)} 
                  placeholder="Onde você está agora?" 
                />

                <Input 
                  label={service === 'ride' ? 'Destino Final' : 'O que entregar?'} 
                  icon={MapPinned}
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)} 
                  placeholder={service === 'ride' ? 'Para onde você vai?' : 'Descreva o seu pedido'} 
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Observações Adicionais
                  </label>
                  <textarea 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Ponto de referência, cor da casa, etc..."
                    rows={3}
                    className="glass-input w-full px-5 py-4 rounded-2xl text-slate-900 placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>

              {/* Price & Action */}
              <div className="space-y-5 pt-4">
                {region && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-dark rounded-[32px] p-6 text-white flex items-center justify-between shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Clock className="w-7 h-7 text-brand-green" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Valor Estimado</h4>
                        <p className="text-xs font-bold text-brand-green">Pagamento na entrega</p>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <span className="text-3xl font-black text-white">
                        R$ {getPrice()?.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </motion.div>
                )}

                <Button 
                  onClick={handleSendRequest}
                  disabled={!name || !origin || !destination || !region}
                  className="w-full py-6 text-xl rounded-[24px]"
                  icon={Send}
                >
                  Chamar no WhatsApp
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md p-10 text-center relative z-10">
        <div className="flex items-center justify-center gap-8 text-slate-400 mb-6">
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-5 h-5 text-brand-green" />
            <span className="text-[8px] font-black uppercase tracking-widest">24 Horas</span>
          </div>
          <div className="w-px h-8 bg-slate-200/50" />
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-5 h-5 text-brand-blue" />
            <span className="text-[8px] font-black uppercase tracking-widest">Seguro</span>
          </div>
          <div className="w-px h-8 bg-slate-200/50" />
          <div className="flex flex-col items-center gap-1">
            <MapIcon className="w-5 h-5 text-brand-green" />
            <span className="text-[8px] font-black uppercase tracking-widest">Sua Região</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          © 2024 ZapMove Tecnologia
        </p>
      </footer>

      {/* iOS Install Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-brand-dark/90 backdrop-blur-md">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white rounded-[48px] p-10 flex flex-col gap-8 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Instalar ZapMove</h3>
                  <p className="text-sm text-slate-500 font-medium">Tenha o ZapMove sempre à mão no seu iPhone.</p>
                </div>
                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="p-4 bg-slate-100 rounded-3xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <div className="space-y-5">
                {[
                  { icon: ArrowUpRight, color: 'text-brand-blue', text: 'Toque no botão de Compartilhar na barra inferior.' },
                  { icon: Download, color: 'text-brand-green', text: 'Role para baixo e toque em "Adicionar à Tela de Início".' },
                  { icon: CheckCircle2, color: 'text-brand-green', text: 'Toque em "Adicionar" no canto superior direito.' }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                      <step.icon className={cn("w-7 h-7", step.color)} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-tight">
                      <span className="text-brand-green mr-1">{i + 1}.</span> {step.text}
                    </p>
                  </div>
                ))}
              </div>

              <Button onClick={() => setShowInstallModal(false)} className="w-full py-5 text-lg rounded-3xl">
                Entendi, vamos lá!
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
