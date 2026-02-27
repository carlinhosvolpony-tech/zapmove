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
  Bike
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
    setDestination('');
    setDetails('');
  };

  return (
    <div className="min-h-screen bg-emerald-950 font-sans text-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md bg-emerald-900/80 backdrop-blur-md border-b border-emerald-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2" onClick={reset} style={{ cursor: 'pointer' }}>
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Navigation className="text-emerald-950 w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">ZapMove</h1>
        </div>
        {service && (
          <button 
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-amber-500 transition-colors px-2 py-1"
          >
            Voltar
          </button>
        )}
      </header>

      <main className="w-full max-w-md flex-1 p-6 flex flex-col gap-6">
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
                <h2 className="text-2xl font-bold text-white">Para onde vamos hoje?</h2>
                <p className="text-emerald-200/60">Escolha o serviço desejado para começar.</p>
              </div>

              <button 
                onClick={() => { setService('ride'); setStep(2); }}
                className="group relative overflow-hidden bg-emerald-900 border border-emerald-800 rounded-2xl p-6 flex items-center gap-6 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
                  <Car className="w-8 h-8 text-amber-500 group-hover:text-emerald-950 transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-white">Transporte</h3>
                  <p className="text-sm text-emerald-200/60">Viagens rápidas e seguras</p>
                </div>
                <ChevronRight className="text-emerald-700 group-hover:text-amber-500 transition-colors" />
              </button>

              <button 
                onClick={() => { setService('delivery'); setStep(3); }}
                className="group relative overflow-hidden bg-emerald-900 border border-emerald-800 rounded-2xl p-6 flex items-center gap-6 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
                  <Package className="w-8 h-8 text-amber-500 group-hover:text-emerald-950 transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-white">Delivery</h3>
                  <p className="text-sm text-emerald-200/60">Entregas e encomendas</p>
                </div>
                <ChevronRight className="text-emerald-700 group-hover:text-amber-500 transition-colors" />
              </button>

              <div className="mt-8 p-4 bg-amber-500/5 rounded-2xl flex gap-3 items-start border border-amber-500/10">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
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
                <h2 className="text-2xl font-bold text-white">Escolha o veículo</h2>
                <p className="text-emerald-200/60">Qual a melhor opção para você agora?</p>
              </div>

              <button 
                onClick={() => { setVehicle('car'); setStep(3); }}
                className="group relative overflow-hidden bg-emerald-900 border border-emerald-800 rounded-2xl p-6 flex items-center gap-6 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
                  <Car className="w-8 h-8 text-amber-500 group-hover:text-emerald-950 transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-white">Carro</h3>
                  <p className="text-sm text-emerald-200/60">Mais conforto e espaço</p>
                </div>
                <ChevronRight className="text-emerald-700 group-hover:text-amber-500 transition-colors" />
              </button>

              <button 
                onClick={() => { setVehicle('moto'); setStep(3); }}
                className="group relative overflow-hidden bg-emerald-900 border border-emerald-800 rounded-2xl p-6 flex items-center gap-6 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
                  <Bike className="w-8 h-8 text-amber-500 group-hover:text-emerald-950 transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-white">Moto</h3>
                  <p className="text-sm text-emerald-200/60">Mais agilidade e economia</p>
                </div>
                <ChevronRight className="text-emerald-700 group-hover:text-amber-500 transition-colors" />
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
                <h2 className="text-2xl font-bold text-white">
                  {service === 'ride' ? 'Detalhes da Viagem' : 'Detalhes da Entrega'}
                </h2>
                <p className="text-emerald-200/60">Preencha as informações abaixo.</p>
              </div>

              {/* Location Section */}
              <div className="bg-emerald-900 border border-emerald-800 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-emerald-100">Sua Localização</span>
                  </div>
                  {!location && (
                    <button 
                      onClick={getGeolocation}
                      disabled={loadingLocation}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 disabled:opacity-50 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {loadingLocation ? 'Buscando...' : 'Obter GPS'}
                    </button>
                  )}
                </div>
                
                {location ? (
                  <div className="flex items-center gap-3 bg-amber-500/10 text-amber-400 p-4 rounded-xl border border-amber-500/20 shadow-inner">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold">Localização capturada!</p>
                      <p className="opacity-80 font-mono">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400/40 italic bg-emerald-950/50 p-3 rounded-xl border border-dashed border-emerald-800">
                    Clique em "Obter GPS" para enviar sua posição exata.
                  </div>
                )}
              </div>

              {/* Form Section */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400/60 ml-1">
                    {service === 'ride' ? 'Destino' : 'O que entregar?'}
                  </label>
                  <input 
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={service === 'ride' ? 'Ex: Rua das Flores, 123' : 'Ex: 2 Pizzas e 1 Coca'}
                    className="w-full bg-emerald-900 border border-emerald-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm placeholder:text-emerald-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400/60 ml-1">
                    Observações (Opcional)
                  </label>
                  <textarea 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Ex: Perto da padaria, portão azul..."
                    rows={3}
                    className="w-full bg-emerald-900 border border-emerald-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all resize-none shadow-sm placeholder:text-emerald-800"
                  />
                </div>
              </div>

              <button 
                onClick={handleSendRequest}
                disabled={!destination}
                className="mt-4 w-full bg-amber-500 text-emerald-950 rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-amber-500/20 active:scale-[0.98]"
              >
                <Send className="w-5 h-5" />
                Enviar via WhatsApp
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-md p-8 text-center border-t border-emerald-900">
        <div className="flex items-center justify-center gap-4 text-emerald-700 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 text-amber-500/50" />
            24 Horas
          </div>
          <div className="w-1 h-1 bg-emerald-800 rounded-full" />
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            <MapPinned className="w-3.5 h-3.5 text-amber-500/50" />
            Sua Região
          </div>
        </div>
        <p className="text-[10px] text-emerald-800 font-medium">
          © 2024 ZapMove Tecnologia. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
