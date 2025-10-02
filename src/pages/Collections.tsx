import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { authService, playlistsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Collections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [savedPlaylistIds, setSavedPlaylistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    loadPlaylists();
    if (isAuthenticated) {
      loadSavedPlaylists();
    }
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await playlistsService.getPublicPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPlaylists = async () => {
    try {
      const saved = await playlistsService.getSavedPlaylists();
      setSavedPlaylistIds(new Set(saved.map((p: any) => p.playlist_id)));
    } catch (error) {
      console.error('Error loading saved playlists:', error);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent, playlistId: number) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы сохранять подборки',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      if (savedPlaylistIds.has(playlistId)) {
        await playlistsService.unsavePlaylist(playlistId);
        setSavedPlaylistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(playlistId);
          return newSet;
        });
        toast({
          title: 'Удалено',
          description: 'Подборка удалена из сохранённых',
        });
      } else {
        await playlistsService.savePlaylist(playlistId);
        setSavedPlaylistIds(prev => new Set(prev).add(playlistId));
        toast({
          title: 'Сохранено',
          description: 'Подборка добавлена в профиль',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Подборки фильмов
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Тематические коллекции от киноманов и редакции
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="animate-spin text-primary" />
            </div>
          ) : playlists.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <Icon name="List" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-xl font-bold mb-2">Пока нет подборок</h4>
              <p className="text-foreground/60">Скоро здесь появятся интересные подборки фильмов!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <Icon name="List" size={64} className="text-primary/40 group-hover:scale-110 transition-transform" />
                    {isAuthenticated && (
                      <button
                        onClick={(e) => handleToggleSave(e, playlist.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all z-10"
                      >
                        <Icon 
                          name="Heart" 
                          size={20} 
                          className={savedPlaylistIds.has(playlist.id) ? 'fill-red-500 text-red-500' : 'text-white'}
                        />
                      </button>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{playlist.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {playlist.description || 'Без описания'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-foreground/60">
                      <div className="flex items-center gap-1">
                        <Icon name="User" size={14} />
                        <span>{playlist.author_name || 'Аноним'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Film" size={14} />
                        <span>{playlist.movies_count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Collections;