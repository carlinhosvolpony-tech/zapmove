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
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type ServiceType = 'ride' | 'delivery' | null;
type VehicleType = 'car' | 'moto' | null;

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function App() {
  const [service, setService] = useState<ServiceType>(null);
  const [vehicle, setVehicle] = useState<VehicleType>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [details, setDetails] = useState('');
  const [step, setStep] = useState(1);

  const WHATSAPP_NUMBER = '5598984595785';

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
          alert("Não foi possível obter sua localização. Por favor, verifique as permissões.");
        }
      );
    } else {
      alert("Geolocalização não é suportada pelo seu navegador.");
      setLoadingLocation(false);
    }
  };

  const handleSendRequest = () => {
    const locationLink = location 
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : 'Localização não informada';
    
    const serviceLabel = service === 'ride' 
      ? `TRANSPORTE (${vehicle === 'car' ? 'CARRO' : 'MOTO'})` 
      : 'DELIVERY';

    const message = `*NOVO CHAMADO - ${serviceLabel}*%0A%0A` +
      `*Nome:* ${name}%0A` +
      `*Origem:* ${origin}%0A` +
      `*Destino/Pedido:* ${destination}%0A` +
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
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 flex flex-col items-center relative overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/city-aerial-view/1920/1080" 
          alt="Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-md bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2" onClick={reset} style={{ cursor: 'pointer' }}>
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green to-brand-blue rounded-full shadow-md" />
            <MessageSquare className="text-white w-5 h-5 relative z-10" />
            <ArrowUpRight className="text-white w-3 h-3 absolute top-2 right-2 z-10" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
            ZAPMOVE
          </h1>
        </div>
        {service && (
          <button 
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-brand-green transition-colors px-2 py-1"
          >
            Voltar
          </button>
        )}
      </header>

      <main className="w-full max-w-md flex-1 p-6 flex flex-col gap-6 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-slate-900 drop-shadow-sm">Para onde vamos hoje?</h2>
                <p className="text-slate-600 font-medium">Escolha o serviço desejado para começar.</p>
              </div>

              <button 
                onClick={() => { setService('ride'); setStep(2); }}
                className="group relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-6 flex items-center gap-6 hover:border-brand-green/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-brand-green group-hover:to-brand-blue transition-all duration-300 shadow-inner">
                  <Car className="w-8 h-8 text-brand-green group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-slate-900">Transporte</h3>
                  <p className="text-sm text-slate-600">Viagens rápidas e seguras</p>
                </div>
                <ChevronRight className="text-slate-400 group-hover:text-brand-green transition-colors" />
              </button>

              <button 
                onClick={() => { setService('delivery'); setStep(3); }}
                className="group relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-6 flex items-center gap-6 hover:border-brand-green/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-brand-green group-hover:to-brand-blue transition-all duration-300 shadow-inner">
                  <Package className="w-8 h-8 text-brand-green group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-slate-900">Delivery</h3>
                  <p className="text-sm text-slate-600">Entregas e encomendas</p>
                </div>
                <ChevronRight className="text-slate-400 group-hover:text-brand-green transition-colors" />
              </button>

              <div className="mt-8 p-4 bg-brand-green/10 backdrop-blur-md rounded-2xl flex gap-3 items-start border border-brand-green/20">
                <Info className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  Seu pedido será enviado diretamente para nossa central via WhatsApp. 
                  Certifique-se de ter o aplicativo instalado.
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-slate-900 drop-shadow-sm">Escolha o veículo</h2>
                <p className="text-slate-600 font-medium">Qual a melhor opção para você agora?</p>
              </div>

              <button 
                onClick={() => { setVehicle('car'); setStep(3); }}
                className="group relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-6 flex items-center gap-6 hover:border-brand-green/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-brand-green group-hover:to-brand-blue transition-all duration-300 shadow-inner">
                  <Car className="w-8 h-8 text-brand-green group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-slate-900">Carro</h3>
                  <p className="text-sm text-slate-600">Mais conforto e espaço</p>
                </div>
                <ChevronRight className="text-slate-400 group-hover:text-brand-green transition-colors" />
              </button>

              <button 
                onClick={() => { setVehicle('moto'); setStep(3); }}
                className="group relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-6 flex items-center gap-6 hover:border-brand-green/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-brand-green group-hover:to-brand-blue transition-all duration-300 shadow-inner">
                  <Bike className="w-8 h-8 text-brand-green group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-slate-900">Moto</h3>
                  <p className="text-sm text-slate-600">Mais agilidade e economia</p>
                </div>
                <ChevronRight className="text-slate-400 group-hover:text-brand-green transition-colors" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-900 drop-shadow-sm">
                  {service === 'ride' ? 'Detalhes da Viagem' : 'Detalhes da Entrega'}
                </h2>
                <p className="text-slate-600 font-medium">Preencha as informações abaixo.</p>
              </div>

              {/* Location Section */}
              <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-blue" />
                    <span className="font-bold text-slate-800">Sua Localização</span>
                  </div>
                  {!location && (
                    <button 
                      onClick={getGeolocation}
                      disabled={loadingLocation}
                      className="text-xs font-bold text-brand-blue hover:text-brand-green disabled:opacity-50 bg-brand-blue/10 px-3 py-1.5 rounded-lg transition-colors border border-brand-blue/20"
                    >
                      {loadingLocation ? 'Buscando...' : 'Obter GPS'}
                    </button>
                  )}
                </div>
                
                {location ? (
                  <div className="flex items-center gap-3 bg-brand-green/10 text-brand-green p-4 rounded-xl border border-brand-green/20 shadow-inner">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold">Localização capturada!</p>
                      <p className="opacity-80 font-mono">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic bg-white/40 p-3 rounded-xl border border-dashed border-slate-300">
                    Clique em "Obter GPS" para enviar sua posição exata.
                  </div>
                )}
              </div>

              {/* Form Section */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Seu Nome
                  </label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full bg-white/60 backdrop-blur-md border border-white/80 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Local de Origem
                  </label>
                  <input 
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Ex: Minha Casa / Rua A, 10"
                    className="w-full bg-white/60 backdrop-blur-md border border-white/80 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                    {service === 'ride' ? 'Destino' : 'O que entregar?'}
                  </label>
                  <input 
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={service === 'ride' ? 'Ex: Rua das Flores, 123' : 'Ex: 2 Pizzas e 1 Coca'}
                    className="w-full bg-white/60 backdrop-blur-md border border-white/80 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Observações (Opcional)
                  </label>
                  <textarea 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Ex: Perto da padaria, portão azul..."
                    rows={3}
                    className="w-full bg-white/60 backdrop-blur-md border border-white/80 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none shadow-sm placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button 
                onClick={handleSendRequest}
                disabled={!name || !origin || !destination}
                className="mt-4 w-full bg-gradient-to-r from-brand-green to-brand-blue text-white rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/30 active:scale-[0.98] relative z-20"
              >
                <Send className="w-5 h-5" />
                Enviar via WhatsApp
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-md p-8 text-center border-t border-slate-200/30 relative z-10">
        <div className="flex items-center justify-center gap-4 text-slate-500 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 text-brand-green" />
            24 Horas
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            <MapPinned className="w-3.5 h-3.5 text-brand-blue" />
            Sua Região
          </div>
        </div>
        <p className="text-[10px] text-slate-500 font-bold">
          © 2024 ZapMove Tecnologia. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
