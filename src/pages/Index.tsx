import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import Notifications from '@/components/Notifications';
import { authService, playlistsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('Главная');
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [savedPlaylistIds, setSavedPlaylistIds] = useState<Set<number>>(new Set());
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const isAuthenticated = authService.isAuthenticated();

  const navItems = ['Главная', 'Рецензии', 'Подборки', 'Новинки', 'Блог'];

  useEffect(() => {
    loadPlaylists();
    if (isAuthenticated) {
      loadSavedPlaylists();
    }
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await playlistsService.getPublicPlaylists();
      setPlaylists(data.slice(0, 2));
    } catch (error) {
      console.error('Error loading playlists:', error);
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

  const featuredMovies = [
    {
      id: 1,
      title: 'Битва за битвой',
      genre: 'Боевик',
      rating: 8.7,
      image: '/img/08a4b6ca-8db2-40f6-bdb2-7207f8212a02.jpg',
      description: 'Взрывной боевик о непобедимом бойце, который сражается за справедливость',
      trailer: '4jzU6LT7vA4',
    },
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`full-${i}`} name="Star" size={16} className="fill-primary text-primary" />
        ))}
        {hasHalfStar && <Icon name="StarHalf" size={16} className="fill-primary text-primary" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon key={`empty-${i}`} name="Star" size={16} className="text-muted-foreground" />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/img/ea64283c-a994-41e0-a44f-e4de01bdb91b.jpg" alt="KINOVKUS.RU" className="h-10 w-10 rounded-lg object-cover" />
              <h1 className="text-2xl font-black tracking-tight">KINOVKUS.RU</h1>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
              >
                Главная
              </button>
              <button
                onClick={() => navigate('/reviews')}
                className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
              >
                Рецензии
              </button>
              <button
                onClick={() => navigate('/collections')}
                className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
              >
                Подборки
              </button>
              <button
                onClick={() => navigate('/new-releases')}
                className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
              >
                Новинки
              </button>
              <button
                onClick={() => navigate('/blog')}
                className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
              >
                Блог
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Поиск фильмов..." 
                  className="pl-10 w-64 bg-card border-border"
                />
              </div>
              {authService.isAuthenticated() && <Notifications />}
              {authService.isAdmin() && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/moderation')}
                  className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Icon name="ShieldCheck" size={18} />
                  <span className="hidden md:inline">Модерация</span>
                </Button>
              )}
              {authService.isAuthenticated() ? (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="gap-2"
                >
                  <Icon name="User" size={18} />
                  <span className="hidden md:inline">Профиль</span>
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Icon name="LogIn" size={18} />
                  <span className="hidden md:inline">Войти</span>
                </Button>
              )}
              <Button size="icon" variant="ghost" className="md:hidden">
                <Icon name="Menu" size={24} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div 
        className="relative h-[600px] bg-gradient-to-b from-black via-black/80 to-background flex items-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(26,26,26,1)), url('/img/08a4b6ca-8db2-40f6-bdb2-7207f8212a02.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-block mb-4 px-3 py-1 bg-primary/20 border border-primary rounded-full">
              <span className="text-primary text-sm font-medium">Рецензия дня</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
              Тёмные воды
            </h2>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              Атмосферный триллер о тайнах, скрытых в глубинах человеческой психики. 
              Режиссёр мастерски играет со светом и тенью, создавая незабываемый визуальный опыт.
            </p>
            <div className="flex gap-4 mb-6">
              {renderStars(4.5)}
              <span className="text-sm text-foreground/60">4.5 из 5</span>
            </div>
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={() => navigate('/review/1')}
              >
                <Icon name="BookOpen" size={20} />
                Читать рецензию
              </Button>
              <Button size="lg" variant="outline" className="border-border gap-2">
                <Icon name="Bookmark" size={20} />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold mb-2">Избранные рецензии</h3>
            <p className="text-foreground/60">Лучшие обзоры от наших экспертов</p>
          </div>
          <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
            Все рецензии
            <Icon name="ArrowRight" size={18} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMovies.map((movie) => (
            <Card 
              key={movie.id} 
              className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 animate-scale-in"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={movie.image} 
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute top-4 right-4">
                  <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Icon name="Star" size={14} className="fill-primary text-primary" />
                    <span className="text-sm font-bold">{movie.rating}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block px-3 py-1 bg-primary/20 backdrop-blur-sm border border-primary rounded-full text-xs font-medium text-primary">
                    {movie.genre}
                  </span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {movie.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {movie.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    className="flex-1 gap-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                    onClick={() => navigate(`/review/${movie.id}`)}
                  >
                    Читать
                    <Icon name="BookOpen" size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMovie(movie);
                      setTrailerOpen(true);
                    }}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon name="Play" size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMovie(movie);
                      setShareOpen(true);
                    }}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon name="Share2" size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-b from-background to-black/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">Тематические подборки</h3>
            <p className="text-foreground/60">Кураторские списки для любого настроения</p>
          </div>

          {playlists.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <Icon name="List" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-xl font-bold mb-2">Подборок пока нет</h4>
              <p className="text-foreground/60">
                Скоро здесь появятся интересные тематические подборки фильмов!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playlists.map((playlist) => (
                <Card 
                  key={playlist.id}
                  className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{playlist.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {playlist.description || 'Без описания'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {isAuthenticated && (
                          <button
                            onClick={(e) => handleToggleSave(e, playlist.id)}
                            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                          >
                            <Icon 
                              name="Heart" 
                              size={24} 
                              className={savedPlaylistIds.has(playlist.id) ? 'fill-red-500 text-red-500' : 'text-foreground/40'}
                            />
                          </button>
                        )}
                        <Icon name="List" size={24} className="text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-foreground/60">
                        <div className="flex items-center gap-1">
                          <Icon name="Film" size={14} />
                          <span>{playlist.movies_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="User" size={14} />
                          <span>{playlist.author_name || 'Аноним'}</span>
                        </div>
                      </div>
                      <Button 
                        className="gap-2 bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/playlist/${playlist.id}`);
                        }}
                      >
                        <Icon name="Play" size={16} />
                        Смотреть
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-black border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Film" size={28} className="text-primary" />
                <h3 className="text-xl font-black">KINOVKUS.RU</h3>
              </div>
              <p className="text-foreground/60 text-sm">
                Ваш гид в мире кино. Обзоры, рецензии и подборки лучших фильмов.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Навигация</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                {navItems.map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Социальные сети</h4>
              <div className="flex gap-3">
                <Button size="icon" variant="outline" className="border-border hover:border-primary hover:text-primary">
                  <Icon name="Twitter" size={18} />
                </Button>
                <Button size="icon" variant="outline" className="border-border hover:border-primary hover:text-primary">
                  <Icon name="Instagram" size={18} />
                </Button>
                <Button size="icon" variant="outline" className="border-border hover:border-primary hover:text-primary">
                  <Icon name="Youtube" size={18} />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Подписка</h4>
              <p className="text-sm text-foreground/60 mb-3">
                Получайте новые рецензии на почту
              </p>
              <div className="flex gap-2">
                <Input placeholder="Email" className="bg-card border-border" />
                <Button className="bg-primary hover:bg-primary/90">
                  <Icon name="Send" size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-foreground/40">
            © 2024 Cinema Portal. Все права защищены.
          </div>
        </div>
      </footer>

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

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Поделиться фильмом</h2>
            <Button
              variant="outline"
              className="w-full gap-2 justify-center"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/movie/${selectedMovie?.id}`);
                toast({
                  title: 'Ссылка скопирована',
                  description: 'Ссылка на фильм скопирована в буфер обмена',
                });
              }}
            >
              <Icon name="Copy" size={20} />
              Скопировать ссылку
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => {
                  const url = encodeURIComponent(window.location.origin + `/movie/${selectedMovie?.id}`);
                  const text = encodeURIComponent(`${selectedMovie?.title} - ${selectedMovie?.description}`);
                  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                }}
              >
                <Icon name="Send" size={20} className="text-[#0088cc]" />
                Telegram
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => {
                  const url = encodeURIComponent(window.location.origin + `/movie/${selectedMovie?.id}`);
                  const title = encodeURIComponent(selectedMovie?.title || '');
                  window.open(`https://vk.com/share.php?url=${url}&title=${title}`, '_blank');
                }}
              >
                <Icon name="Share2" size={20} className="text-[#0077FF]" />
                VK
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => {
                  const url = encodeURIComponent(window.location.origin + `/movie/${selectedMovie?.id}`);
                  const text = encodeURIComponent(`${selectedMovie?.title} - ${selectedMovie?.description}`);
                  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                }}
              >
                <Icon name="MessageCircle" size={20} className="text-[#25D366]" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => {
                  const url = encodeURIComponent(window.location.origin + `/movie/${selectedMovie?.id}`);
                  const text = encodeURIComponent(selectedMovie?.title || '');
                  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                }}
              >
                <Icon name="Twitter" size={20} className="text-[#1DA1F2]" />
                Twitter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;