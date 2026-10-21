import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Bike, 
  Package, 
  ChevronRight, 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Send, 
  User, 
  GraduationCap, 
  MapPinned, 
  Search, 
  Phone, 
  Banknote, 
  CheckCircle2, 
  X, 
  Sparkles,
  Store,
  Info,
  Layers,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import backgroundImage from './assets/images/arari_background_1781147986935.png';
import { 
  ARARI_NEIGHBORHOODS, 
  OFFICIAL_WHATSAPP, 
  DISPLAY_WHATSAPP, 
  SCHOOL_MOTO_MONTHLY_PRICE, 
  RIDE_EXTRA_FEE,
  getNeighborhoodPrice,
  formatCurrency,
  NeighborhoodRate 
} from './data/neighborhoods';

type ServiceType = 'delivery' | 'ride' | 'school_moto' | null;
type PaymentMethod = 'pix' | 'dinheiro';
type PriceFilter = 'todos' | number;

interface LocationData {
  latitude: number;
  longitude: number;
}

export default function App() {
  const [service, setService] = useState<ServiceType>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodRate | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Common fields
  const [clientName, setClientName] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [needsChange, setNeedsChange] = useState('');

  // Delivery specific
  const [storeName, setStoreName] = useState('');
  const [packageItems, setPackageItems] = useState('');

  // School moto specific
  const [parentPhone, setParentPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentRoom, setStudentRoom] = useState('');
  const [studentShift, setStudentShift] = useState<'Matutino' | 'Vespertino' | 'Integral'>('Matutino');

  // UI helpers
  const [step, setStep] = useState<1 | 2>(1);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('todos');
  const [showRateModal, setShowRateModal] = useState(false);
  const [modalTab, setModalTab] = useState<'all' | 'delivery' | 'ride'>('all');

  // Filtered neighborhoods
  const filteredNeighborhoods = useMemo(() => {
    return ARARI_NEIGHBORHOODS.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(neighborhoodSearch.toLowerCase().trim());
      const currentPrice = getNeighborhoodPrice(item, service);
      const matchesPrice = priceFilter === 'todos' || currentPrice === priceFilter;
      return matchesSearch && matchesPrice;
    });
  }, [neighborhoodSearch, priceFilter, service]);

  const getGeolocation = () => {
    setLoadingLocation(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Não foi possível obter o GPS.');
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocalização não suportada.');
      setLoadingLocation(false);
    }
  };

  const calculateTotalPrice = (): number | null => {
    if (service === 'school_moto') return SCHOOL_MOTO_MONTHLY_PRICE;
    if (selectedNeighborhood) {
      return getNeighborhoodPrice(selectedNeighborhood, service);
    }
    return null;
  };

  const handleStartService = (type: ServiceType, initialNeighborhood?: NeighborhoodRate) => {
    setService(type);
    setPriceFilter('todos');
    setNeighborhoodSearch('');
    if (initialNeighborhood) {
      setSelectedNeighborhood(initialNeighborhood);
    } else {
      setSelectedNeighborhood(null);
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendWhatsApp = () => {
    const locationLink = location 
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : 'Não informado (usar endereço)';

    const paymentLabel = {
      pix: 'PIX (Chave enviada após confirmação)',
      dinheiro: needsChange ? `Dinheiro (Troco para R$ ${needsChange})` : 'Dinheiro (Sem troco)'
    }[paymentMethod];

    let message = '';

    if (service === 'delivery') {
      const priceVal = selectedNeighborhood ? formatCurrency(getNeighborhoodPrice(selectedNeighborhood, 'delivery')) : 'A combinar';
      message = 
        `⚡ *ZAPMOVE - NOVO PEDIDO DE DELIVERY* ⚡%0A` +
        `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
        `👤 *Cliente:* ${clientName || 'Não informado'}%0A` +
        `🏪 *Coleta (Loja/Local):* ${storeName || originAddress || 'Não informado'}%0A` +
        `📍 *Bairro de Entrega:* *${selectedNeighborhood ? selectedNeighborhood.name : 'A combinar'}*%0A` +
        `🏠 *Endereço da Entrega:* ${destinationAddress || 'A combinar'}%0A` +
        `📦 *Itens/Encomenda:* ${packageItems || 'Entrega geral'}%0A` +
        `💰 *Taxa de Entrega:* *${priceVal}*%0A` +
        `💳 *Forma de Pagamento:* ${paymentLabel}%0A` +
        (notes ? `📝 *Observações:* ${notes}%0A` : '') +
        `📍 *Localização GPS:* ${locationLink}%0A` +
        `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
        `_Validado pelo WhatsApp oficial: ${DISPLAY_WHATSAPP}_`;
    } else if (service === 'ride') {
      const ridePriceVal = selectedNeighborhood ? formatCurrency(getNeighborhoodPrice(selectedNeighborhood, 'ride')) : 'A combinar';
      message = 
        `⚡ *ZAPMOVE - CHAMADO DE MOTO TÁXI* ⚡%0A` +
        `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
        `👤 *Passageiro:* ${clientName || 'Não informado'}%0A` +
        `🛫 *Origem (Onde buscar):* ${originAddress || 'Não informado'}%0A` +
        `📍 *Bairro de Destino:* *${selectedNeighborhood ? selectedNeighborhood.name : 'A combinar'}*%0A` +
        `🏁 *Destino / Referência:* ${destinationAddress || 'Não informado'}%0A` +
        `💰 *Valor da Corrida (+R$ 2,00/bairro):* *${ridePriceVal}*%0A` +
        `💳 *Forma de Pagamento:* ${paymentLabel}%0A` +
        (notes ? `📝 *Observações:* ${notes}%0A` : '') +
        `📍 *GPS Partida:* ${locationLink}%0A` +
        `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
        `_Validado pelo WhatsApp oficial: ${DISPLAY_WHATSAPP}_`;
    } else if (service === 'school_moto') {
      message = 
        `🎒 *ZAPMOVE - CADASTRO MOTO ESCOLAR* 🎒%0A` +
        `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
        `👨‍👩‍👦 *DADOS DO RESPONSÁVEL*%0A` +
        `*Nome:* ${clientName || 'Não informado'}%0A` +
        `*Telefone/Whats:* ${parentPhone || 'Não informado'}%0A` +
        `*Endereço Residencial:* ${originAddress || 'Não informado'}%0A` +
        (selectedNeighborhood ? `*Bairro:* ${selectedNeighborhood.name}%0A` : '') +
        `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
        `🧒 *DADOS DO ALUNO*%0A` +
        `*Nome do Aluno:* ${studentName || 'Não informado'}%0A` +
        `*Escola:* ${schoolName || destinationAddress || 'Não informado'}%0A` +
        `*Série/Ano:* ${studentGrade || 'Não informado'}%0A` +
        `*Sala:* ${studentRoom || 'Não informado'}%0A` +
        `*Turno:* ${studentShift}%0A` +
        `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
        `💰 *Mensalidade Fixa:* *${formatCurrency(SCHOOL_MOTO_MONTHLY_PRICE)} / mês*%0A` +
        (notes ? `📝 *Observações:* ${notes}%0A` : '') +
        `📍 *Localização GPS:* ${locationLink}%0A` +
        `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
        `_Validado pelo WhatsApp oficial: ${DISPLAY_WHATSAPP}_`;
    }

    const whatsappUrl = `https://wa.me/${OFFICIAL_WHATSAPP}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const resetAll = () => {
    setService(null);
    setSelectedNeighborhood(null);
    setPriceFilter('todos');
    setNeighborhoodSearch('');
    setStep(1);
    setClientName('');
    setOriginAddress('');
    setDestinationAddress('');
    setStoreName('');
    setPackageItems('');
    setNotes('');
    setNeedsChange('');
    setParentPhone('');
    setStudentName('');
    setSchoolName('');
    setStudentGrade('');
    setStudentRoom('');
  };

  const total = calculateTotalPrice();

  return (
    <div className="min-h-screen font-sans text-slate-900 flex flex-col items-center relative overflow-x-hidden">
      {/* Background with Arari Landmark */}
      <div className="fixed inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Arari - MA" 
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-950/40" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg min-h-screen flex flex-col relative z-10 bg-slate-900/35 backdrop-blur-md shadow-2xl border-x border-white/10">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetAll}>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform" />
              <Zap className="text-white w-5 h-5 relative z-10 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black italic tracking-tight text-white">
                  ZAP<span className="text-emerald-400">MOVE</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                  Arari-MA
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 leading-tight">
                Entregas & Corridas Express
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRateModal(true)}
              className="text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 px-2.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              title="Ver tabela completa de tarifas"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tarifas</span>
            </button>

            {step === 2 && (
              <button 
                onClick={() => setStep(1)} 
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all border border-white/10"
                title="Voltar aos serviços"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* WhatsApp Official Banner Alert */}
        <div className="bg-emerald-500/15 border-b border-emerald-500/25 px-4 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[11px] sm:text-xs">Validação Oficial:</span>
          </div>
          <a 
            href={`https://wa.me/${OFFICIAL_WHATSAPP}`} 
            target="_blank" 
            rel="noreferrer"
            className="font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 underline underline-offset-2 text-xs"
          >
            <Phone className="w-3 h-3 inline" />
            {DISPLAY_WHATSAPP}
          </a>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 pb-28 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ENXUTA E SIMPLES - APENAS OS SERVIÇOS */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-4"
              >
                {/* Hero Card Enxuto */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900/85 border border-white/15 p-5 text-white shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Praticidade & Rapidez em Arari</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                    Como podemos te atender agora?
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Escolha um dos serviços abaixo para ver a lista de bairros, valores correspondentes e solicitar direto pelo WhatsApp:
                  </p>
                </div>

                {/* 3 Main Services - Clean, Diretos e Imersivos */}
                <div className="flex flex-col gap-3.5">
                  
                  {/* 1. DELIVERY & ENTREGAS */}
                  <div 
                    onClick={() => handleStartService('delivery')}
                    className="group bg-white/95 hover:bg-white active:scale-[0.99] transition-all rounded-3xl p-4 shadow-lg border border-white/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
                        <Package className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-base font-black text-slate-900">
                            Delivery & Entregas
                          </h3>
                          <span className="text-[10px] font-black bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                            R$ 3 a R$ 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                          Lanches, compras, farmácia e encomendas
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 mt-1.5 group-hover:text-cyan-800">
                          <span>Acessar e escolher bairro</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. TRANSPORTE / MOTO TÁXI */}
                  <div 
                    onClick={() => handleStartService('ride')}
                    className="group bg-white/95 hover:bg-white active:scale-[0.99] transition-all rounded-3xl p-4 shadow-lg border border-white/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
                        <Bike className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-base font-black text-slate-900">
                            Transporte / Moto Táxi
                          </h3>
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                            R$ 5 a R$ 7
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                          Corridas de passageiros rápidas e seguras
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1.5 group-hover:text-emerald-800">
                          <span>Acessar e escolher destino</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. MOTO ESCOLAR */}
                  <div 
                    onClick={() => handleStartService('school_moto')}
                    className="group bg-white/95 hover:bg-white active:scale-[0.99] transition-all rounded-3xl p-4 shadow-lg border border-white/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform shrink-0">
                        <GraduationCap className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-base font-black text-slate-900">
                            Moto Escolar
                          </h3>
                          <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {formatCurrency(SCHOOL_MOTO_MONTHLY_PRICE)} / mês
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                          Transporte mensal com segurança para estudantes
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-1.5 group-hover:text-amber-800">
                          <span>Contratar mensalidade fixa</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Compact Info Footer Strip */}
                <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 text-slate-300 text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      20 Bairros de Arari Atendidos
                    </span>
                    <button
                      onClick={() => setShowRateModal(true)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline"
                    >
                      Consultar tabela
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 border-t border-white/5 pt-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Atendimento rápido via WhatsApp com confirmação imediata.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DETALHES ESPECÍFICOS DO SERVIÇO ESCOLHIDO */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                {/* Header Banner com Detalhes do Serviço Específico */}
                <div className={`rounded-3xl p-4 text-white shadow-lg border flex flex-col gap-2 ${
                  service === 'delivery' 
                    ? 'bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-cyan-500/30' 
                    : service === 'ride' 
                    ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/30' 
                    : 'bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 border-amber-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                        service === 'delivery' ? 'bg-cyan-600' :
                        service === 'ride' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}>
                        {service === 'delivery' && <Package className="w-5 h-5" />}
                        {service === 'ride' && <Bike className="w-5 h-5" />}
                        {service === 'school_moto' && <GraduationCap className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Serviço Selecionado
                        </span>
                        <h3 className="font-black text-sm text-white">
                          {service === 'delivery' && 'Delivery & Entregas de Encomendas'}
                          {service === 'ride' && 'Transporte de Passageiros / Moto Táxi'}
                          {service === 'school_moto' && 'Moto Escolar Mensalista'}
                        </h3>
                      </div>
                    </div>

                    <button 
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all border border-white/10"
                    >
                      Trocar
                    </button>
                  </div>

                  {/* Informações específicas de valores de cada serviço */}
                  <div className="mt-1 pt-2 border-t border-white/10 text-xs">
                    {service === 'delivery' && (
                      <div className="flex items-center justify-between text-cyan-200">
                        <span>Taxas de entrega por bairro:</span>
                        <span className="font-bold bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                          R$ 3,00 / R$ 4,00 / R$ 5,00
                        </span>
                      </div>
                    )}
                    {service === 'ride' && (
                      <div className="flex items-center justify-between text-emerald-200">
                        <span>Corridas (+R$ 2,00 por bairro):</span>
                        <span className="font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          R$ 5,00 / R$ 6,00 / R$ 7,00
                        </span>
                      </div>
                    )}
                    {service === 'school_moto' && (
                      <div className="flex items-center justify-between text-amber-200">
                        <span>Mensalidade escolar fixa:</span>
                        <span className="font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          {formatCurrency(SCHOOL_MOTO_MONTHLY_PRICE)} / mês
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* GPS Location Button */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-white/40 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Localização GPS
                      </span>
                      <p className="text-xs font-bold text-slate-800">
                        {location ? 'Localização GPS ativada' : 'Ajudar o motoboy a te encontrar'}
                      </p>
                      {locationError && (
                        <p className="text-[10px] text-red-500">{locationError}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={getGeolocation}
                    disabled={loadingLocation}
                    className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      location 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                    }`}
                  >
                    {loadingLocation ? (
                      'Buscando...'
                    ) : location ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Atualizado
                      </>
                    ) : (
                      'Ativar GPS'
                    )}
                  </button>
                </div>

                {/* BAIRROS SELECTION SECTION (Para Delivery e Moto Táxi) */}
                {service !== 'school_moto' && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 border border-white/50 shadow-lg flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <MapPinned className="w-4 h-4 text-emerald-600" />
                          {service === 'delivery' ? 'Bairro de Entrega' : 'Bairro de Destino'}
                        </label>
                        <p className="text-[11px] text-slate-500">
                          {service === 'delivery' 
                            ? 'Selecione o bairro para aplicar a taxa de entrega exata' 
                            : 'Selecione o bairro da corrida (+R$ 2,00 por bairro)'}
                        </p>
                      </div>

                      {selectedNeighborhood && (
                        <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                          {formatCurrency(getNeighborhoodPrice(selectedNeighborhood, service))}
                        </span>
                      )}
                    </div>

                    {/* Neighborhood Search Bar */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={neighborhoodSearch}
                        onChange={(e) => setNeighborhoodSearch(e.target.value)}
                        placeholder="Buscar bairro (ex: Centro, Trizidela...)"
                        className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                      {neighborhoodSearch && (
                        <button 
                          onClick={() => setNeighborhoodSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Price Filter Chips Adaptados ao Serviço */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        onClick={() => setPriceFilter('todos')}
                        className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all ${
                          priceFilter === 'todos' 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Todos ({ARARI_NEIGHBORHOODS.length})
                      </button>

                      {service === 'ride' ? (
                        <>
                          <button
                            onClick={() => setPriceFilter(5)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                              priceFilter === 5 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            R$ 5,00 (10)
                          </button>
                          <button
                            onClick={() => setPriceFilter(6)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                              priceFilter === 6 
                                ? 'bg-amber-600 text-white' 
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            R$ 6,00 (8)
                          </button>
                          <button
                            onClick={() => setPriceFilter(7)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                              priceFilter === 7 
                                ? 'bg-cyan-600 text-white' 
                                : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                            }`}
                          >
                            R$ 7,00 (2)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setPriceFilter(3)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                              priceFilter === 3 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            R$ 3,00 (10)
                          </button>
                          <button
                            onClick={() => setPriceFilter(4)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                              priceFilter === 4 
                                ? 'bg-amber-600 text-white' 
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            R$ 4,00 (8)
                          </button>
                          <button
                            onClick={() => setPriceFilter(5)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                              priceFilter === 5 
                                ? 'bg-cyan-600 text-white' 
                                : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                            }`}
                          >
                            R$ 5,00 (2)
                          </button>
                        </>
                      )}
                    </div>

                    {/* Neighborhoods Grid com valores específicos */}
                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 pr-1.5">
                      {filteredNeighborhoods.map((n) => {
                        const isSelected = selectedNeighborhood?.id === n.id;
                        const currentRate = getNeighborhoodPrice(n, service);
                        return (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => setSelectedNeighborhood(n)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 active:scale-95 ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                                {n.name}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-[11px] font-black w-fit px-1.5 py-0.5 rounded ${
                                service === 'ride' 
                                  ? (currentRate === 5 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : currentRate === 6 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-cyan-100 text-cyan-800')
                                  : (currentRate === 3 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : currentRate === 4 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-cyan-100 text-cyan-800')
                              }`}>
                                {formatCurrency(currentRate)}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                      {filteredNeighborhoods.length === 0 && (
                        <div className="col-span-2 text-center py-4 text-xs text-slate-400">
                          Nenhum bairro encontrado com &quot;{neighborhoodSearch}&quot;.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FORM FIELDS ESPECÍFICOS */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-white/50 shadow-lg flex flex-col gap-4">
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    Dados do Pedido
                  </h3>

                  {/* CAMPOS DE DELIVERY */}
                  {service === 'delivery' && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                          Seu Nome (Quem pede)
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={clientName} 
                            onChange={(e) => setClientName(e.target.value)} 
                            placeholder="Ex: Carlos Silva"
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                          Onde Coletar? (Estabelecimento / Endereço)
                        </label>
                        <div className="relative">
                          <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={storeName} 
                            onChange={(e) => setStoreName(e.target.value)} 
                            placeholder="Ex: Farmácia Preço Baixo / Restaurante / Casa"
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                          Endereço Completo da Entrega
                        </label>
                        <div className="relative">
                          <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={destinationAddress} 
                            onChange={(e) => setDestinationAddress(e.target.value)} 
                            placeholder="Rua, Número, Ponto de referência"
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                          O que precisa entregar / comprar?
                        </label>
                        <textarea 
                          rows={2}
                          value={packageItems} 
                          onChange={(e) => setPackageItems(e.target.value)} 
                          placeholder="Ex: Remédio da receita, lanche número 2, pacote de compras..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {/* CAMPOS DE MOTO TÁXI */}
                  {service === 'ride' && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                          Nome do Passageiro
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={clientName} 
                            onChange={(e) => setClientName(e.target.value)} 
                            placeholder="Seu nome"
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                          Origem (Onde o mototaxista busca)
                        </label>
                        <div className="relative">
                          <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={originAddress} 
                            onChange={(e) => setOriginAddress(e.target.value)} 
                            placeholder="Rua, número ou referência onde você está"
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                          Destino (Endereço / Referência exata)
                        </label>
                        <div className="relative">
                          <MapPinned className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={destinationAddress} 
                            onChange={(e) => setDestinationAddress(e.target.value)} 
                            placeholder="Para onde você vai no bairro?"
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* CAMPOS DE MOTO ESCOLAR */}
                  {service === 'school_moto' && (
                    <>
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Mensalidade Fixa: {formatCurrency(SCHOOL_MOTO_MONTHLY_PRICE)}/mês</span>
                          Transporte diário de ida e volta para escola, com segurança, cuidado e pontualidade.
                        </div>
                      </div>

                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Dados do Responsável
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Nome do Responsável</label>
                          <input 
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Nome do pai / mãe / tutor"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Telefone / WhatsApp</label>
                          <input 
                            type="tel"
                            value={parentPhone}
                            onChange={(e) => setParentPhone(e.target.value)}
                            placeholder="(98) 99999-9999"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">Endereço Residencial (Partida)</label>
                        <input 
                          type="text"
                          value={originAddress}
                          onChange={(e) => setOriginAddress(e.target.value)}
                          placeholder="Rua, número e bairro da residência"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mt-2">
                        Dados do Aluno
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Nome do Aluno</label>
                          <input 
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Nome completo da criança"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Escola / Colégio</label>
                          <input 
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            placeholder="Nome da escola"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Série / Ano</label>
                          <input 
                            type="text"
                            value={studentGrade}
                            onChange={(e) => setStudentGrade(e.target.value)}
                            placeholder="Ex: 5º ano"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Sala</label>
                          <input 
                            type="text"
                            value={studentRoom}
                            onChange={(e) => setStudentRoom(e.target.value)}
                            placeholder="Ex: Sala 04"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Turno</label>
                          <select
                            value={studentShift}
                            onChange={(e: any) => setStudentShift(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                          >
                            <option value="Matutino">Manhã</option>
                            <option value="Vespertino">Tarde</option>
                            <option value="Integral">Integral</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* FORMA DE PAGAMENTO */}
                  {service !== 'school_moto' && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                        Forma de Pagamento
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('pix')}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                            paymentMethod === 'pix' 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>PIX</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('dinheiro')}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                            paymentMethod === 'dinheiro' 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Dinheiro</span>
                        </button>
                      </div>

                      {paymentMethod === 'dinheiro' && (
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                            Precisa de troco para:
                          </label>
                          <input 
                            type="text"
                            value={needsChange}
                            onChange={(e) => setNeedsChange(e.target.value)}
                            placeholder="Ex: R$ 50,00"
                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 flex-1"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* OBSERVAÇÕES */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                      Observações / Ponto de Referência
                    </label>
                    <textarea 
                      rows={2}
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Ex: Próximo à praça, casa com portão azul, ligar quando chegar..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* BOTTOM STICKY BAR WHEN IN STEP 2 */}
        {step === 2 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-3 pointer-events-none">
            <div className="w-full max-w-lg bg-slate-950/95 backdrop-blur-xl border border-white/15 rounded-3xl p-4 shadow-2xl pointer-events-auto flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {service === 'school_moto' ? 'Mensalidade Fixa' : 'Valor Total Estimado'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {total !== null ? formatCurrency(total) : 'A combinar'}
                    </span>
                    {service === 'school_moto' && (
                      <span className="text-xs text-slate-400 font-bold">/mês</span>
                    )}
                    {selectedNeighborhood && service !== 'school_moto' && (
                      <span className="text-xs text-emerald-400 font-semibold">
                        ({selectedNeighborhood.name})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    Validação Direta
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {DISPLAY_WHATSAPP}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleSendWhatsApp}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-3.5 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all"
              >
                <Send className="w-5 h-5 fill-white" />
                <span>Enviar Pedido no WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="w-full py-4 px-6 text-center text-slate-400 text-xs border-t border-white/10 bg-slate-950/50 mt-auto">
          <p className="font-semibold text-slate-300">
            ZAPMOVE Arari • Mobilidade & Entregas Rápidas
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            WhatsApp Oficial: <span className="text-emerald-400 font-bold">{DISPLAY_WHATSAPP}</span>
          </p>
        </footer>
      </div>

      {/* MODAL DE CONSULTA DE TODAS AS TARIFAS */}
      <AnimatePresence>
        {showRateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRateModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md max-h-[85vh] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-white"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <MapPinned className="w-4 h-4 text-emerald-400" />
                    Tabela Oficial dos 20 Bairros
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Valores comparativos de Delivery e Moto Táxi
                  </p>
                </div>
                <button 
                  onClick={() => setShowRateModal(false)}
                  className="p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs for comparison */}
              <div className="px-4 pt-3 flex gap-2 border-b border-white/10 pb-3 bg-slate-950/40">
                <button
                  onClick={() => setModalTab('all')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    modalTab === 'all' 
                      ? 'bg-emerald-600 text-white shadow' 
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Comparativo
                </button>
                <button
                  onClick={() => setModalTab('delivery')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    modalTab === 'delivery' 
                      ? 'bg-cyan-600 text-white shadow' 
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Delivery (R$ 3 a 5)
                </button>
                <button
                  onClick={() => setModalTab('ride')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    modalTab === 'ride' 
                      ? 'bg-emerald-500 text-slate-950 shadow' 
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Moto Táxi (+R$ 2)
                </button>
              </div>

              {/* Price Groups Summary */}
              <div className="p-4 overflow-y-auto flex flex-col gap-4">
                
                {/* R$ 3,00 Delivery / R$ 5,00 Moto Táxi Group */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Grupo 1 • 10 Bairros
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-black">
                      <span className="text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        Delivery: R$ 3,00
                      </span>
                      <span className="text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        Moto Táxi: R$ 5,00
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ARARI_NEIGHBORHOODS.filter(b => b.price === 3).map(b => (
                      <div
                        key={b.id}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1"
                      >
                        <span className="text-xs font-bold text-white">
                          {b.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-cyan-300 font-semibold">Deliv: R$ 3</span>
                          <span className="text-emerald-400 font-bold">Moto Táxi: R$ 5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* R$ 4,00 Delivery / R$ 6,00 Moto Táxi Group */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Grupo 2 • 8 Bairros
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-black">
                      <span className="text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        Delivery: R$ 4,00
                      </span>
                      <span className="text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        Moto Táxi: R$ 6,00
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ARARI_NEIGHBORHOODS.filter(b => b.price === 4).map(b => (
                      <div
                        key={b.id}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1"
                      >
                        <span className="text-xs font-bold text-white">
                          {b.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-cyan-300 font-semibold">Deliv: R$ 4</span>
                          <span className="text-amber-400 font-bold">Moto Táxi: R$ 6</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* R$ 5,00 Delivery / R$ 7,00 Moto Táxi Group */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Grupo 3 • 2 Bairros
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-black">
                      <span className="text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        Delivery: R$ 5,00
                      </span>
                      <span className="text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                        Moto Táxi: R$ 7,00
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ARARI_NEIGHBORHOODS.filter(b => b.price === 5).map(b => (
                      <div
                        key={b.id}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1"
                      >
                        <span className="text-xs font-bold text-white">
                          {b.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-cyan-300 font-semibold">Deliv: R$ 5</span>
                          <span className="text-cyan-300 font-bold">Moto Táxi: R$ 7</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Moto Escolar Info */}
                <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-300 block">Moto Escolar Mensal</span>
                    <span className="text-slate-300 text-[11px]">Transporte fixo diário para estudantes</span>
                  </div>
                  <span className="font-black text-amber-400 text-sm">
                    {formatCurrency(SCHOOL_MOTO_MONTHLY_PRICE)}/mês
                  </span>
                </div>

                {/* Validation Note */}
                <div className="text-center pt-2 text-[11px] text-slate-400">
                  Validação direta no WhatsApp: <span className="text-emerald-400 font-bold">{DISPLAY_WHATSAPP}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
