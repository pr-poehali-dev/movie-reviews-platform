import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { authService, playlistsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const PlaylistDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();
  const isOwner = user && playlist && user.id === playlist.user_id;

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const loadPlaylist = async () => {
    try {
      const data = await playlistsService.getPlaylist(parseInt(id || '0'));
      setPlaylist(data.playlist);
      setMovies(data.movies || []);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMovie = async (movieId: number) => {
    if (!isOwner) return;

    try {
      await playlistsService.removeMovieFromPlaylist(parseInt(id || '0'), movieId);
      setMovies(movies.filter((m) => m.movie_id !== movieId));
      toast({
        title: 'Успешно',
        description: 'Фильм удалён из подборки',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number) => {
    const normalizedRating = Math.min(Math.max(rating / 2, 0), 5);
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    const emptyStars = Math.max(5 - fullStars - (hasHalfStar ? 1 : 0), 0);

    return (
      <div className="flex gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`full-${i}`} name="Star" size={14} className="fill-primary text-primary" />
        ))}
        {hasHalfStar && <Icon name="StarHalf" size={14} className="fill-primary text-primary" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon key={`empty-${i}`} name="Star" size={14} className="text-muted-foreground" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

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

            <Button variant="ghost" onClick={() => navigate('/playlists')} className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              К подборкам
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {playlist.cover_image_url && (
            <div className="w-full h-80 rounded-xl overflow-hidden mb-8">
              <img
                src={playlist.cover_image_url}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <Card className="bg-card border-border mb-8 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary/20 border-primary text-primary hover:bg-primary/30">
                    Подборка
                  </Badge>
                  {playlist.is_approved && (
                    <Badge className="bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30 gap-1">
                      <Icon name="Check" size={12} />
                      Одобрено редакцией
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-black mb-3">{playlist.title}</h1>
                {playlist.description && (
                  <p className="text-lg text-foreground/70 mb-4">{playlist.description}</p>
                )}
                {playlist.is_approved && isOwner && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-start gap-2 text-sm text-green-400">
                      <Icon name="Info" size={16} className="mt-0.5" />
                      <span>Эта подборка одобрена редакцией и доступна всем пользователям. Редактирование и удаление невозможны.</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-foreground/60">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} />
                    <span>{playlist.author_name || 'Аноним'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Film" size={16} />
                    <span>{movies.length} фильмов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={16} />
                    <span>{new Date(playlist.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Фильмы в подборке</h3>
              {isOwner && !playlist.is_approved && (
                <Button
                  onClick={() => navigate(`/playlist/${id}/add-movie`)}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Icon name="Plus" size={16} />
                  Добавить фильм
                </Button>
              )}
            </div>

            {movies.length === 0 ? (
              <Card className="bg-card border-border p-12 text-center">
                <Icon name="Film" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-xl font-bold mb-2">В подборке пока нет фильмов</h4>
                {isOwner ? (
                  <>
                    <p className="text-foreground/60 mb-6">
                      Добавьте фильмы, чтобы наполнить вашу подборку
                    </p>
                    <Button
                      onClick={() => navigate(`/playlist/${id}/add-movie`)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Добавить первый фильм
                    </Button>
                  </>
                ) : (
                  <p className="text-foreground/60">
                    Автор ещё не добавил фильмы в эту подборку
                  </p>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <div key={movie.id} className="group">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                      {movie.movie_cover_url ? (
                        <img
                          src={movie.movie_cover_url}
                          alt={movie.movie_title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Icon name="Film" size={48} className="text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {isOwner && !playlist.is_approved && (
                        <button
                          onClick={() => handleRemoveMovie(movie.movie_id)}
                          className="absolute top-2 right-2 p-1.5 bg-destructive/90 hover:bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {movie.movie_title}
                    </h3>
                    {movie.movie_year && (
                      <p className="text-xs text-foreground/60 mt-1">{movie.movie_year}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;