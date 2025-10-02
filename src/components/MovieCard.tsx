import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    genre: string;
    rating: number;
    image: string;
    description: string;
    trailer?: string;
  };
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const renderStars = (rating: number) => {
    const normalizedRating = Math.max(0, Math.min(10, rating));
    const scaledRating = (normalizedRating / 10) * 5;
    const fullStars = Math.floor(scaledRating);
    const hasHalfStar = scaledRating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

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
    <>
      <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={movie.image} 
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute top-4 right-4">
            <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
              <Icon name="Star" size={14} className="fill-primary text-primary" />
              <span className="text-sm font-bold">{movie.rating}</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="inline-block px-3 py-1 bg-primary/20 backdrop-blur-sm border border-primary rounded-full text-xs font-medium text-primary">
              {movie.genre}
            </span>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {movie.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {movie.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              className="flex-1 gap-2 text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              Подробнее
              <Icon name="ChevronRight" size={16} />
            </Button>
            {movie.trailer && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setTrailerOpen(true);
                }}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="Play" size={18} />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShareOpen(true);
              }}
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="Share2" size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {movie.trailer && (
        <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
          <DialogContent className="max-w-4xl p-0 bg-black border-0">
            <div className="relative aspect-video">
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute -top-12 right-0 z-50 text-white hover:text-primary transition-colors"
              >
                <Icon name="X" size={32} />
              </button>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${movie.trailer}?autoplay=1`}
                title="Трейлер фильма"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Поделиться фильмом</h2>
            <Button
              variant="outline"
              className="w-full gap-2 justify-center"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/movie/${movie.id}`);
                toast({
                  title: 'Ссылка скопирована',
                  description: 'Ссылка на фильм скопирована в буфер обмена',
                });
              }}
            >
              <Icon name="Copy" size={20} />
              Скопировать ссылку
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => {
                  const url = encodeURIComponent(window.location.origin + `/movie/${movie.id}`);
                  const text = encodeURIComponent(`${movie.title} - ${movie.description}`);
                  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                }}
              >
                <Icon name="Send" size={20} className="text-[#0088cc]" />
                Telegram
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => {
                  const url = encodeURIComponent(window.location.origin + `/movie/${movie.id}`);
                  const title = encodeURIComponent(movie.title);
                  window.open(`https://vk.com/share.php?url=${url}&title=${title}`, '_blank');
                }}
              >
                <Icon name="Share2" size={20} className="text-[#0077FF]" />
                VK
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => {
                  const url = encodeURIComponent(window.location.origin + `/movie/${movie.id}`);
                  const text = encodeURIComponent(`${movie.title} - ${movie.description}`);
                  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                }}
              >
                <Icon name="MessageCircle" size={20} className="text-[#25D366]" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => {
                  const url = encodeURIComponent(window.location.origin + `/movie/${movie.id}`);
                  const text = encodeURIComponent(movie.title);
                  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                }}
              >
                <Icon name="Twitter" size={20} className="text-[#1DA1F2]" />
                Twitter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MovieCard;
