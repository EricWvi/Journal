import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Entry, InsertEntry } from "@shared/schema";

export function useEntries() {
  const queryClient = useQueryClient();

  return useQuery<number[]>({
    queryKey: ["homepage"],
    queryFn: async () => {
      const response = await apiRequest(
        "POST",
        "/api/entry?Action=GetEntries",
        {},
      );
      const data = await response.json();
      const ids = (data["message"] as Entry[]).map((entry) => {
        queryClient.setQueryData(["/api/entry", entry.id], entry);
        return entry.id;
      });
      return ids;
    },
  });
}

export function useEntry(id: number) {
  return useQuery<Entry>({
    queryKey: ["/api/entry", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/entry?Action=GetEntry", {
        id,
      });
      const data = await response.json();
      return data["message"];
    },
  });
}

export async function useDraft(): Promise<number> {
  const response = await apiRequest("POST", "/api/entry?Action=GetDraft", {});
  const data = await response.json();
  return data["message"].id;
}

export function useCreateEntryFromDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: number } & Partial<InsertEntry>) => {
      const response = await apiRequest(
        "POST",
        "/api/entry?Action=createEntryFromDraft",
        { id, ...data },
      );
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["homepage"] }),
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: number } & Partial<InsertEntry>) => {
      const response = await apiRequest(
        "POST",
        "/api/entry?Action=UpdateEntry",
        { id, ...data },
      );
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["homepage"] }),
  });
}

export function useUpdateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: number } & Partial<InsertEntry>) => {
      const response = await apiRequest(
        "POST",
        "/api/entry?Action=UpdateEntry",
        { id, ...data },
      );
      return response.json();
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["/api/entry", variables.id],
      }),
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", "/api/entry?Action=DeleteEntry", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}
