import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Blog = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const blogPosts = [
    {
      id: 1,
      title: 'Как смотреть кино правильно: гайд для начинающих киноманов',
      excerpt: 'Рассказываем о базовых принципах киноискусства и как научиться понимать язык кино',
      content: 'Полный текст статьи о том, как развить кинематографическое мышление...',
      category: 'Образование',
      author: 'Редакция',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
      date: '2024-03-15',
      readTime: '8 мин',
      image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
      tags: ['гайд', 'для начинающих', 'кинообразование']
    },
    {
      id: 2,
      title: 'Топ-10 фильмов, которые изменили киноиндустрию',
      excerpt: 'Разбираем революционные картины, навсегда изменившие историю кинематографа',
      content: 'От «Броненосца Потёмкина» до «Матрицы» — фильмы, которые определили будущее кино...',
      category: 'История кино',
      author: 'Алексей Иванов',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      date: '2024-03-10',
      readTime: '12 мин',
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
      tags: ['история', 'топ', 'классика']
    },
    {
      id: 3,
      title: 'Разбор: почему «Оппенгеймер» — шедевр Кристофера Нолана',
      excerpt: 'Глубокий анализ последней работы режиссёра и почему это его лучший фильм',
      content: 'Подробный разбор сюжета, режиссуры и философии фильма «Оппенгеймер»...',
      category: 'Разборы',
      author: 'Мария Петрова',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      date: '2024-03-05',
      readTime: '15 мин',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
      tags: ['разбор', 'нолан', 'оскар']
    },
    {
      id: 4,
      title: 'Интервью с российскими кинокритиками о будущем кино',
      excerpt: 'Ведущие критики делятся мнением о трендах и перспективах киноиндустрии',
      content: 'Эксклюзивные интервью с ведущими кинокритиками России...',
      category: 'Интервью',
      author: 'Редакция',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
      date: '2024-02-28',
      readTime: '20 мин',
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
      tags: ['интервью', 'критика', 'тренды']
    },
    {
      id: 5,
      title: 'Как создаются спецэффекты в современном кино',
      excerpt: 'За кулисами магии: технологии, которые создают невероятные миры на экране',
      content: 'От CGI до практических эффектов — всё о технологиях современного кино...',
      category: 'Технологии',
      author: 'Дмитрий Соколов',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dmitry',
      date: '2024-02-20',
      readTime: '10 мин',
      image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800',
      tags: ['технологии', 'VFX', 'спецэффекты']
    },
    {
      id: 6,
      title: 'Обзор кинофестивалей 2024: что посмотреть в этом году',
      excerpt: 'Самые интересные фильмы с крупнейших мировых кинофестивалей',
      content: 'Каннский фестиваль, Берлинале, Венеция — что показали в 2024...',
      category: 'Фестивали',
      author: 'Редакция',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
      date: '2024-02-15',
      readTime: '18 мин',
      image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800',
      tags: ['фестивали', 'канны', 'премьеры']
    }
  ];

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
              Блог о кино
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Статьи, интервью, разборы и всё о мире кинематографа
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <Card
                key={post.id}
                className={`bg-card border-border hover:border-primary/50 transition-all cursor-pointer overflow-hidden group ${
                  index === 0 ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className={`relative overflow-hidden ${index === 0 ? 'md:h-full h-64' : 'h-64'}`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-primary/90 border-primary text-white">
                      {post.category}
                    </Badge>
                  </div>

                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className={index === 0 ? 'text-3xl mb-3' : 'text-xl mb-2'}>
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.authorAvatar} alt={post.author} />
                            <AvatarFallback>
                              {post.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{post.author}</span>
                            <div className="flex items-center gap-2 text-xs text-foreground/50">
                              <span>{formatDate(post.date)}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Icon name="Clock" size={12} />
                                <span>{post.readTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2">
                          Читать
                          <Icon name="ArrowRight" size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;