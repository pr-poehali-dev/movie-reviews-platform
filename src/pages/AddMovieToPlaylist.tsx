import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { authService, playlistsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const AddMovieToPlaylist = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingCover(true);

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
      
      setCoverUrl(data.secure_url);
      
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
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название фильма',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await playlistsService.addMovieToPlaylist(parseInt(id || '0'), {
        id: 0,
        title: formData.title,
        title_en: formData.titleEn,
        year: formData.year ? parseInt(formData.year) : undefined,
        genre: formData.genre,
        director: formData.director,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        image: '',
        cover_url: coverUrl,
        description: formData.description,
      });
      
      toast({
        title: 'Успешно',
        description: 'Фильм добавлен в подборку',
      });
      
      navigate(`/playlist/${id}`);
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">Добавить фильм</h2>
            <p className="text-foreground/60">
              Заполните информацию о фильме
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Информация о фильме</CardTitle>
              <CardDescription>
                Все поля помогут сделать вашу подборку более информативной
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Обложка фильма</Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingCover}
                        className="w-full gap-2"
                      >
                        {uploadingCover ? (
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
                    {coverUrl && (
                      <div className="relative w-32 h-48 rounded-lg overflow-hidden border border-border">
                        <img
                          src={coverUrl}
                          alt="Обложка"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverUrl('')}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black rounded-full"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60">
                    Рекомендуем загружать постер фильма в вертикальном формате
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название на русском *</Label>
                    <Input
                      id="title"
                      placeholder="Интерстеллар"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titleEn">Название на английском</Label>
                    <Input
                      id="titleEn"
                      placeholder="Interstellar"
                      value={formData.titleEn}
                      onChange={(e) =>
                        setFormData({ ...formData, titleEn: e.target.value })
                      }
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Год выпуска</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2014"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre">Жанр</Label>
                    <Input
                      id="genre"
                      placeholder="Научная фантастика"
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Рейтинг (0-10)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="8.5"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: e.target.value })
                      }
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="director">Режиссёр</Label>
                  <Input
                    id="director"
                    placeholder="Кристофер Нолан"
                    value={formData.director}
                    onChange={(e) =>
                      setFormData({ ...formData, director: e.target.value })
                    }
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Краткое описание сюжета или ваше мнение о фильме..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
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
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddMovieToPlaylist;
