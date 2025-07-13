import { useQuery } from '@tanstack/react-query';
import { fetchThreats } from '@/services/api';

export const useThreats = () => {
  return useQuery({
    queryKey: ['threats'],
    queryFn: fetchThreats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });
};
