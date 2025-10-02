import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { authService, collectionsService, playlistsService, User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import EditProfile from '@/components/EditProfile';
import ReviewsList from '@/components/ReviewsList';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [collections, setCollections] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadProfile();
    loadCollections();
    loadPlaylists();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const profileData = await authService.getProfile();
      setUser(profileData);
      authService.setUser(profileData);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

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

  const loadPlaylists = async () => {
    if (!user) return;
    try {
      const data = await playlistsService.getUserPlaylists(user.id);
      setPlaylists(data);
    } catch (error: any) {
      console.error('Error loading playlists:', error);
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
              <img src="/img/ea64283c-a994-41e0-a44f-e4de01bdb91b.jpg" alt="KINOVKUS.RU" className="h-10 w-10 rounded-lg object-cover" />
              <h1 className="text-2xl font-black tracking-tight">KINOVKUS.RU</h1>
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
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">Мой профиль</h2>
                <p className="text-foreground/60">
                  Управляйте своими коллекциями и избранными фильмами
                </p>
              </div>
              {user && <EditProfile user={user} onUpdate={handleProfileUpdate} />}
            </div>
          </div>

          <Card className="bg-card border-border mb-12">
            <CardContent className="p-8">
              {profileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={48} className="animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user?.avatar_url} alt={user?.username} />
                      <AvatarFallback className="text-4xl">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{user?.username}</h3>
                      {user?.status && (
                        <p className="text-foreground/60 italic">{user.status}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-foreground/60 mb-1">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      {user?.age && (
                        <div>
                          <p className="text-sm text-foreground/60 mb-1">Возраст</p>
                          <p className="font-medium">{user.age} лет</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-foreground/60 mb-1">Сохранено фильмов</p>
                        <p className="text-2xl font-bold text-primary">{collections.length}</p>
                      </div>
                    </div>

                    {user?.bio && (
                      <div>
                        <p className="text-sm text-foreground/60 mb-2">О себе</p>
                        <p className="text-foreground/80 whitespace-pre-wrap">{user.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Мои рецензии</h3>
            </div>
            <ReviewsList key={user?.id} userId={user?.id} />
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Мои подборки</h3>
              <Button 
                onClick={() => navigate('/create-playlist')}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Icon name="Plus" size={16} />
                Создать подборку
              </Button>
            </div>

            {playlists.length === 0 ? (
              <Card className="bg-card border-border p-8 text-center">
                <Icon name="List" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground/60">
                  У вас пока нет подборок. Создайте первую!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlists.map((playlist) => (
                  <Card 
                    key={playlist.id}
                    className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{playlist.title}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            {playlist.description || 'Без описания'}
                          </CardDescription>
                        </div>
                        {playlist.status === 'pending' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-md text-xs text-yellow-500">
                            <Icon name="Clock" size={12} />
                            На модерации
                          </div>
                        )}
                        {playlist.status === 'approved' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-md text-xs text-green-500">
                            <Icon name="Check" size={12} />
                            Одобрено
                          </div>
                        )}
                        {playlist.status === 'rejected' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded-md text-xs text-red-500">
                            <Icon name="X" size={12} />
                            Отклонено
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-foreground/60">
                        <div className="flex items-center gap-1">
                          <Icon name="Film" size={14} />
                          <span>{playlist.movies_count || 0}</span>
                        </div>
                        {playlist.moderation_comment && playlist.status === 'rejected' && (
                          <div className="flex-1 text-red-400 text-xs">
                            {playlist.moderation_comment}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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