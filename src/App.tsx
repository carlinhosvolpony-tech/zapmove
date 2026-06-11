import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Bike, 
  Package, 
  ChevronRight, 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Clock, 
  Send,
  Smartphone,
  User,
  School,
  GraduationCap,
  Users,
  Hash,
  Star,
  ShieldCheck,
  CheckCircle2,
  Download,
  MapPinned
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import backgroundImage from './assets/images/arari_background_1781147986935.png';

// Pricing configuration
const PRICES = {
  ride: {
    moto: {
      Centro: 5.00,
      Bairros: 7.00,
      'Trizidela/Perimirim': 10.00
    }
  },
  delivery: {
    Centro: 5.00,
    Bairros: 7.00,
    'Trizidela/Perimirim': 10.00
  },
  school_moto: 150.00
};

const WHATSAPP_NUMBER = '5598991475862'; 

type ServiceType = 'ride' | 'delivery' | 'school_moto' | null;
type VehicleType = 'moto' | null;
type RegionType = 'Centro' | 'Bairros' | 'Trizidela/Perimirim' | null;

interface LocationData {
  latitude: number;
  longitude: number;
}

// Utility components
const Card = ({ children, onClick, className }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white/80 backdrop-blur-xl border border-white/40 rounded-[32px] p-5 shadow-lg active:scale-[0.98] transition-all cursor-pointer ${className}`}
  >
    {children}
  </div>
);

const Input = ({ label, icon: Icon, ...props }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-green transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <input 
        {...props}
        className="w-full pl-12 pr-4 py-4 bg-white/60 border border-white/60 rounded-2xl focus:bg-white focus:border-brand-green focus:shadow-xl transition-all outline-none font-medium text-slate-900"
      />
    </div>
  </div>
);

const Button = ({ children, onClick, disabled, className, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`premium-gradient text-white py-5 px-8 rounded-full font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all ${className}`}
  >
    {children}
    {Icon && <Icon className="w-6 h-6" />}
  </button>
);

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

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
  const [phone, setPhone] = useState('');
  const [childName, setChildName] = useState('');
  const [childGrade, setChildGrade] = useState('');
  const [childRoom, setChildRoom] = useState('');
  const [childShift, setChildShift] = useState('');
  const [step, setStep] = useState(1);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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
        }
      );
    } else {
      setLoadingLocation(false);
    }
  };

  const getPrice = () => {
    if (service === 'school_moto') return PRICES.school_moto;
    if (!region) return null;
    if (service === 'delivery') return (PRICES.delivery as any)[region];
    if (service === 'ride' && vehicle) return (PRICES.ride as any)[vehicle][region];
    return null;
  };

  const handleSendRequest = () => {
    const locationLink = location 
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : 'Localização não informada';
    
    let serviceLabel = '';
    if (service === 'ride') {
      serviceLabel = 'TRANSPORTE (MOTO)';
    } else if (service === 'delivery') {
      serviceLabel = 'DELIVERY MOTO';
    } else if (service === 'school_moto') {
      serviceLabel = 'MOTO ESCOLAR (MENSAL)';
    }

    const price = getPrice();
    const priceText = price 
      ? `R$ ${price.toFixed(2).replace('.', ',')}${service === 'school_moto' ? '/mês' : ''}` 
      : 'A combinar';

    let message = '';
    
    if (service === 'school_moto') {
      message = `*CADASTRO MOTO ESCOLAR*%0A%0A` +
        `*DADOS DO RESPONSÁVEL*%0A` +
        `*Nome:* ${name}%0A` +
        `*Endereço:* ${origin}%0A` +
        `*Telefone:* ${phone}%0A%0A` +
        `*DADOS DA CRIANÇA*%0A` +
        `*Nome:* ${childName}%0A` +
        `*Escola:* ${destination}%0A` +
        `*Série:* ${childGrade}%0A` +
        `*Sala:* ${childRoom}%0A` +
        `*Turno:* ${childShift}%0A%0A` +
        `*Valor Mensal:* ${priceText}%0A` +
        `*Localização Ref:* ${locationLink}`;
    } else {
      message = `*NOVO CHAMADO - ${serviceLabel}*%0A%0A` +
        `*Nome:* ${name}%0A` +
        `*Região:* ${region}%0A` +
        `*Origem:* ${origin}%0A` +
        `*Destino/Pedido:* ${destination}%0A` +
        `*Valor Estimado:* ${priceText}%0A` +
        `*Detalhes:* ${details || 'Nenhum'}%0A%0A` +
        `*Minha Localização:* ${locationLink}`;
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const reset = () => {
    setService(null);
    setVehicle(null);
    setStep(1);
    setName('');
    setOrigin('');
    setPhone('');
    setChildName('');
    setChildGrade('');
    setChildRoom('');
    setChildShift('');
    setDestination('');
    setDetails('');
    setRegion(null);
  };

  const goBack = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 flex flex-col items-center relative">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-md bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
           <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 premium-gradient rounded-2xl shadow-brand rotate-3 group-hover:rotate-6 transition-transform duration-500" />
            <Zap className="text-white w-6 h-6 relative z-10 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-gradient leading-none">
              ZAPMOVE
            </h1>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Premium Mobility</span>
          </div>
        </div>
        
        {step > 1 && (
          <button onClick={goBack} className="p-3 rounded-2xl bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="w-full max-w-md flex-1 p-6 flex flex-col gap-8 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Para onde vamos hoje?</h2>
                <p className="text-slate-500 font-medium">Escolha o serviço ideal para sua necessidade.</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <Card onClick={() => { setService('ride'); setVehicle('moto'); setStep(3); }}>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-brand-green/10 rounded-3xl flex items-center justify-center">
                      <Bike className="w-10 h-10 text-brand-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-2xl text-slate-900">Transporte</h3>
                      <p className="text-sm text-slate-500">Moto Táxi rápido e seguro</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                </Card>

                <Card onClick={() => { setService('delivery'); setVehicle('moto'); setStep(3); }}>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-brand-blue/10 rounded-3xl flex items-center justify-center">
                      <Package className="w-10 h-10 text-brand-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-2xl text-slate-900">Delivery</h3>
                      <p className="text-sm text-slate-500">Entregamos com agilidade</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                </Card>

                <Card onClick={() => { setService('school_moto'); setVehicle('moto'); setStep(3); }}>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center">
                      <School className="w-10 h-10 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-2xl text-slate-900">Moto Escolar</h3>
                      <p className="text-sm text-slate-500">Transporte mensal aluno</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-3xl font-black text-slate-900">Detalhes do Pedido</h2>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <MapPin className="w-6 h-6 text-brand-blue" />
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase">Localização</h4>
                      <p className="font-bold">{location ? 'Ativado' : 'Aguardando GPS'}</p>
                    </div>
                  </div>
                  {!location && (
                    <button onClick={getGeolocation} className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold">Ativar</button>
                  )}
                </div>
              </Card>

              <div className="flex flex-col gap-4">
                {(service === 'ride' || service === 'delivery') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Região</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Centro', 'Bairros', 'Trizidela/Perimirim'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRegion(r)}
                          className={cn(
                            "py-4 rounded-xl text-[10px] font-black border-2",
                            region === r ? "bg-brand-green border-brand-green text-white" : "bg-white border-slate-100 text-slate-500"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Input label="Seu Nome" icon={User} value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Nome completo" />
                <Input label="Origem" icon={Navigation} value={origin} onChange={(e: any) => setOrigin(e.target.value)} placeholder="Endereço de partida" />
                <Input label="Destino" icon={MapPinned} value={destination} onChange={(e: any) => setDestination(e.target.value)} placeholder="Para onde?" />
                
                <textarea 
                  placeholder="Observações..." 
                  className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl resize-none outline-none focus:border-brand-green"
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Valor Total</span>
                  <span className="text-3xl font-black text-brand-dark">R$ {getPrice()?.toFixed(2) || '0,00'}</span>
                </div>

                <Button onClick={handleSendRequest} icon={Send} className="w-full">
                  Pedir no WhatsApp
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
