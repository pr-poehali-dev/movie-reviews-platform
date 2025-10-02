import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import Notifications from '@/components/Notifications';
import { authService } from '@/lib/auth';

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
          
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
            >
              Главная
            </button>
            <button
              onClick={() => navigate('/reviews')}
              className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
            >
              Рецензии
            </button>
            <button
              onClick={() => navigate('/collections')}
              className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
            >
              Подборки
            </button>
            <button
              onClick={() => navigate('/new-releases')}
              className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
            >
              Новинки
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
            >
              Блог
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Поиск фильмов..." 
                className="pl-10 w-64 bg-card border-border"
              />
            </div>
            {authService.isAuthenticated() && <Notifications />}
            {authService.isAdmin() && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/moderation')}
                className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Icon name="ShieldCheck" size={18} />
                <span className="hidden md:inline">Модерация</span>
              </Button>
            )}
            {authService.isAuthenticated() ? (
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <Icon name="User" size={18} />
                <span className="hidden md:inline">Профиль</span>
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Icon name="LogIn" size={18} />
                <span className="hidden md:inline">Войти</span>
              </Button>
            )}
            <Button 
              size="icon" 
              variant="ghost" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 space-y-2">
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-card/50 rounded-lg"
              >
                Главная
              </button>
              <button
                onClick={() => {
                  navigate('/reviews');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-card/50 rounded-lg"
              >
                Рецензии
              </button>
              <button
                onClick={() => {
                  navigate('/collections');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-card/50 rounded-lg"
              >
                Подборки
              </button>
              <button
                onClick={() => {
                  navigate('/new-releases');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-card/50 rounded-lg"
              >
                Новинки
              </button>
              <button
                onClick={() => {
                  navigate('/blog');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-card/50 rounded-lg"
              >
                Блог
              </button>
              
              <div className="px-4 pt-2">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Поиск фильмов..." 
                    className="pl-10 w-full bg-card border-border"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;