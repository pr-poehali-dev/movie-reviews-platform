import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { reviewsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface WriteReviewProps {
  movieId: number;
  movieTitle: string;
  movieImage?: string;
  onReviewAdded?: () => void;
}

const WriteReview = ({ movieId, movieTitle, movieImage, onReviewAdded }: WriteReviewProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Ошибка',
        description: 'Поставьте оценку фильму',
        variant: 'destructive',
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Напишите текст рецензии',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await reviewsService.createReview({
        movie_id: movieId,
        movie_title: movieTitle,
        movie_image: movieImage,
        rating,
        review_text: reviewText.trim(),
      });

      toast({
        title: 'Успешно',
        description: 'Рецензия опубликована',
      });

      setOpen(false);
      setRating(0);
      setReviewText('');
      
      if (onReviewAdded) {
        onReviewAdded();
      }
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Icon name="MessageSquarePlus" size={16} />
          Написать рецензию
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Рецензия на «{movieTitle}»</DialogTitle>
          <DialogDescription>
            Поделитесь своим мнением о фильме
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ваша оценка</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`h-10 w-10 rounded-lg border-2 font-bold transition-all ${
                      value <= (hoverRating || rating)
                        ? 'border-primary bg-primary text-white scale-110'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="text-sm text-foreground/60">
                {rating > 0 ? `Вы поставили: ${rating}/10` : 'Выберите оценку от 1 до 10'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Ваша рецензия</Label>
              <Textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Напишите, что вы думаете о фильме..."
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-foreground/60">
                {reviewText.length} символов
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
              Опубликовать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReview;
