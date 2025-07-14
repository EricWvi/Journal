import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Entry, InsertEntry } from "@shared/schema";

export interface EntryMeta {
  id: number;
  year: number;
  month: number;
  day: number;
}

export interface QueryCondition {
  field: string; // e.g., "date", "tag", "place"
  operator: string; // e.g., "eq", "in", "between", "like"
  value: any; // string, number, array, etc.
}

export async function useEntries(
  page: number = 1,
  condition: QueryCondition[] = [],
  setQueryFn: (key: (string | number)[], data: any) => void,
): Promise<[EntryMeta[], boolean]> {
  const response = await apiRequest("POST", "/api/entry?Action=GetEntries", {
    page,
    condition,
  });
  const data = await response.json();
  const metas = (data.message.entries as Entry[]).map((entry) => {
    setQueryFn(["/api/entry", entry.id], entry);
    const time = new Date(entry.createdAt);
    return {
      id: entry.id,
      year: time.getFullYear(),
      month: time.getMonth() + 1,
      day: time.getDate(),
    };
  });
  return [metas, data.message.hasMore];
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
        "/api/entry?Action=CreateEntryFromDraft",
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
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["/api/entry", variables.id],
      }),
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

// TODO useDeleteEntry fix bug
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
