import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { useEditor } from '@/contexts/EditorContext';
import { Document } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function DocumentList() {
  const [, navigate] = useLocation();
  const { loadDocument, createNewDocument } = useEditor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load documents and templates
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        
        // Fetch documents
        const docsResponse = await apiRequest('GET', '/api/documents?isTemplate=false', undefined);
        const docsData = await docsResponse.json();
        setDocuments(docsData);
        
        // Fetch templates
        const templatesResponse = await apiRequest('GET', '/api/documents?isTemplate=true', undefined);
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load documents and templates.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);

  // Handle document selection
  const handleSelectDocument = async (id: string) => {
    try {
      await loadDocument(id);
      navigate('/');
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to load the selected document.',
        variant: 'destructive'
      });
    }
  };

  // Handle creating a new document
  const handleNewDocument = () => {
    createNewDocument();
    navigate('/');
  };

  // Handle document deletion
  const handleDeleteDocument = async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/documents/${id}`, undefined);
      
      // Update the lists
      setDocuments(docs => docs.filter(doc => doc.id !== id));
      setTemplates(temps => temps.filter(temp => temp.id !== id));
      
      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the document.',
        variant: 'destructive'
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">قائمة المستندات</CardTitle>
            <Button onClick={handleNewDocument}>
              إنشاء مستند جديد
            </Button>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="documents">المستندات</TabsTrigger>
                <TabsTrigger value="templates">النماذج</TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents">
                {isLoading ? (
                  <div className="text-center py-8">جاري التحميل...</div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">لا توجد مستندات</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">العنوان</TableHead>
                          <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                          <TableHead className="text-right">آخر تحديث</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.title}</TableCell>
                            <TableCell>{formatDate(doc.createdAt)}</TableCell>
                            <TableCell>{formatDate(doc.updatedAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSelectDocument(doc.id)}
                                >
                                  فتح
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                >
                                  حذف
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="templates">
                {isLoading ? (
                  <div className="text-center py-8">جاري التحميل...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8">لا توجد نماذج</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">العنوان</TableHead>
                          <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                          <TableHead className="text-right">آخر تحديث</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">
                              {template.title}
                              <Badge className="mr-2" variant="outline">نموذج</Badge>
                            </TableCell>
                            <TableCell>{formatDate(template.createdAt)}</TableCell>
                            <TableCell>{formatDate(template.updatedAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSelectDocument(template.id)}
                                >
                                  فتح
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteDocument(template.id)}
                                >
                                  حذف
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
