import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { authService, playlistsService } from '@/lib/auth';

const Playlists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    loadPlaylists();
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
              {isAuthenticated && (
                <Button
                  onClick={() => navigate('/create-playlist')}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Icon name="Plus" size={18} />
                  Создать подборку
                </Button>
              )}
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
              <p className="text-foreground/60 mb-6">
                Станьте первым, кто создаст интересную подборку
              </p>
              {isAuthenticated && (
                <Button
                  onClick={() => navigate('/create-playlist')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Создать подборку
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="group bg-card border-border hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  {playlist.cover_image_url && (
                    <div className="w-full h-48 overflow-hidden bg-muted">
                      <img
                        src={playlist.cover_image_url}
                        alt={playlist.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Icon name="List" size={24} className="text-primary" />
                      <div className="flex items-center gap-1 text-sm text-foreground/60">
                        <Icon name="Film" size={14} />
                        <span>{playlist.movies_count || 0}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {playlist.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {playlist.description || 'Без описания'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <Icon name="User" size={14} />
                      <span>{playlist.author_name || 'Аноним'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlists;