import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { authService, User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface EditProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const EditProfile = ({ user, onUpdate }: EditProfileProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || '',
    avatar_url: user.avatar_url || '',
    age: user.age || '',
    bio: user.bio || '',
    status: user.status || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToUpdate: any = {
        username: formData.username,
        avatar_url: formData.avatar_url,
        bio: formData.bio,
        status: formData.status,
      };

      if (formData.age) {
        dataToUpdate.age = parseInt(formData.age as string);
      }

      const updatedUser = await authService.updateProfile(dataToUpdate);
      onUpdate(updatedUser);
      setOpen(false);
      toast({
        title: 'Успешно',
        description: 'Профиль обновлён',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon name="Edit" size={16} />
          Редактировать профиль
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
          <DialogDescription>
            Измените информацию о себе
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Введите имя"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">URL аватарки</Label>
              <Input
                id="avatar"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Возраст</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="150"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Введите возраст"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="Ваш статус"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Расскажите о себе"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
