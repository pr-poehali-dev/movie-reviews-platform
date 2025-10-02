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
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

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
              <Icon name="Film" size={32} className="text-primary" />
              <h1 className="text-2xl font-black tracking-tight">CINEMA</h1>
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
          <Card className="bg-card border-border mb-8 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Badge className="mb-4 bg-primary/20 border-primary text-primary hover:bg-primary/30">
                  Подборка
                </Badge>
                <h1 className="text-4xl font-black mb-3">{playlist.title}</h1>
                {playlist.description && (
                  <p className="text-lg text-foreground/70 mb-4">{playlist.description}</p>
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
            <h3 className="text-2xl font-bold mb-6">Фильмы в подборке</h3>

            {movies.length === 0 ? (
              <Card className="bg-card border-border p-12 text-center">
                <Icon name="Film" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-xl font-bold mb-2">В подборке пока нет фильмов</h4>
                {isOwner ? (
                  <p className="text-foreground/60">
                    Перейдите к рецензиям и добавьте фильмы в подборку
                  </p>
                ) : (
                  <p className="text-foreground/60">
                    Автор ещё не добавил фильмы в эту подборку
                  </p>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map((movie) => (
                  <Card
                    key={movie.id}
                    className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={movie.movie_image}
                        alt={movie.movie_title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                          {renderStars(movie.movie_rating)}
                        </div>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{movie.movie_title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {movie.movie_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => navigate(`/review/${movie.movie_id}`)}
                      >
                        <Icon name="Eye" size={16} />
                        Смотреть
                      </Button>
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-white"
                          onClick={() => handleRemoveMovie(movie.movie_id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
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
