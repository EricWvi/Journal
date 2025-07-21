// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import multer from "multer";
import path from "path";
import fs2 from "fs";

// client/src/lib/html-parse.ts
var Style = {
  NORMAL: 0,
  BOLD: 1 << 0,
  ITALIC: 1 << 1,
  UNDERLINE: 1 << 2,
  MARK: 1 << 3,
  STRIKETHROUGH: 1 << 4
};

// shared/schema.ts
import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var entries = pgTable("entry", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  content: jsonb("content").$type().default([]).notNull(),
  visibility: text("visibility").default("PUBLIC" /* PUBLIC */).notNull(),
  payload: jsonb("payload").$type().default({}).notNull()
});
var insertEntrySchema = createInsertSchema(entries).omit({
  id: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

// server/storage.ts
import fs from "fs";
var MemStorage = class {
  entries;
  currentId;
  constructor() {
    this.entries = /* @__PURE__ */ new Map();
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    } else {
      if (fs.existsSync("uploads/entries.json")) {
        this.entries = new Map(
          JSON.parse(fs.readFileSync("uploads/entries.json", "utf-8"))
        );
      }
    }
    this.currentId = this.entries.size + 1;
    process.on("exit", () => {
      fs.writeFileSync(
        "uploads/entries.json",
        JSON.stringify(Array.from(this.entries.entries()), null, 2)
      );
    });
  }
  async getDraft() {
    const e = Array.from(this.entries.values()).find(
      (entry) => entry.visibility === "DRAFT" /* DRAFT */
    );
    if (e) return e;
    return this.createDraft();
  }
  async getEntries() {
    return Array.from(this.entries.values()).filter((entry) => entry.visibility !== "DRAFT" /* DRAFT */).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async getEntry(id) {
    return this.entries.get(id);
  }
  async getEntryCount() {
    return this.entries.size;
  }
  async getEntryDate() {
    const dates = Array.from(this.entries.values()).filter((entry) => entry.visibility !== "DRAFT" /* DRAFT */).map((entry) => new Date(entry.createdAt).toISOString().split("T")[0]);
    return Array.from(new Set(dates));
  }
  async createDraft() {
    const id = this.currentId++;
    const now = /* @__PURE__ */ new Date();
    const entry = {
      id,
      creatorId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      content: [],
      visibility: "DRAFT" /* DRAFT */,
      payload: {}
    };
    this.entries.set(id, entry);
    return entry;
  }
  async createEntryFromDraft(id, insertEntry) {
    const now = /* @__PURE__ */ new Date();
    const entry = {
      id,
      creatorId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      content: Array.isArray(insertEntry.content) ? insertEntry.content : [],
      visibility: insertEntry.visibility ?? "PUBLIC" /* PUBLIC */,
      payload: insertEntry.payload ?? {}
    };
    this.entries.set(id, entry);
    return entry;
  }
  async updateEntry(id, updateData) {
    const existing = this.entries.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      updatedAt: /* @__PURE__ */ new Date(),
      content: Array.isArray(updateData.content) ? updateData.content : existing.content,
      visibility: updateData.visibility ?? existing.visibility,
      payload: updateData.payload ?? existing.payload
    };
    this.entries.set(id, updated);
    return updated;
  }
  async deleteEntry(id) {
    return this.entries.delete(id);
  }
  async searchEntries(query) {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.entries.values()).filter((entry) => {
      const nodes = entry.content;
      return nodes.some(
        (node) => node.type === "text" /* TEXT */ && typeof node.content === "string" && node.content.toLowerCase().includes(lowercaseQuery)
      );
    }).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
};
var storage = new MemStorage();

// server/routes.ts
var upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
async function registerRoutes(app2) {
  app2.post("/api/entry", async (req, res) => {
    const action = req.query.Action;
    try {
      if (action === "GetDraft") {
        const draft = await storage.getDraft();
        return res.json({ message: draft });
      }
      if (action === "GetEntries") {
        const { page, c } = req.body;
        const condition = c || [];
        const all = await storage.getEntries();
        const entries2 = all.filter((entry) => {
          return condition.every((cond) => {
            if (cond.field === "date") {
              const entryDate = new Date(entry.createdAt);
              switch (cond.operator) {
                case "eq":
                  const valueDate = new Date(cond.value);
                  return entryDate.getFullYear() === valueDate.getFullYear() && entryDate.getMonth() === valueDate.getMonth() && entryDate.getDate() === valueDate.getDate();
                case "in":
                  const [left, right] = cond.value;
                  const leftDate = new Date(left);
                  const rightDate = new Date(right);
                  return entryDate >= leftDate && entryDate <= rightDate;
                default:
                  return false;
              }
            }
            if (cond.field === "tag") {
              return entry.payload.tags && entry.payload.tags.includes(cond.value);
            }
            if (cond.field === "place") {
              return entry.payload.location && Array.isArray(cond.value) && entry.payload.location.length >= cond.value.length && cond.value.every(
                (loc, idx) => entry.payload.location && loc === entry.payload.location[idx]
              );
            }
          });
        });
        const pageSize = 6;
        const hasMore = entries2.length > page * pageSize;
        const entriesInPage = entries2.slice(
          (page - 1) * pageSize,
          page * pageSize
        );
        return res.json({ message: { entries: entriesInPage, hasMore } });
      }
      if (action === "GetEntry") {
        const { id } = req.body;
        const entry = await storage.getEntry(Number(id));
        if (!entry) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.json({ message: entry });
      }
      if (action === "CreateEntryFromDraft") {
        const { id, ...data } = req.body;
        const validatedData = insertEntrySchema.partial().parse(data);
        const entry = await storage.createEntryFromDraft(
          Number(id),
          validatedData
        );
        if (!entry) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.json({ message: entry });
      }
      if (action === "UpdateEntry") {
        const { id, ...data } = req.body;
        const validatedData = insertEntrySchema.partial().parse(data);
        const entry = await storage.updateEntry(Number(id), validatedData);
        if (!entry) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.json({ message: entry });
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
  app2.post("/api/meta", async (req, res) => {
    const action = req.query.Action;
    try {
      if (action === "GetEntriesCount") {
        const count = await storage.getEntryCount();
        return res.json({ message: { count } });
      }
      if (action === "GetWordsCount") {
        const count = Math.floor(Math.random() * 1e5) + 1;
        return res.json({ message: { count } });
      }
      if (action === "GetEntryDate") {
        const dates = await storage.getEntryDate();
        return res.json({ message: { entryDates: dates } });
      }
      return res.status(400).json({ message: "Unknown Action" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/entry/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const entries2 = await storage.searchEntries(query);
      res.json(entries2);
    } catch (error) {
      res.status(500).json({ message: "Failed to search entries" });
    }
  });
  app2.post("/api/upload", upload.array("photos", 10), (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const filePaths = req.files.map((file) => `/api/m/${file.filename}`);
      res.json({ photos: filePaths });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });
  app2.post("/api/media", async (req, res) => {
    const action = req.query.Action;
    try {
      if (action === "DeleteMedia") {
        const { ids } = req.body;
        ids.forEach((url) => {
          const filePath = path.join("uploads", url);
          fs2.unlink(filePath, (err) => {
            if (err) {
              console.error(`Failed to delete file ${filePath}:`, err);
            }
          });
        });
        return res.json({ ids });
      }
      return res.status(400).json({ message: "Unknown Action" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.use("/api/m", express.static("uploads"));
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} Action=${req.query.Action} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
