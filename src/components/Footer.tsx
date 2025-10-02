import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const Footer = () => {
  const navigate = useNavigate();
  const navItems = ['Главная', 'Рецензии', 'Подборки', 'Новинки', 'Блог'];
  
  const handleNavClick = (item: string) => {
    const routes: { [key: string]: string } = {
      'Главная': '/',
      'Рецензии': '/reviews',
      'Подборки': '/collections',
      'Новинки': '/new-releases',
      'Блог': '/blog'
    };
    navigate(routes[item] || '/');
  };

  return (
    <footer className="bg-black border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Film" size={28} className="text-primary" />
              <h3 className="text-xl font-black">KINOVKUS.RU</h3>
            </div>
            <p className="text-foreground/60 text-sm">
              Ваш гид в мире кино. Обзоры, рецензии и подборки лучших фильмов.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              {navItems.map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => handleNavClick(item)}
                    className="hover:text-primary transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Социальные сети</h4>
            <div className="flex gap-3">
              <Button size="icon" variant="outline" className="border-border hover:border-primary hover:text-primary">
                <Icon name="Twitter" size={18} />
              </Button>
              <Button size="icon" variant="outline" className="border-border hover:border-primary hover:text-primary">
                <Icon name="Instagram" size={18} />
              </Button>
              <Button size="icon" variant="outline" className="border-border hover:border-primary hover:text-primary">
                <Icon name="Youtube" size={18} />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Подписка</h4>
            <p className="text-sm text-foreground/60 mb-3">
              Получайте новые рецензии на почту
            </p>
            <div className="flex gap-2">
              <Input placeholder="Email" className="bg-card border-border" />
              <Button className="bg-primary hover:bg-primary/90">
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-foreground/40">
          © 2024 Cinema Portal. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
