import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import HostRoom from "./pages/HostRoom";
import PlayerRoom from "./pages/PlayerRoom";
import QuestionBank from "./pages/QuestionBank";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/question-bank"} component={QuestionBank} />
      <Route path={"/room/:code/host"} component={HostRoom} />
      <Route path={"/room/:code/player/:playerId"} component={PlayerRoom} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
