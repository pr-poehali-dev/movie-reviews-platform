import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { reviewsService, authService, Review } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Reviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await reviewsService.getReviews();
      setReviews(data.filter((r: Review) => r.is_approved));
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg ${
          rating >= 7 ? 'bg-green-500/20 text-green-500' :
          rating >= 5 ? 'bg-yellow-500/20 text-yellow-500' :
          'bg-red-500/20 text-red-500'
        }`}>
          {rating}
        </div>
        <span className="text-sm text-foreground/60">/10</span>
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
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate('/profile')}>
                    {user.username}
                  </Button>
                  <Button onClick={() => navigate('/create-playlist')}>
                    Создать подборку
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/login')}>Войти</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Рецензии
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Честные мнения киноманов о любимых фильмах
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <Icon name="MessageSquare" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-xl font-bold mb-2">Пока нет рецензий</h4>
              <p className="text-foreground/60 mb-6">Станьте первым, кто напишет рецензию!</p>
              <Button onClick={() => navigate('/')}>Перейти к фильмам</Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card 
                  key={review.id} 
                  className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/review/${review.movie_id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <img
                        src={review.movie_image}
                        alt={review.movie_title}
                        className="w-24 h-36 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{review.movie_title}</CardTitle>
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.avatar_url} alt={review.username} />
                            <AvatarFallback>
                              {review.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground/60">{review.username}</span>
                          <span className="text-sm text-foreground/40">•</span>
                          <span className="text-sm text-foreground/60">{formatDate(review.created_at)}</span>
                          {renderRating(review.rating)}
                        </div>
                        <CardDescription className="line-clamp-3 text-base">
                          {review.review_text}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
