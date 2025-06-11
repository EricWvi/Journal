import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Entry, InsertEntry } from "@shared/schema";

export function useEntries() {
  return useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });
}

export function useEntry(id: number) {
  return useQuery<Entry>({
    queryKey: ["/api/entries", id],
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertEntry) => {
      const response = await apiRequest("POST", "/api/entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertEntry>) => {
      const response = await apiRequest("PATCH", `/api/entries/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
    },
  });
}
