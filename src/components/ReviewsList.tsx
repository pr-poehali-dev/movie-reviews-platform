import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { reviewsService, Review, authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface ReviewsListProps {
  movieId?: number;
  userId?: number;
}

const ReviewsList = ({ movieId, userId }: ReviewsListProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getUser();

  useEffect(() => {
    loadReviews();
  }, [movieId, userId]);

  const loadReviews = async () => {
    try {
      const data = await reviewsService.getReviews(movieId, userId);
      setReviews(data);
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

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Удалить рецензию?')) return;

    try {
      await reviewsService.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast({
        title: 'Успешно',
        description: 'Рецензия удалена',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
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
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold ${
          rating >= 7 ? 'bg-green-500/20 text-green-500' :
          rating >= 5 ? 'bg-yellow-500/20 text-yellow-500' :
          'bg-red-500/20 text-red-500'
        }`}>
          {rating}
        </div>
        <span className="text-xs text-foreground/60">/10</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="bg-card border-border p-12 text-center">
        <Icon name="MessageSquare" size={64} className="mx-auto mb-4 text-muted-foreground" />
        <h4 className="text-xl font-bold mb-2">Пока нет рецензий</h4>
        <p className="text-foreground/60">Станьте первым, кто напишет рецензию!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={review.avatar_url} alt={review.username} />
                  <AvatarFallback>
                    {review.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold">{review.username}</h4>
                    {renderRating(review.rating)}
                  </div>
                  <p className="text-sm text-foreground/60">
                    {formatDate(review.created_at)}
                  </p>
                </div>
              </div>
              {currentUser?.id === review.user_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(review.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {review.review_text}
            </p>
            {review.status && review.status !== 'approved' && (
              <div className={`mt-4 p-3 rounded-lg ${
                review.status === 'pending' 
                  ? 'bg-yellow-500/10 border border-yellow-500/30' 
                  : 'bg-red-500/10 border border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 text-sm">
                  <Icon 
                    name={review.status === 'pending' ? 'Clock' : 'AlertCircle'} 
                    size={16} 
                    className={review.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}
                  />
                  <span className="font-medium">
                    {review.status === 'pending' ? 'На модерации' : 'Отклонено'}
                  </span>
                </div>
                {review.moderation_comment && review.status === 'rejected' && (
                  <p className="text-xs text-foreground/60 mt-1">
                    Причина: {review.moderation_comment}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;