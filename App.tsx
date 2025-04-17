import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import DocumentList from "@/pages/DocumentList";
import NotFound from "@/pages/not-found";
import { EditorProvider } from "./contexts/EditorContext";
import { DocumentProvider } from "./contexts/DocumentContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/documents" component={DocumentList} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditorProvider>
        <DocumentProvider>
          <Router />
          <Toaster />
        </DocumentProvider>
      </EditorProvider>
    </QueryClientProvider>
  );
}

export default App;
