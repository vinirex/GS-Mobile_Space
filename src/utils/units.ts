export const kmToMiles = (km: number): number => km * 0.621371;
export const kmhToMph = (kmh: number): number => kmh * 0.621371;

export const formatDistance = (valueKm: number, useMetric: boolean): string => {
  const value = useMetric ? valueKm : kmToMiles(valueKm);
  const unit = useMetric ? 'km' : 'mi';
  const formatted = value.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return `${formatted} ${unit}`;
};

export const formatVelocity = (valueKmh: number, useMetric: boolean): string => {
  const value = useMetric ? valueKmh : kmhToMph(valueKmh);
  const unit = useMetric ? 'km/h' : 'mph';
  const formatted = value.toLocaleString('pt-BR', {
    maximumFractionDigits: 0,
  });
  return `${formatted} ${unit}`;
};
