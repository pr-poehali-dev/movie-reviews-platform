import { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
  });

  if (!authService.isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
        formData.isPublic
      );
      
      toast({
        title: 'Успешно',
        description: 'Подборка создана',
      });
      
      navigate(`/playlist/${response.playlist.id}`);
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
              <Icon name="Film" size={32} className="text-primary" />
              <h1 className="text-2xl font-black tracking-tight">CINEMA</h1>
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
            <h2 className="text-4xl font-bold mb-2">Создать подборку</h2>
            <p className="text-foreground/60">
              Составьте список любимых фильмов и поделитесь с сообществом
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Информация о подборке</CardTitle>
              <CardDescription>
                Заполните основные данные для вашей подборки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="mt-8 p-6 bg-card border border-border rounded-lg">
            <div className="flex gap-4">
              <Icon name="Info" size={24} className="text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-2">Как это работает?</h4>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>После создания подборки вы сможете добавить в неё фильмы</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Публичные подборки видны всем пользователям на сайте</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Вы можете редактировать подборку в любое время</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;
