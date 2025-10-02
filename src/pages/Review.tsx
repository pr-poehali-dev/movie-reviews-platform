import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { authService, collectionsService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import WriteReview from '@/components/WriteReview';
import ReviewsList from '@/components/ReviewsList';

const Review = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  const movieData: Record<string, any> = {
    '1': {
      title: 'Битва за битвой',
      genre: 'Драма',
      rating: 7.5,
      year: 2025,
      director: 'Пол Томас Андерсон',
      duration: '180 мин',
      image: 'https://cdn.poehali.dev/files/fe887040-31f7-40a7-9475-80446b215f6e.jpeg',
      tagline: 'Победить невозможно, но важно не сдаться',
      description: 'Социальная драма в оболочке боевика, где каждый выстрел звучит как метафора неравенства, страха и одиночества. Леонардо Ди Каприо играет обыкновенного человека — и это гениально.',
      fullReview: [
        'В новом фильме Пола Томаса Андерсона «Битва за битвой» Леонардо Ди Каприо в очередной раз отказывается от образа харизматичного героя. Вместо этого — мужчина средних лет, мягкий, растерянный, пытающийся держаться на плаву в мире, который давно перестал быть справедливым. Это не экшен-триллер с взрывами и погонями, а скорее социальная драма в оболочке боевика, где каждый выстрел звучит как метафора неравенства, страха и одиночества.',
        'После «Оскара» 2016 года Ди Каприо словно намеренно стёр с лица экрана ту легендарную улыбку Джека Доусона. Он больше не спасает корабли, не соблазняет женщин, не правит империями. Его герои — те, кого жизнь постепенно загнала в угол: актёр на закате славы, климатический скептик, жалкий приспешник мафиози… И вот теперь — Роберт, простой отец-одиночка, работающий охранником на заброшенной электростанции в приграничном городке, где напряжение между мигрантами, местными жителями и правоохранительными структурами вот-вот взорвётся.',
        '«Битва за битвой» — фильм, который начинается медленно, почти нарочито вяло. Первый час — это атмосфера: шум ветра, треск рации, тяжёлые взгляды. Но чем глубже погружаешься в этот мир, тем сильнее цепляет. Андерсон, как всегда, мастерски выстраивает напряжение не через спецэффекты, а через диалоги, молчание, жесты. А потом — резкий поворот. За ним ещё один. И ещё. К середине второго акта фильм уже не просто идёт — он набирает скорость, как поезд без тормозов.',
        'Социальный подтекст здесь не прячется. Здесь есть и расизм, и классовое расслоение, и гендерные противоречия, и политическая манипуляция. Но Андерсон не тычет в зрителя этической указкой — он показывает, как всё это работает изнутри. Даже Шон Пенн, играющий крайне противного, циничного полицейского-расиста, не сводится к карикатуре. Он — часть механизма, и в этом его ужас и правда.',
        'Ди Каприо снова впечатляет. Его Роберт — не лидер, не спаситель, не мститель. Он делает ошибки, боится, теряет контроль. И именно в этом его сила. Герой не побеждает в этой битве — он её переживает. Рядом с ним — Бенисио Дель Торо в роли загадочного контрабандиста, чьи несколько сцен оставляют след на весь фильм.',
      ],
      pros: [
        'Мощная игра Леонардо Ди Каприо',
        'Мастерское режиссёрское мастерство П.Т. Андерсона',
        'Глубокий социальный подтекст',
        'Операторская работа и звуковое оформление на уровне',
      ],
      cons: [
        'Медленный темп в первый час',
        'Слишком мрачен для массового зрителя',
        'Требует внимательного просмотра',
      ],
      verdict: 'Не классика, но со временем может стать ею — 7.5/10',
    },
  };

  const movie = movieData[id || '1'] || movieData['1'];

  const renderStars = (rating: number) => {
    const normalizedRating = Math.max(0, Math.min(10, rating));
    const scaledRating = (normalizedRating / 10) * 5;
    const fullStars = Math.floor(scaledRating);
    const hasHalfStar = scaledRating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

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
              <img src="/img/ea64283c-a994-41e0-a44f-e4de01bdb91b.jpg" alt="KINOVKUS.RU" className="h-10 w-10 rounded-lg object-cover" />
              <h1 className="text-2xl font-black tracking-tight">KINOVKUS.RU</h1>
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
                  <span className="text-foreground/60">из 10</span>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Рецензии пользователей</h3>
              {authService.isAuthenticated() && (
                <WriteReview
                  movieId={parseInt(id || '1')}
                  movieTitle={movie.title}
                  movieImage={movie.image}
                  onReviewAdded={() => setReviewsKey(prev => prev + 1)}
                />
              )}
            </div>
            <ReviewsList key={reviewsKey} movieId={parseInt(id || '1')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;