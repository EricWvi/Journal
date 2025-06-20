import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertEntrySchema } from "@shared/schema";

// Configure multer for photo uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all entries
  app.post("/api/entry", async (req, res) => {
    const action = req.query.Action;
    try {
      if (action === "GetEntries") {
        const entries = await storage.getEntries();
        return res.json(entries);
      }
      if (action === "GetEntry") {
        const { id } = req.body;
        const entry = await storage.getEntry(Number(id));
        if (!entry) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.json(entry);
      }
      if (action === "CreateEntry") {
        const validatedData = insertEntrySchema.parse(req.body);
        const entry = await storage.createEntry(validatedData);
        return res.status(201).json(entry);
      }
      if (action === "UpdateEntry") {
        const { id, ...data } = req.body;
        const validatedData = insertEntrySchema.partial().parse(data);
        const entry = await storage.updateEntry(Number(id), validatedData);
        if (!entry) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.json(entry);
      }
      if (action === "DeleteEntry") {
        const { id } = req.body;
        const deleted = await storage.deleteEntry(Number(id));
        if (!deleted) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.status(204).send();
      }
      return res.status(400).json({ message: "Unknown Action" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Search entries
  app.post("/api/entries/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const entries = await storage.searchEntries(query);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to search entries" });
    }
  });

  // Upload photos
  app.post("/api/upload", upload.array('photos', 10), (req: any, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const filePaths = req.files.map((file: any) => `/uploads/${file.filename}`);
      res.json({ photos: filePaths });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
