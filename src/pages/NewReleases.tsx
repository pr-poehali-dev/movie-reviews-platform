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
      title: 'Оппенгеймер',
      year: 2024,
      genre: 'Биография, Драма',
      rating: 8.5,
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
      description: 'История создателя атомной бомбы Роберта Оппенгеймера',
      releaseDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Дюна: Часть вторая',
      year: 2024,
      genre: 'Фантастика, Приключения',
      rating: 8.8,
      image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400',
      description: 'Продолжение эпической саги о пустынной планете Арракис',
      releaseDate: '2024-02-28'
    },
    {
      id: 3,
      title: 'Бедные-несчастные',
      year: 2024,
      genre: 'Комедия, Фантастика',
      rating: 7.9,
      image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400',
      description: 'Невероятная история о женщине, воскрешённой безумным учёным',
      releaseDate: '2024-01-20'
    },
    {
      id: 4,
      title: 'Гражданская война',
      year: 2024,
      genre: 'Боевик, Триллер',
      rating: 7.5,
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
      description: 'Журналисты в эпицентре гражданской войны в США',
      releaseDate: '2024-03-15'
    },
    {
      id: 5,
      title: 'Футура',
      year: 2024,
      genre: 'Научная фантастика',
      rating: 8.2,
      image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400',
      description: 'Путешествие в будущее человечества',
      releaseDate: '2024-02-10'
    },
    {
      id: 6,
      title: 'Зона интересов',
      year: 2024,
      genre: 'Драма, История',
      rating: 8.1,
      image: 'https://images.unsplash.com/photo-1574267432644-f74f8ec55533?w=400',
      description: 'История семьи коменданта Освенцима',
      releaseDate: '2024-01-25'
    }
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewReleases;