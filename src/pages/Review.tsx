import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { authService, collectionsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Review = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const movieData: Record<string, any> = {
    '1': {
      title: 'Тёмные воды',
      genre: 'Триллер',
      rating: 4.5,
      year: 2024,
      director: 'Анна Волкова',
      duration: '142 мин',
      image: '/img/08a4b6ca-8db2-40f6-bdb2-7207f8212a02.jpg',
      tagline: 'Некоторые тайны лучше оставить в глубине',
      description: 'Атмосферный психологический триллер, который исследует темные уголки человеческого сознания через призму детективной истории.',
      fullReview: [
        'Анна Волкова создала поистине завораживающую работу, которая держит зрителя в напряжении с первых минут до финальных титров. "Тёмные воды" - это не просто триллер, это глубокое погружение в психологию персонажей, где каждая деталь имеет значение.',
        'Визуальный язык фильма заслуживает особого внимания. Операторская работа Михаила Светлова создаёт атмосферу постоянной тревоги и неопределённости. Игра света и тени становится полноценным персонажем картины, подчёркивая внутренние конфликты героев.',
        'Актёрский состав справляется с задачей блестяще. Главная роль исполнена с таким мастерством, что грань между реальностью и иллюзией стирается не только для персонажа, но и для зрителя. Это тот случай, когда актёрская игра выходит за рамки профессионализма и становится искусством.',
        'Саундтрек Дмитрия Соколова дополняет визуальный ряд, создавая многослойное звуковое пространство. Музыка не просто сопровождает действие - она усиливает эмоциональное воздействие каждой сцены.',
      ],
      pros: [
        'Выдающаяся операторская работа',
        'Глубокая проработка персонажей',
        'Непредсказуемый сюжет',
        'Атмосферный саундтрек',
      ],
      cons: [
        'Местами затянутый темп',
        'Требует внимательного просмотра',
      ],
      verdict: 'Обязателен к просмотру для всех ценителей интеллектуального кино',
    },
  };

  const movie = movieData[id || '1'] || movieData['1'];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`full-${i}`} name="Star" size={24} className="fill-primary text-primary" />
        ))}
        {hasHalfStar && <Icon name="StarHalf" size={24} className="fill-primary text-primary" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon key={`empty-${i}`} name="Star" size={24} className="text-muted-foreground" />
        ))}
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
              <Icon name="Film" size={32} className="text-primary" />
              <h1 className="text-2xl font-black tracking-tight">CINEMA</h1>
            </button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={18} />
              Назад
            </Button>
          </div>
        </div>
      </nav>

      <div 
        className="relative h-[500px] flex items-end"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(26,26,26,1)), url('${movie.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl animate-fade-in">
            <Badge className="mb-4 bg-primary/20 border-primary text-primary hover:bg-primary/30">
              {movie.genre}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-3 tracking-tight">
              {movie.title}
            </h1>
            <p className="text-xl text-foreground/70 italic mb-6">
              "{movie.tagline}"
            </p>
            <div className="flex flex-wrap gap-6 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                <span>{movie.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} />
                <span>{movie.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="User" size={16} />
                <span>Режиссёр: {movie.director}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border mb-8 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-border">
              <div>
                <h3 className="text-sm text-foreground/60 mb-2">Общая оценка</h3>
                <div className="flex items-center gap-4">
                  {renderStars(movie.rating)}
                  <span className="text-4xl font-bold">{movie.rating}</span>
                  <span className="text-foreground/60">из 5</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  disabled={isSaving || !authService.isAuthenticated()}
                  onClick={async () => {
                    if (!authService.isAuthenticated()) {
                      navigate('/login');
                      return;
                    }
                    setIsSaving(true);
                    try {
                      await collectionsService.addToCollection({
                        id: parseInt(id || '1'),
                        title: movie.title,
                        genre: movie.genre,
                        rating: movie.rating,
                        image: movie.image,
                        description: movie.description,
                      });
                      toast({
                        title: 'Успешно',
                        description: 'Фильм добавлен в коллекцию',
                      });
                    } catch (error: any) {
                      toast({
                        title: 'Ошибка',
                        description: error.message,
                        variant: 'destructive',
                      });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  {isSaving ? (
                    <Icon name="Loader2" size={18} className="animate-spin" />
                  ) : (
                    <Icon name="Bookmark" size={18} />
                  )}
                  {authService.isAuthenticated() ? 'Сохранить' : 'Войдите, чтобы сохранить'}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Icon name="Share2" size={18} />
                  Поделиться
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">О фильме</h2>
                <p className="text-foreground/80 leading-relaxed">
                  {movie.description}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Рецензия</h2>
                <div className="space-y-4">
                  {movie.fullReview.map((paragraph: string, index: number) => (
                    <p key={index} className="text-foreground/80 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="ThumbsUp" size={24} className="text-green-500" />
                <h3 className="text-xl font-bold">Достоинства</h3>
              </div>
              <ul className="space-y-2">
                {movie.pros.map((pro: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icon name="Check" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">{pro}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="ThumbsDown" size={24} className="text-orange-500" />
                <h3 className="text-xl font-bold">Недостатки</h3>
              </div>
              <ul className="space-y-2">
                {movie.cons.map((con: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icon name="Minus" size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">{con}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary p-8 text-center">
            <Icon name="Award" size={48} className="mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Вердикт</h3>
            <p className="text-lg text-foreground/80">{movie.verdict}</p>
          </Card>

          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-2xl font-bold mb-6">Поделиться рецензией</h3>
            <div className="flex flex-wrap gap-4">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Icon name="Twitter" size={18} />
                Twitter
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Icon name="Facebook" size={18} />
                Facebook
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Icon name="Send" size={18} />
                Telegram
              </Button>
              <Button variant="outline" className="gap-2">
                <Icon name="Link" size={18} />
                Копировать ссылку
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;