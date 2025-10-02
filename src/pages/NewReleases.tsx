import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NewReleases = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const newMovies = [
    {
      id: 1,
      title: 'Битва за битвой',
      titleEn: 'One Battle After Another',
      year: 2025,
      genre: 'Боевик, Триллер, Драма, Криминал',
      director: 'Пол Томас Андерсон',
      country: 'США',
      budget: '$130 000 000',
      rating: 7.5,
      image: 'https://cdn.poehali.dev/files/16ffbc60-c6ea-46ae-9a24-55cb683daade.jpg',
      releaseDate: '2025-09-25',
      description: 'Социальная драма в оболочке боевика, где каждый выстрел звучит как метафора неравенства, страха и одиночества. Леонардо Ди Каприо в роли обыкновенного человека.',
      cast: [
        'Леонардо ДиКаприо',
        'Шон Пенн',
        'Чейз Инфинити',
        'Бенисио Дель Торо',
        'Тейяна Тейлор',
        'Реджина Холл',
        'Джеймс Рэйтерман',
        'Тони Голдуин',
        'Карлос Макфарланд',
        'Джон Хугенэккер',
      ],
    },
  ];

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Новинки кино
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Свежие релизы и долгожданные премьеры 2024 года
            </p>
          </div>

          {newMovies.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <Icon name="Film" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-xl font-bold mb-2">Пока нет новинок</h4>
              <p className="text-foreground/60">Скоро здесь появятся свежие релизы!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newMovies.map((movie) => (
                <Card
                  key={movie.id}
                  className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/review/${movie.id}`)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary/90 border-primary text-white">
                        NEW
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center justify-between">
                        {renderStars(movie.rating / 2)}
                        <span className="text-sm font-bold text-primary">{movie.rating}/10</span>
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl leading-tight">{movie.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">{movie.year}</Badge>
                    </div>
                    <CardDescription className="text-xs text-foreground/50">
                      {movie.genre}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/70 line-clamp-2 mb-3">
                      {movie.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-foreground/50">
                      <Icon name="Calendar" size={12} />
                      <span>Премьера: {formatDate(movie.releaseDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewReleases;