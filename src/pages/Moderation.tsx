import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { authService, moderationService } from '@/lib/auth';

const Moderation = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    if (!authService.isAdmin()) {
      navigate('/');
      return;
    }
    loadPlaylists();
  }, [navigate]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await moderationService.getPendingPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (playlistId: number) => {
    try {
      await moderationService.approvePlaylist(playlistId);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    } catch (error: any) {
      alert(error.message || 'Ошибка одобрения');
    }
  };

  const handleReject = async (playlistId: number) => {
    try {
      await moderationService.rejectPlaylist(playlistId, rejectComment);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      setRejectingId(null);
      setRejectComment('');
    } catch (error: any) {
      alert(error.message || 'Ошибка отклонения');
    }
  };

  if (!authService.isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-background to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            На главную
          </Button>
          <h1 className="text-4xl font-bold mb-2">Модерация подборок</h1>
          <p className="text-foreground/60">Проверка пользовательских подборок перед публикацией</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto text-primary" />
            <p className="mt-4 text-foreground/60">Загрузка...</p>
          </div>
        ) : playlists.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="CheckCircle" size={64} className="mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Всё проверено!</h3>
            <p className="text-foreground/60">Нет подборок, ожидающих модерации</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{playlist.title}</CardTitle>
                      <CardDescription className="mb-4">
                        {playlist.description || 'Без описания'}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-foreground/60">
                        <div className="flex items-center gap-1">
                          <Icon name="User" size={14} />
                          <span>{playlist.author_name || 'Аноним'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Film" size={14} />
                          <span>{playlist.movies_count || 0} фильмов</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          <span>{new Date(playlist.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {rejectingId === playlist.id ? (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Причина отклонения (необязательно)"
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(playlist.id)}
                          className="gap-2"
                        >
                          <Icon name="X" size={16} />
                          Подтвердить отклонение
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectComment('');
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(playlist.id)}
                        className="gap-2 bg-primary hover:bg-primary/90"
                      >
                        <Icon name="Check" size={16} />
                        Одобрить
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                        className="gap-2"
                      >
                        <Icon name="Eye" size={16} />
                        Просмотр
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setRejectingId(playlist.id)}
                        className="gap-2"
                      >
                        <Icon name="X" size={16} />
                        Отклонить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderation;
