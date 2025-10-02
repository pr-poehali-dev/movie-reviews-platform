import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { authService, collectionsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import WriteReview from '@/components/WriteReview';
import ReviewsList from '@/components/ReviewsList';

const Movie = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const movieData: Record<string, any> = {
    '1': {
      title: 'Битва за битвой',
      titleEn: 'One Battle After Another',
      genre: 'Боевик, Триллер, Драма, Криминал',
      rating: 7.5,
      year: 2025,
      director: 'Пол Томас Андерсон',
      country: 'США',
      budget: '$130 000 000',
      duration: '180 мин',
      releaseDate: '25 сентября 2025',
      image: 'https://cdn.poehali.dev/files/16ffbc60-c6ea-46ae-9a24-55cb683daade.jpg',
      cover: 'https://cdn.poehali.dev/files/fe887040-31f7-40a7-9475-80446b215f6e.jpeg',
      tagline: 'Победить невозможно, но важно не сдаться',
      description: 'В молодости Боб Фергюсон вместе с женой состоял в группировке революционеров. Спустя 16 лет в его дом врывается давний противник полковник Локджо. Чтобы спасти дочь, Боб вынужден обратиться за помощью к своим бывшим соратникам.',
      plot: 'Социальная драма в оболочке боевика, где каждый выстрел звучит как метафора неравенства, страха и одиночества. Леонардо Ди Каприо в роли обыкновенного человека создаёт один из самых сильных образов в своей карьере — не лидер, не спаситель, не мститель, а простой отец, который делает ошибки, боится, теряет контроль, но продолжает бороться за свою семью.',
      cast: [
        'Леонардо ДиКаприо',
        'Шон Пенн',
        'Чейз Инфинити',
        'Бенисио Дель Торо',
        'Тейяна Тейлор',
        'Реджина Холл',
        'Джеймс Рэйтерман',
        'Тони Голдуин',
        'Карлос Макфарланд',
        'Джон Хугенэккер',
      ],
    },
  };

  const movie = movieData[id || '1'] || movieData['1'];

  const renderStars = (rating: number) => {
    const normalizedRating = Math.max(0, Math.min(10, rating));
    const scaledRating = (normalizedRating / 10) * 5;
    const fullStars = Math.floor(scaledRating);
    const hasHalfStar = scaledRating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`full-${i}`} name="Star" size={24} className="fill-primary text-primary" />
        ))}
        {hasHalfStar && <Icon name="StarHalf" size={24} className="fill-primary text-primary" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon key={`empty-${i}`} name="Star" size={24} className="text-muted-foreground" />
        ))}
      </div>
    );
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
            
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={18} />
              Назад
            </Button>
          </div>
        </div>
      </nav>

      <div 
        className="relative h-[500px] flex items-end"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(26,26,26,1)), url('${movie.cover || movie.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl animate-fade-in">
            <Badge className="mb-4 bg-primary/20 border-primary text-primary hover:bg-primary/30">
              {movie.genre}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tight">
              {movie.title}
            </h1>
            <p className="text-xl text-foreground/50 mb-4">
              {movie.titleEn}
            </p>
            <p className="text-xl text-foreground/70 italic mb-6">
              "{movie.tagline}"
            </p>
            <div className="flex flex-wrap gap-6 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                <span>{movie.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} />
                <span>{movie.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="User" size={16} />
                <span>Режиссёр: {movie.director}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={16} />
                <span>{movie.country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border mb-8 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-border">
              <div>
                <h3 className="text-sm text-foreground/60 mb-2">Рейтинг KINOVKUS</h3>
                <div className="flex items-center gap-4">
                  {renderStars(movie.rating)}
                  <span className="text-4xl font-bold">{movie.rating}</span>
                  <span className="text-foreground/60">из 10</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  className="gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => setTrailerOpen(true)}
                >
                  <Icon name="Play" size={18} />
                  Смотреть трейлер
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  disabled={isSaving || !authService.isAuthenticated()}
                  onClick={async () => {
                    if (!authService.isAuthenticated()) {
                      navigate('/login');
                      return;
                    }
                    setIsSaving(true);
                    try {
                      await collectionsService.addToCollection({
                        id: parseInt(id || '1'),
                        title: movie.title,
                        genre: movie.genre,
                        rating: movie.rating,
                        image: movie.image,
                        description: movie.description,
                      });
                      toast({
                        title: 'Успешно',
                        description: 'Фильм добавлен в коллекцию',
                      });
                    } catch (error: any) {
                      toast({
                        title: 'Ошибка',
                        description: error.message,
                        variant: 'destructive',
                      });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  {isSaving ? (
                    <Icon name="Loader2" size={18} className="animate-spin" />
                  ) : (
                    <Icon name="Bookmark" size={18} />
                  )}
                  {authService.isAuthenticated() ? 'Сохранить' : 'Войдите, чтобы сохранить'}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Icon name="Share2" size={18} />
                  Поделиться
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">О фильме</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  {movie.description}
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  {movie.plot}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Icon name="Info" size={20} className="text-primary" />
                    Информация
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Год выпуска:</span>
                      <span className="font-medium">{movie.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Страна:</span>
                      <span className="font-medium">{movie.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Режиссёр:</span>
                      <span className="font-medium">{movie.director}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Бюджет:</span>
                      <span className="font-medium">{movie.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Премьера:</span>
                      <span className="font-medium">{movie.releaseDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Icon name="Users" size={20} className="text-primary" />
                    В главных ролях
                  </h3>
                  <div className="space-y-1 text-sm">
                    {movie.cast.slice(0, 6).map((actor: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Icon name="Star" size={12} className="text-primary flex-shrink-0" />
                        <span className="text-foreground/80">{actor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Рецензии</h3>
              {authService.isAuthenticated() && (
                <WriteReview
                  movieId={parseInt(id || '1')}
                  movieTitle={movie.title}
                  movieImage={movie.image}
                  onReviewAdded={() => setReviewsKey(prev => prev + 1)}
                />
              )}
            </div>
            <ReviewsList key={reviewsKey} movieId={parseInt(id || '1')} />
          </div>
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
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/4jzU6LT7vA4?autoplay=1"
              title="Трейлер фильма"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Movie;