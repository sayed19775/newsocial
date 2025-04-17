import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Document } from '@shared/schema';
import TopNavbar from '@/components/layout/TopNavbar';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Calendar, FileEdit, FolderOpen, File, 
  Trash2, Search, Plus, Settings, Filter
} from 'lucide-react';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('documents');

  // Fetch documents
  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/templates'],
  });

  // Create new document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async () => {
      const emptyDocument = {
        userId: 1, // For now, hardcode user ID
        title: 'مستند جديد',
        content: {
          blocks: [],
          direction: 'rtl',
          title: 'مستند جديد',
        },
        documentType: 'document',
        direction: 'rtl',
        tags: [],
      };
      const response = await apiRequest('POST', '/api/documents', emptyDocument);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      navigate(`/editor/${data.id}`);
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل إنشاء مستند جديد',
        variant: 'destructive',
      });
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest('DELETE', `/api/documents/${documentId}`);
      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المستند بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل حذف المستند',
        variant: 'destructive',
      });
    }
  });

  // Create new document handler
  const handleCreateDocument = () => {
    createDocumentMutation.mutate();
  };

  // Delete document handler
  const handleDeleteDocument = (documentId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المستند؟')) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  // Filter documents/templates by search term
  const filteredDocuments = documents ? (documents as Document[]).filter(
    doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredTemplates = templates ? (templates as any[]).filter(
    template => template.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="flex h-screen flex-col">
      <TopNavbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">لوحة التحكم</h1>
              
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="بحث عن المستندات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-4 pl-10"
                  />
                </div>
                
                <Button onClick={handleCreateDocument} className="flex items-center gap-2">
                  <Plus size={18} />
                  <span>مستند جديد</span>
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="documents" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>المستندات</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FileEdit size={16} />
                  <span>القوالب</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="bg-white dark:bg-gray-800 opacity-70 animate-pulse">
                        <CardHeader className="h-16" />
                        <CardContent className="h-20" />
                        <CardFooter className="h-12" />
                      </Card>
                    ))}
                  </div>
                ) : isError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">حدث خطأ أثناء تحميل المستندات</p>
                    <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/documents'] })}>
                      إعادة المحاولة
                    </Button>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <File className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">لا توجد مستندات</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      ابدأ بإنشاء مستند جديد للبدء في العمل
                    </p>
                    <Button className="mt-6" onClick={handleCreateDocument}>
                      إنشاء مستند جديد
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredDocuments.map((document) => (
                      <Card 
                        key={document.id} 
                        className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/editor/${document.id}`)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex justify-between items-start">
                            <span className="truncate">{document.title}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500 hover:text-red-500"
                              onClick={(e) => handleDeleteDocument(document.id, e)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            آخر تعديل: {new Date(document.updatedAt).toLocaleDateString('ar-SA')}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
                            {document.documentType === 'document' ? 'مستند' : 'قالب'}
                          </span>
                          <span className="text-xs">
                            {document.direction === 'rtl' ? 'RTL' : 'LTR'}
                          </span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="templates">
                {templatesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="bg-white dark:bg-gray-800 opacity-70 animate-pulse">
                        <CardHeader className="h-16" />
                        <CardContent className="h-20" />
                        <CardFooter className="h-12" />
                      </Card>
                    ))}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileEdit className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">لا توجد قوالب</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      يمكنك حفظ المستندات كقوالب لإعادة استخدامها
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                      <Card key={template.id} className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex justify-between items-start">
                            <span className="truncate">{template.name}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {template.description || 'لا يوجد وصف'}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-full">
                            {template.category || 'بدون تصنيف'}
                          </span>
                          <span className="text-xs">
                            {template.isPublic ? 'عام' : 'خاص'}
                          </span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
