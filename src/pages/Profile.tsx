import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { authService, collectionsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(authService.getUser());
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadCollections();
  }, [navigate]);

  const loadCollections = async () => {
    try {
      const data = await collectionsService.getCollections();
      setCollections(data);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast({
      title: 'Вы вышли из аккаунта',
    });
    navigate('/');
  };

  const handleRemoveFromCollection = async (movieId: number) => {
    try {
      await collectionsService.removeFromCollection(movieId);
      setCollections(collections.filter((c) => c.movie_id !== movieId));
      toast({
        title: 'Успешно',
        description: 'Фильм удалён из коллекции',
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

            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground/60">
                {user?.username}
              </span>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <Icon name="LogOut" size={16} />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">Мой профиль</h2>
            <p className="text-foreground/60">
              Управляйте своими коллекциями и избранными фильмами
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">{user?.email}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Имя пользователя</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">{user?.username}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Сохранено фильмов</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{collections.length}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Моя коллекция</h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={48} className="animate-spin text-primary" />
              </div>
            ) : collections.length === 0 ? (
              <Card className="bg-card border-border p-12 text-center">
                <Icon name="Film" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-xl font-bold mb-2">Коллекция пуста</h4>
                <p className="text-foreground/60 mb-6">
                  Начните добавлять фильмы в свою коллекцию
                </p>
                <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
                  Перейти к фильмам
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <Card
                    key={collection.id}
                    className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={collection.movie_image}
                        alt={collection.movie_title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                          {renderStars(collection.movie_rating)}
                        </div>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{collection.movie_title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {collection.movie_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => navigate(`/review/${collection.movie_id}`)}
                      >
                        <Icon name="Eye" size={16} />
                        Смотреть
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleRemoveFromCollection(collection.movie_id)}
                      >
                        <Icon name="Trash2" size={16} />
                        Удалить
                      </Button>
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

export default Profile;
