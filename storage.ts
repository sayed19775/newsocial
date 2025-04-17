import { 
  User, InsertUser, 
  Document, InsertDocument,
  FinancialRecord, InsertFinancialRecord,
  Media, InsertMedia
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocuments(isTemplate?: boolean): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Financial record methods
  getFinancialRecord(id: number): Promise<FinancialRecord | undefined>;
  getFinancialRecordsByDocument(documentId: number): Promise<FinancialRecord[]>;
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  updateFinancialRecord(id: number, record: Partial<FinancialRecord>): Promise<FinancialRecord | undefined>;
  
  // Media methods
  getMedia(id: number): Promise<Media | undefined>;
  getMediaByDocument(documentId: number): Promise<Media[]>;
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private financialRecords: Map<number, FinancialRecord>;
  private media: Map<number, Media>;
  private userId: number;
  private documentId: number;
  private financialRecordId: number;
  private mediaId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.financialRecords = new Map();
    this.media = new Map();
    this.userId = 1;
    this.documentId = 1;
    this.financialRecordId = 1;
    this.mediaId = 1;
    
    // Add a default user
    this.createUser({
      username: 'admin',
      password: 'password'
    });
    
    // Add some sample documents
    this.createDocument({
      title: 'نموذج طلب',
      content: '<div dir="rtl" class="times-new-roman" style="font-size: 14px;"><h2 style="text-align: center; font-weight: bold; margin-bottom: 20px;">نموذج طلب</h2><p>مرحبًا بكم في محرر المستندات. هذا المحرر يسمح لك بإنشاء وتحرير نماذج المستندات بسهولة.</p><p>يمكنك إدخال النص باللغة العربية <span dir="ltr" style="font-weight: normal;">or English text</span> مع دعم كامل للاتجاهين.</p></div>',
      isTemplate: true,
      userId: 1
    });
    
    this.createDocument({
      title: 'مستند جديد',
      content: '<div dir="rtl" class="times-new-roman" style="font-size: 14px;"></div>',
      isTemplate: false,
      userId: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id 
    };
    this.users.set(id, user);
    return user;
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocuments(isTemplate?: boolean): Promise<Document[]> {
    const docs = Array.from(this.documents.values());
    if (isTemplate !== undefined) {
      return docs.filter(doc => doc.isTemplate === isTemplate);
    }
    return docs;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;

    const updatedDocument: Document = {
      ...existingDocument,
      ...document,
      updatedAt: new Date()
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Financial record methods
  async getFinancialRecord(id: number): Promise<FinancialRecord | undefined> {
    return this.financialRecords.get(id);
  }

  async getFinancialRecordsByDocument(documentId: number): Promise<FinancialRecord[]> {
    return Array.from(this.financialRecords.values())
      .filter(record => record.documentId === documentId);
  }

  async createFinancialRecord(insertRecord: InsertFinancialRecord): Promise<FinancialRecord> {
    const id = this.financialRecordId++;
    const now = new Date();
    const record: FinancialRecord = {
      ...insertRecord,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.financialRecords.set(id, record);
    return record;
  }

  async updateFinancialRecord(id: number, record: Partial<FinancialRecord>): Promise<FinancialRecord | undefined> {
    const existingRecord = this.financialRecords.get(id);
    if (!existingRecord) return undefined;

    const updatedRecord: FinancialRecord = {
      ...existingRecord,
      ...record,
      updatedAt: new Date()
    };
    this.financialRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  // Media methods
  async getMedia(id: number): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async getMediaByDocument(documentId: number): Promise<Media[]> {
    return Array.from(this.media.values())
      .filter(media => media.documentId === documentId);
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.mediaId++;
    const now = new Date();
    const media: Media = {
      ...insertMedia,
      id,
      createdAt: now
    };
    this.media.set(id, media);
    return media;
  }

  async deleteMedia(id: number): Promise<boolean> {
    return this.media.delete(id);
  }
}

// Create the storage instance
export const storage = new MemStorage();
