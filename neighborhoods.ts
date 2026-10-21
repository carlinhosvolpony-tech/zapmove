export interface NeighborhoodRate {
  id: string;
  name: string;
  price: number; // Preço base (Delivery)
  highlight?: boolean;
}

export const OFFICIAL_WHATSAPP = '5598984595785';
export const DISPLAY_WHATSAPP = '(98) 98459-5785';

// Moto Escolar atualizado para R$ 200,00/mês
export const SCHOOL_MOTO_MONTHLY_PRICE = 200.00;

// Acréscimo para transporte / moto táxi (+ R$ 2,00 por bairro)
export const RIDE_EXTRA_FEE = 2.00;

export const ARARI_NEIGHBORHOODS: NeighborhoodRate[] = [
  { id: 'centro', name: 'Centro', price: 3, highlight: true },
  { id: 'recanto-florido', name: 'Recanto Florido', price: 3 },
  { id: 'mearim', name: 'Mearim', price: 3 },
  { id: 'cabana-do-boi', name: 'Cabana do boi', price: 4 },
  { id: 'novo-horizonte', name: 'Novo Horizonte', price: 4 },
  { id: 'campo-de-aviacao', name: 'Campo de aviação', price: 4 },
  { id: 'coreia', name: 'Coreia', price: 4 },
  { id: 'trizidela', name: 'Trizidela', price: 5, highlight: true },
  { id: 'cafezal', name: 'Cafezal', price: 4 },
  { id: 'roseana-sarney', name: 'Roseana Sarney', price: 3 },
  { id: 'malvinas', name: 'Malvinas', price: 3 },
  { id: 'maestro-goncalves-martins', name: 'Maestro Gonçalves Martins', price: 3 },
  { id: 'conjunto-habitacional', name: 'Conjunto habitacional', price: 4 },
  { id: 'cemar', name: 'Cemar', price: 3 },
  { id: 'flores', name: 'Flores', price: 3 },
  { id: 'tamarineiro', name: 'Tamarineiro', price: 4 },
  { id: 'cruzeiro', name: 'Cruzeiro', price: 3 },
  { id: 'botafogo', name: 'Botafogo', price: 4 },
  { id: 'perimirim', name: 'Perimirim', price: 5, highlight: true },
  { id: 'catarina', name: 'Catarina', price: 3 },
];

export const getNeighborhoodPrice = (
  neighborhood: NeighborhoodRate, 
  service: 'delivery' | 'ride' | 'school_moto' | null
): number => {
  if (service === 'ride') {
    return neighborhood.price + RIDE_EXTRA_FEE;
  }
  return neighborhood.price;
};

export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};
