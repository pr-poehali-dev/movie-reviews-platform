import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';

const NewReleases = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const newMovies = [
    {
      id: 1,
      title: 'Битва за битвой',
      genre: 'Боевик',
      rating: 7.5,
      image: 'https://cdn.poehali.dev/files/16ffbc60-c6ea-46ae-9a24-55cb683daade.jpg',
      description: 'Социальная драма в оболочке боевика, где каждый выстрел звучит как метафора неравенства, страха и одиночества',
      trailer: '4jzU6LT7vA4',
    },
  ];

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
                <MovieCard key={movie.id} movie={movie} />
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