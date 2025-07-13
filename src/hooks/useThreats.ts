// YourComponent.tsx (or wherever useThreats is defined)
import { useQuery } from '@tanstack/react-query';
import { fetchThreats } from '@/services/api'; // This import remains the same

export const useThreats = () => {
  console.log("APIII")
  return useQuery({
    queryKey: ['threats'],
    queryFn: fetchThreats, // This function now points to the correct URL
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,       // Data is considered fresh for 10 seconds
  });
};