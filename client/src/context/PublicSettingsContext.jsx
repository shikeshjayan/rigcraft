import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicSettings } from '../services/settings.service';

const PublicSettingsContext = createContext();

export const usePublicSettings = () => {
  return useContext(PublicSettingsContext);
};

export const PublicSettingsProvider = ({ children }) => {
  const { data } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: getPublicSettings,
    staleTime: 300000,
  });

  const freeShippingAbove = Number(data?.shipping?.freeShippingAbove) || 0;

  return (
    <PublicSettingsContext.Provider value={{ settings: data, freeShippingAbove }}>
      {children}
    </PublicSettingsContext.Provider>
  );
};
