import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Entry, InsertEntry, DeleteEntry, UpdateEntry } from "@shared/schema";

export function useEntries() {
  return useQuery<Entry[]>({
    queryKey: ["/api/entries"],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/entry?Action=GetEntries", {});
      return response.json();
    },
  });
}

export function useEntry(id: number) {
  return useQuery<Entry>({
    queryKey: ["/api/entries", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/entry?Action=GetEntry", { id });
      return response.json();
    },
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertEntry) => {
      const response = await apiRequest("POST", "/api/entry?Action=CreateEntry", data);
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
      const response = await apiRequest("POST", "/api/entry?Action=UpdateEntry", { id, ...data });
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
      await apiRequest("POST", "/api/entry?Action=DeleteEntry", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
    },
  });
}
