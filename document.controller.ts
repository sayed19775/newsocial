import { Request, Response } from 'express';
import { storage } from '../storage';
import { Document, InsertDocument } from '@shared/schema';
import path from 'path';
import fs from 'fs';
import { sanitizeContent } from '../../client/src/lib/utils';

// Get all documents
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const isTemplate = req.query.isTemplate === 'true' ? true : 
                      req.query.isTemplate === 'false' ? false : undefined;
    
    const documents = await storage.getDocuments(isTemplate);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

// Get a single document by ID
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid document ID' });
    }
    
    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
};

// Create a new document
export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, content, isTemplate } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    // Sanitize content
    const sanitizedContent = sanitizeContent(content);
    
    const document: InsertDocument = {
      title,
      content: sanitizedContent,
      isTemplate: !!isTemplate,
      userId: 1 // TODO: Get from authenticated user
    };
    
    const newDocument = await storage.createDocument(document);
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Failed to create document' });
  }
};

// Update an existing document
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid document ID' });
    }
    
    const { title, content, isTemplate } = req.body;
    
    // Check if document exists
    const existingDocument = await storage.getDocument(id);
    if (!existingDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Sanitize content
    const sanitizedContent = content ? sanitizeContent(content) : undefined;
    
    // Prepare update data
    const updateData: Partial<Document> = {};
    if (title !== undefined) updateData.title = title;
    if (sanitizedContent !== undefined) updateData.content = sanitizedContent;
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
    
    const updatedDocument = await storage.updateDocument(id, updateData);
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
};

// Delete a document
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid document ID' });
    }
    
    // Check if document exists
    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    await storage.deleteDocument(id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
};

// Export document
export const exportDocument = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const format = req.query.format as string;
    const tempExport = req.path.includes('/temp/export');
    
    if (!tempExport && isNaN(id)) {
      return res.status(400).json({ message: 'Invalid document ID' });
    }
    
    if (!['word', 'excel', 'pdf'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format' });
    }
    
    // For temporary export (content passed directly)
    let documentTitle = 'Document';
    let documentContent = '';
    
    if (tempExport) {
      // Use data from request body
      documentTitle = req.body.title || 'Untitled';
      documentContent = req.body.content || '';
    } else {
      // Get the document from storage
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      documentTitle = document.title;
      documentContent = document.content;
    }
    
    // Set the appropriate headers for the response
    res.setHeader('Content-Disposition', `attachment; filename=${documentTitle}.${format}`);
    
    // Create HTML content with proper styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${documentTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; }
          h1 { text-align: center; }
          .rtl { direction: rtl; }
        </style>
      </head>
      <body>
        <h1>${documentTitle}</h1>
        <div>${documentContent}</div>
      </body>
      </html>
    `;
    
    switch (format) {
      case 'word':
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(htmlContent);
        break;
      case 'excel':
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(htmlContent);
        break;
      case 'pdf':
        res.setHeader('Content-Type', 'application/pdf');
        res.send(htmlContent);
        break;
    }
  } catch (error) {
    console.error('Error exporting document:', error);
    res.status(500).json({ message: 'Failed to export document' });
  }
};

// Import document
export const importDocument = async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual file parsing
    // For now, just return a sample response
    res.json({
      title: 'Imported Document',
      content: '<div dir="rtl" class="times-new-roman" style="font-size: 14px;"><p>محتوى تم استيراده</p></div>'
    });
  } catch (error) {
    console.error('Error importing document:', error);
    res.status(500).json({ message: 'Failed to import document' });
  }
};

// Upload image
export const uploadImage = async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual image upload
    // For now, just return a sample response
    res.json({
      url: 'https://via.placeholder.com/300x200',
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};
