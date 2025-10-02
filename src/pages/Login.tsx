import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login(formData.email, formData.password);
        authService.setToken(response.token);
        authService.setUser(response.user);
        toast({
          title: 'Успешный вход',
          description: `Добро пожаловать, ${response.user.username}!`,
        });
        navigate('/profile');
      } else {
        const response = await authService.register(
          formData.email,
          formData.password,
          formData.username
        );
        authService.setToken(response.token);
        authService.setUser(response.user);
        toast({
          title: 'Регистрация успешна',
          description: `Добро пожаловать, ${response.user.username}!`,
        });
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Login/Register error:', error);
      toast({
        title: 'Ошибка подключения',
        description: error.message === 'Failed to fetch' 
          ? 'Не удалось связаться с сервером. Проверьте интернет-соединение и попробуйте снова.'
          : error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <img src="/img/ea64283c-a994-41e0-a44f-e4de01bdb91b.jpg" alt="KINOVKUS.RU" className="h-10 w-10 rounded-lg object-cover" />
            <h1 className="text-3xl font-black">KINOVKUS.RU</h1>
          </button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isLogin ? 'Вход' : 'Регистрация'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Войдите в свой аккаунт для доступа к коллекциям'
                : 'Создайте аккаунт для сохранения любимых фильмов'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Введите имя"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required={!isLogin}
                    className="bg-background border-border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="bg-background border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <Icon name="Loader2" size={20} className="animate-spin" />
                ) : isLogin ? (
                  'Войти'
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ email: '', password: '', username: '' });
                  }}
                  className="text-sm text-foreground/60 hover:text-primary transition-colors"
                >
                  {isLogin
                    ? 'Нет аккаунта? Зарегистрируйтесь'
                    : 'Уже есть аккаунт? Войдите'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <Icon name="ArrowLeft" size={16} />
            Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;