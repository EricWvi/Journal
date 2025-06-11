import type { Express } from "express";
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
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all entries
  app.get("/api/entries", async (req, res) => {
    try {
      const entries = await storage.getEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // Get single entry
  app.get("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  // Create new entry
  app.post("/api/entries", async (req, res) => {
    try {
      const validatedData = insertEntrySchema.parse(req.body);
      const entry = await storage.createEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create entry" });
      }
    }
  });

  // Update entry
  app.patch("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEntrySchema.partial().parse(req.body);
      const entry = await storage.updateEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update entry" });
      }
    }
  });

  // Delete entry
  app.delete("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Search entries
  app.get("/api/entries/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const entries = await storage.searchEntries(query);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to search entries" });
    }
  });

  // Upload photos
  app.post("/api/upload", upload.array('photos', 10), (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const filePaths = req.files.map(file => `/uploads/${file.filename}`);
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
