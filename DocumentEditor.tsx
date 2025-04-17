import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { useDocument } from '@/contexts/DocumentContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import TopNavbar from '@/components/layout/TopNavbar';
import Sidebar from '@/components/layout/Sidebar';
import A4Page from '@/components/editor/A4Page';
import TableModal from '@/components/modals/TableModal';
import DropdownValuesModal from '@/components/modals/DropdownValuesModal';
import LocationModal from '@/components/modals/LocationModal';

export default function DocumentEditor() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const documentId = params.id ? parseInt(params.id) : null;
  
  const {
    documentState,
    setDocumentId,
    resetDocument,
    isDirty,
    setIsDirty,
  } = useDocument();
  
  // Modal state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isDropdownModalOpen, setIsDropdownModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  // Current cell state for dropdown modal
  const [currentTableId, setCurrentTableId] = useState('');
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentColIndex, setCurrentColIndex] = useState(0);
  
  // Fetch document from API if an ID is provided
  const { isLoading, isError } = useQuery({
    queryKey: ['/api/documents', documentId],
    enabled: documentId !== null,
    onSuccess: (data: any) => {
      if (data && data.content) {
        // Update document context with fetched document data
        resetDocument();
        setDocumentId(documentId);
        
        // If the content is a string, parse it
        const contentData = typeof data.content === 'string' 
          ? JSON.parse(data.content) 
          : data.content;
        
        // Validate document content against schema (can be enhanced later)
        if (contentData.blocks) {
          // Set document state
          // Note: This is simplified here, in a real app you would need to 
          // update each field individually to ensure state updates correctly
          Object.entries(contentData).forEach(([key, value]) => {
            if (key === 'title') {
              // Set document title
            }
            if (key === 'direction') {
              // Set document direction
            }
            if (key === 'blocks') {
              // Add all blocks one by one
            }
          });
          
          setIsDirty(false);
        }
      }
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المستند',
        variant: 'destructive',
      });
      navigate('/');
    }
  });
  
  // Save document mutation
  const saveDocumentMutation = useMutation({
    mutationFn: async () => {
      if (documentId) {
        // Update existing document
        const response = await apiRequest('PUT', `/api/documents/${documentId}`, {
          content: documentState,
        });
        return await response.json();
      } else {
        // Create new document
        const response = await apiRequest('POST', '/api/documents', {
          userId: 1, // For now, hardcode user ID
          title: documentState.title,
          content: documentState,
          documentType: 'document',
          direction: documentState.direction,
          tags: [],
        });
        return await response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      if (!documentId) {
        // If it was a new document, update URL with the new ID
        setDocumentId(data.id);
        navigate(`/editor/${data.id}`, { replace: true });
      }
      
      setIsDirty(false);
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ المستند بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل حفظ المستند',
        variant: 'destructive',
      });
    }
  });
  
  // Save document handler
  const handleSaveDocument = () => {
    saveDocumentMutation.mutate();
  };
  
  // Open table modal
  const handleOpenTableModal = () => {
    setIsTableModalOpen(true);
  };
  
  // Open dropdown modal for a specific cell
  const handleOpenDropdownModal = (tableId: string, rowIndex: number, colIndex: number) => {
    setCurrentTableId(tableId);
    setCurrentRowIndex(rowIndex);
    setCurrentColIndex(colIndex);
    setIsDropdownModalOpen(true);
  };
  
  // Open location modal
  const handleOpenLocationModal = () => {
    setIsLocationModalOpen(true);
  };
  
  // Reset document when unmounting to prevent stale state
  useEffect(() => {
    return () => {
      if (!isDirty) {
        resetDocument();
      }
    };
  }, [isDirty, resetDocument]);
  
  return (
    <div className="flex h-screen flex-col">
      <TopNavbar onSave={handleSaveDocument} isSaving={saveDocumentMutation.isPending} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onInsertTable={handleOpenTableModal}
          onInsertLocation={handleOpenLocationModal}
        />
        
        <main className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex justify-center p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="text-red-500 mb-4">فشل تحميل المستند</div>
              <button 
                className="px-4 py-2 bg-primary text-white rounded"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/documents', documentId] })}
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <A4Page 
              onOpenDropdownModal={handleOpenDropdownModal}
            />
          )}
        </main>
      </div>
      
      {/* Modals */}
      <TableModal 
        isOpen={isTableModalOpen} 
        onClose={() => setIsTableModalOpen(false)} 
      />
      
      <DropdownValuesModal 
        isOpen={isDropdownModalOpen} 
        onClose={() => setIsDropdownModalOpen(false)}
        tableId={currentTableId}
        rowIndex={currentRowIndex}
        colIndex={currentColIndex}
      />
      
      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
      />
    </div>
  );
}
