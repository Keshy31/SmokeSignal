import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Safety from "@/pages/safety";
import { useEffect } from "react";
import { registerServiceWorker } from "./lib/api";
import Navbar from "@/components/Navbar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/safety" component={Safety} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Register service worker for offline capabilities
    registerServiceWorker();
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Navbar />
      <div> {/* Remove padding since map will flow under navbar */}
        <Router />
      </div>
    </TooltipProvider>
  );
}

export default App;
