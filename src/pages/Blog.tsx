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

  const blogPosts: any[] = [];

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

          {blogPosts.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <Icon name="BookOpen" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-xl font-bold mb-2">Пока нет статей</h4>
              <p className="text-foreground/60">Скоро здесь появятся интересные материалы о кино!</p>
            </Card>
          ) : (
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
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;