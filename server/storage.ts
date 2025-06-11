import { entries, type Entry, type InsertEntry } from "@shared/schema";

export interface IStorage {
  getEntries(): Promise<Entry[]>;
  getEntry(id: number): Promise<Entry | undefined>;
  createEntry(entry: InsertEntry): Promise<Entry>;
  updateEntry(id: number, entry: Partial<InsertEntry>): Promise<Entry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
  searchEntries(query: string): Promise<Entry[]>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, Entry>;
  private currentId: number;

  constructor() {
    this.entries = new Map();
    this.currentId = 1;
  }

  async getEntries(): Promise<Entry[]> {
    return Array.from(this.entries.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getEntry(id: number): Promise<Entry | undefined> {
    return this.entries.get(id);
  }

  async createEntry(insertEntry: InsertEntry): Promise<Entry> {
    const id = this.currentId++;
    const now = new Date();
    const entry: Entry = {
      ...insertEntry,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(id, entry);
    return entry;
  }

  async updateEntry(id: number, updateData: Partial<InsertEntry>): Promise<Entry | undefined> {
    const existing = this.entries.get(id);
    if (!existing) return undefined;

    const updated: Entry = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.entries.set(id, updated);
    return updated;
  }

  async deleteEntry(id: number): Promise<boolean> {
    return this.entries.delete(id);
  }

  async searchEntries(query: string): Promise<Entry[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.entries.values())
      .filter(entry => 
        entry.title.toLowerCase().includes(lowercaseQuery) ||
        entry.content.toLowerCase().includes(lowercaseQuery) ||
        entry.mood?.toLowerCase().includes(lowercaseQuery) ||
        entry.location?.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const storage = new MemStorage();
