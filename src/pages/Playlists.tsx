import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { authService, playlistsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Playlists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [savedPlaylistIds, setSavedPlaylistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
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
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/img/ea64283c-a994-41e0-a44f-e4de01bdb91b.jpg" alt="KINOVKUS.RU" className="h-10 w-10 rounded-lg object-cover" />
              <h1 className="text-2xl font-black tracking-tight">KINOVKUS.RU</h1>
            </button>

            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
                <Icon name="ArrowLeft" size={16} />
                Назад
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">Подборки фильмов</h2>
            <p className="text-foreground/60">
              Тематические списки от пользователей сообщества
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="animate-spin text-primary" />
            </div>
          ) : playlists.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <Icon name="List" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-xl font-bold mb-2">Подборок пока нет</h4>
              <p className="text-foreground/60">
                Скоро здесь появятся интересные тематические подборки!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3">
                    {playlist.cover_image_url ? (
                      <img
                        src={playlist.cover_image_url}
                        alt={playlist.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Icon name="Film" size={48} className="text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
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
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-2">
                    {playlist.title}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlists;