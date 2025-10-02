import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { authService, collectionsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NewReleases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getUser();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [savingMovieId, setSavingMovieId] = useState<number | null>(null);

  const newMovies = [
    {
      id: 1,
      title: 'Битва за битвой',
      genre: 'Боевик',
      rating: 96,
      audienceScore: 85,
      releaseDate: 'Sep 26, 2025',
      image: 'https://cdn.poehali.dev/files/16ffbc60-c6ea-46ae-9a24-55cb683daade.jpg',
      trailer: '4jzU6LT7vA4',
      description: 'Социальная драма в оболочке боевика, где каждый выстрел звучит как метафора неравенства, страха и одиночества',
    },
    {
      id: 2,
      title: 'Weapons',
      genre: 'Триллер',
      rating: 94,
      audienceScore: 85,
      releaseDate: 'Aug 08, 2025',
      image: '/img/a030bd8e-790a-4777-8092-12bf26e2c53a.jpg',
      trailer: 'dQw4w9WgXcQ',
      description: 'Напряженный триллер о темных секретах городских улиц и тех, кто их охраняет',
    },
    {
      id: 3,
      title: 'HIM',
      genre: 'Драма',
      rating: 31,
      audienceScore: 58,
      releaseDate: 'Sep 19, 2025',
      image: '/img/639c671e-ec6a-4a70-9895-90545ed6d430.jpg',
      trailer: 'dQw4w9WgXcQ',
      description: 'Загадочная история о человеке, чье прошлое начинает настигать его в самый неожиданный момент',
    },
    {
      id: 4,
      title: 'The Long Walk',
      genre: 'Драма',
      rating: 88,
      audienceScore: 85,
      releaseDate: 'Sep 12, 2025',
      image: '/img/5bda8a98-b85d-4290-a199-8883a7504d51.jpg',
      trailer: 'dQw4w9WgXcQ',
      description: 'Путешествие на грани возможного, где каждый шаг может стать последним',
    },
    {
      id: 5,
      title: 'The Smashing Machine',
      genre: 'Спорт',
      rating: 73,
      audienceScore: 0,
      releaseDate: 'Oct 03, 2025',
      image: '/img/441bb56a-2863-4080-a510-eb1dd4305877.jpg',
      trailer: 'dQw4w9WgXcQ',
      description: 'Реальная история великого бойца и его путь к славе через боль и преодоление',
    },
    {
      id: 6,
      title: 'The Strangers: Chapter 2',
      genre: 'Хоррор',
      rating: 17,
      audienceScore: 57,
      releaseDate: 'Sep 26, 2025',
      image: '/img/40151755-e4e4-4232-9eaa-9da5ffdaad58.jpg',
      trailer: 'dQw4w9WgXcQ',
      description: 'Продолжение kultового хоррора о незнакомцах, которые превращают ночь в кошмар',
    },
  ];

  const handleSaveMovie = async (e: React.MouseEvent, movie: any) => {
    e.stopPropagation();
    
    if (!authService.isAuthenticated()) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы сохранять фильмы',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setSavingMovieId(movie.id);
    try {
      await collectionsService.addToCollection({
        id: movie.id,
        title: movie.title,
        genre: movie.genre,
        rating: movie.rating / 10,
        image: movie.image,
        description: movie.description,
      });
      toast({
        title: 'Сохранено',
        description: 'Фильм добавлен в вашу коллекцию',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSavingMovieId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Новинки кино
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Свежие релизы и долгожданные премьеры 2025 года
            </p>
          </div>

          {newMovies.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <Icon name="Film" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-xl font-bold mb-2">Пока нет новинок</h4>
              <p className="text-foreground/60">Скоро здесь появятся свежие релизы!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {newMovies.map((movie) => (
                <div key={movie.id} className="group relative">
                  <div 
                    className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer bg-card border border-border hover:border-primary/50 transition-all"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMovie(movie);
                          setTrailerOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xl">
                          <Icon name="Play" size={28} className="text-black ml-1" />
                        </div>
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-2">
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Icon name="TrendingUp" size={12} />
                        {movie.rating}%
                      </div>
                      <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Icon name="Users" size={12} />
                        {movie.audienceScore}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 
                      className="font-bold text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                      {movie.title}
                    </h3>
                    <p className="text-xs text-foreground/60">Opened {movie.releaseDate}</p>
                    <button 
                      onClick={(e) => handleSaveMovie(e, movie)}
                      disabled={savingMovieId === movie.id}
                      className="w-full mt-2 px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-card transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {savingMovieId === movie.id ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Plus" size={14} />
                      )}
                      Сохранить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <div className="relative aspect-video">
            <button
              onClick={() => setTrailerOpen(false)}
              className="absolute -top-12 right-0 z-50 text-white hover:text-primary transition-colors"
            >
              <Icon name="X" size={32} />
            </button>
            {selectedMovie && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedMovie.trailer}?autoplay=1`}
                title="Трейлер фильма"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default NewReleases;