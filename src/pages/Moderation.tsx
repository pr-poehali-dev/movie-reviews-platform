import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { authService, moderationService } from '@/lib/auth';

const Moderation = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [activeTab, setActiveTab] = useState('playlists');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadContent();
  }, [navigate, activeTab]);

  const loadContent = async () => {
    try {
      setLoading(true);
      if (activeTab === 'playlists') {
        const data = await moderationService.getPendingPlaylists();
        setPlaylists(data);
      } else {
        const data = await moderationService.getPendingReviews();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePlaylist = async (playlistId: number) => {
    try {
      await moderationService.approvePlaylist(playlistId);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    } catch (error: any) {
      alert(error.message || 'Ошибка одобрения');
    }
  };

  const handleRejectPlaylist = async (playlistId: number) => {
    try {
      await moderationService.rejectPlaylist(playlistId, rejectComment);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      setRejectingId(null);
      setRejectComment('');
    } catch (error: any) {
      alert(error.message || 'Ошибка отклонения');
    }
  };

  const handleApproveReview = async (reviewId: number) => {
    try {
      await moderationService.approveReview(reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error: any) {
      alert(error.message || 'Ошибка одобрения');
    }
  };

  const handleRejectReview = async (reviewId: number) => {
    try {
      await moderationService.rejectReview(reviewId, rejectComment);
      setReviews(reviews.filter(r => r.id !== reviewId));
      setRejectingId(null);
      setRejectComment('');
    } catch (error: any) {
      alert(error.message || 'Ошибка отклонения');
    }
  };

  if (!authService.isAuthenticated()) {
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
          <h1 className="text-4xl font-bold mb-2">Модерация контента</h1>
          <p className="text-foreground/60">Проверка пользовательского контента перед публикацией</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="playlists">
              Подборки ({playlists.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Рецензии ({reviews.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto text-primary" />
            <p className="mt-4 text-foreground/60">Загрузка...</p>
          </div>
        ) : activeTab === 'playlists' && playlists.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="CheckCircle" size={64} className="mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Всё проверено!</h3>
            <p className="text-foreground/60">Нет подборок, ожидающих модерации</p>
          </Card>
        ) : activeTab === 'reviews' && reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="CheckCircle" size={64} className="mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Всё проверено!</h3>
            <p className="text-foreground/60">Нет рецензий, ожидающих модерации</p>
          </Card>
        ) : activeTab === 'playlists' ? (
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
                          onClick={() => handleRejectPlaylist(playlist.id)}
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
                        onClick={() => handleApprovePlaylist(playlist.id)}
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
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="border-border">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.author_avatar} alt={review.author_name} />
                      <AvatarFallback>
                        {review.author_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{review.author_name}</h4>
                        <div className={`px-2 py-1 rounded-lg font-bold ${
                          review.rating >= 7 ? 'bg-green-500/20 text-green-500' :
                          review.rating >= 5 ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {review.rating}/10
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-2">{review.movie_title}</CardTitle>
                      <p className="text-sm text-foreground/60">
                        {new Date(review.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {review.review_text}
                    </p>
                  </div>
                  
                  {rejectingId === review.id ? (
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
                          onClick={() => handleRejectReview(review.id)}
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
                        onClick={() => handleApproveReview(review.id)}
                        className="gap-2 bg-primary hover:bg-primary/90"
                      >
                        <Icon name="Check" size={16} />
                        Одобрить
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setRejectingId(review.id)}
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