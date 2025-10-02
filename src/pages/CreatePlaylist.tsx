import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { authService, playlistsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const CreatePlaylist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'playlist' | 'movies'>('playlist');
  const [playlistId, setPlaylistId] = useState<number | null>(null);
  const [moviesCount, setMoviesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMovieCover, setUploadingMovieCover] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [movieCoverUrl, setMovieCoverUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const movieCoverInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
  });
  const [movieData, setMovieData] = useState({
    title: '',
    titleEn: '',
    year: '',
    genre: '',
    director: '',
    rating: '',
    description: '',
  });

  if (!authService.isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображение',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'kinovkus_covers');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dsk1jxlgd/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      setCoverImageUrl(data.secure_url);
      
      toast({
        title: 'Успешно',
        description: 'Обложка загружена',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMovieCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображение',
        variant: 'destructive',
      });
      return;
    }

    setUploadingMovieCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'kinovkus_covers');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dsk1jxlgd/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      setMovieCoverUrl(data.secure_url);
      
      toast({
        title: 'Успешно',
        description: 'Обложка фильма загружена',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive',
      });
    } finally {
      setUploadingMovieCover(false);
    }
  };

  const handlePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название подборки',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await playlistsService.createPlaylist(
        formData.title,
        formData.description,
        formData.isPublic,
        coverImageUrl
      );
      
      setPlaylistId(response.playlist.id);
      setStep('movies');
      
      toast({
        title: 'Отлично!',
        description: 'Теперь добавьте фильмы в подборку',
      });
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

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movieData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название фильма',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await playlistsService.addMovieToPlaylist(playlistId!, {
        id: 0,
        title: movieData.title,
        title_en: movieData.titleEn,
        year: movieData.year ? parseInt(movieData.year) : undefined,
        genre: movieData.genre,
        director: movieData.director,
        rating: movieData.rating ? parseFloat(movieData.rating) : 0,
        image: '',
        cover_url: movieCoverUrl,
        description: movieData.description,
      });
      
      setMoviesCount(prev => prev + 1);
      setMovieData({
        title: '',
        titleEn: '',
        year: '',
        genre: '',
        director: '',
        rating: '',
        description: '',
      });
      setMovieCoverUrl('');
      
      toast({
        title: 'Успешно',
        description: `Фильм добавлен! Всего в подборке: ${moviesCount + 1}`,
      });
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

  const handleFinish = () => {
    navigate(`/playlist/${playlistId}`);
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

            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              Назад
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">Создать подборку</h2>
                <p className="text-foreground/60">
                  {step === 'playlist' 
                    ? 'Составьте список любимых фильмов и поделитесь с сообществом'
                    : 'Добавляйте фильмы в вашу подборку'
                  }
                </p>
              </div>
              {step === 'movies' && (
                <Button
                  variant="outline"
                  onClick={() => setStep('playlist')}
                  className="gap-2"
                >
                  <Icon name="Edit" size={16} />
                  Изменить подборку
                </Button>
              )}
            </div>
          </div>

          {step === 'playlist' ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Информация о подборке</CardTitle>
                <CardDescription>
                  Заполните основные данные для вашей подборки
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaylistSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Название подборки *</Label>
                  <Input
                    id="title"
                    placeholder="Например: Лучшие триллеры 2024"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Расскажите, что объединяет фильмы в этой подборке..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="bg-background border-border resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Обложка подборки</Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full gap-2"
                      >
                        {uploadingImage ? (
                          <>
                            <Icon name="Loader2" size={16} className="animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          <>
                            <Icon name="Upload" size={16} />
                            Выбрать обложку
                          </>
                        )}
                      </Button>
                    </div>
                    {coverImageUrl && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                        <img
                          src={coverImageUrl}
                          alt="Обложка"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverImageUrl('')}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black rounded-full"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60">
                    Рекомендуемый размер: 1200×630 пикселей
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="public">Публичная подборка</Label>
                    <p className="text-sm text-foreground/60">
                      Другие пользователи смогут видеть эту подборку
                    </p>
                  </div>
                  <Switch
                    id="public"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPublic: checked })
                    }
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <Icon name="Loader2" size={20} className="animate-spin" />
                    ) : (
                      'Создать подборку'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Добавление фильмов</CardTitle>
                    <CardDescription>
                      Добавьте фильмы в вашу подборку. После добавления каждого фильма форма очистится для следующего
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Icon name="Film" size={20} className="text-primary" />
                    <span className="text-2xl font-bold text-primary">{moviesCount}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMovie} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Обложка фильма</Label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input
                          ref={movieCoverInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleMovieCoverUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => movieCoverInputRef.current?.click()}
                          disabled={uploadingMovieCover}
                          className="w-full gap-2"
                        >
                          {uploadingMovieCover ? (
                            <>
                              <Icon name="Loader2" size={16} className="animate-spin" />
                              Загрузка...
                            </>
                          ) : (
                            <>
                              <Icon name="Upload" size={16} />
                              Выбрать обложку
                            </>
                          )}
                        </Button>
                      </div>
                      {movieCoverUrl && (
                        <div className="relative w-32 h-48 rounded-lg overflow-hidden border border-border">
                          <img
                            src={movieCoverUrl}
                            alt="Обложка"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setMovieCoverUrl('')}
                            className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black rounded-full"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="movieTitle">Название на русском *</Label>
                      <Input
                        id="movieTitle"
                        placeholder="Интерстеллар"
                        value={movieData.title}
                        onChange={(e) => setMovieData({ ...movieData, title: e.target.value })}
                        required
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="movieTitleEn">Название на английском</Label>
                      <Input
                        id="movieTitleEn"
                        placeholder="Interstellar"
                        value={movieData.titleEn}
                        onChange={(e) => setMovieData({ ...movieData, titleEn: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="movieYear">Год</Label>
                      <Input
                        id="movieYear"
                        type="number"
                        placeholder="2014"
                        value={movieData.year}
                        onChange={(e) => setMovieData({ ...movieData, year: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="movieGenre">Жанр</Label>
                      <Input
                        id="movieGenre"
                        placeholder="Научная фантастика"
                        value={movieData.genre}
                        onChange={(e) => setMovieData({ ...movieData, genre: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="movieRating">Рейтинг (0-10)</Label>
                      <Input
                        id="movieRating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="8.5"
                        value={movieData.rating}
                        onChange={(e) => setMovieData({ ...movieData, rating: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="movieDirector">Режиссёр</Label>
                    <Input
                      id="movieDirector"
                      placeholder="Кристофер Нолан"
                      value={movieData.director}
                      onChange={(e) => setMovieData({ ...movieData, director: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="movieDescription">Описание</Label>
                    <Textarea
                      id="movieDescription"
                      placeholder="Краткое описание сюжета..."
                      value={movieData.description}
                      onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
                      rows={3}
                      className="bg-background border-border resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <Icon name="Loader2" size={20} className="animate-spin" />
                      ) : (
                        'Добавить фильм'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFinish}
                    >
                      Завершить
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 'playlist' && (
            <div className="mt-8 p-6 bg-card border border-border rounded-lg">
            <div className="flex gap-4">
              <Icon name="Info" size={24} className="text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-2">Модерация подборок</h4>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <Icon name="ShieldCheck" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Все подборки проходят проверку перед публикацией</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Clock" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Модерация обычно занимает до 24 часов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>После одобрения подборка появится в общем доступе</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Eye" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Статус модерации можно отслеживать в профиле</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;