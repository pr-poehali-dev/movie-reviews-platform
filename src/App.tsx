
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Review from "./pages/Review";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Playlists from "./pages/Playlists";
import CreatePlaylist from "./pages/CreatePlaylist";
import PlaylistDetail from "./pages/PlaylistDetail";
import Moderation from "./pages/Moderation";
import Reviews from "./pages/Reviews";
import Collections from "./pages/Collections";
import NewReleases from "./pages/NewReleases";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/review/:id" element={<Review />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/create-playlist" element={<CreatePlaylist />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />
          <Route path="/moderation" element={<Moderation />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/new-releases" element={<NewReleases />} />
          <Route path="/blog" element={<Blog />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;