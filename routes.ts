import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  exportDocument,
  importDocument,
  uploadImage
} from "./controllers/document.controller";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Document routes
  app.get('/api/documents', getDocuments);
  app.get('/api/documents/:id', getDocumentById);
  app.post('/api/documents', createDocument);
  app.put('/api/documents/:id', updateDocument);
  app.delete('/api/documents/:id', deleteDocument);
  app.get('/api/documents/:id/export', exportDocument);
  app.post('/api/documents/temp/export', exportDocument);
  app.post('/api/documents/import', importDocument);
  
  // Media routes
  app.post('/api/upload/image', uploadImage);

  return httpServer;
}
