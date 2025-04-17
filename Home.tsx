import { useEffect } from 'react';
import Header from '@/components/Header';
import Toolbar from '@/components/Toolbar';
import DocumentEditor from '@/components/editor/DocumentEditor';
import { useEditor } from '@/contexts/EditorContext';
import { useDocument } from '@/contexts/DocumentContext';

export default function Home() {
  const { state, createNewDocument } = useEditor();
  const { isDirty } = useDocument();
  
  // Create a new document if there is none
  useEffect(() => {
    if (!state.currentDocument) {
      createNewDocument();
    }
  }, [state.currentDocument, createNewDocument]);
  
  // Handle beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.documentChanged || isDirty) {
        const message = 'لديك تغييرات غير محفوظة. هل تريد المغادرة بالفعل؟';
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.documentChanged, isDirty]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:rtl">
          <Toolbar />
          <DocumentEditor />
        </div>
      </main>
    </div>
  );
}
