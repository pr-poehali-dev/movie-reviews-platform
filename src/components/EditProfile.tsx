import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    username: user.username || '',
    avatar_url: user.avatar_url || '',
    age: user.age || '',
    bio: user.bio || '',
    status: user.status || '',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5 МБ',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Можно загружать только изображения',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, avatar_url: base64String });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить файл',
        variant: 'destructive',
      });
      setUploading(false);
    }
  };

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
              <Label>Аватарка</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.avatar_url} alt={formData.username} />
                  <AvatarFallback className="text-2xl">
                    {formData.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Icon name="Upload" size={16} />
                        Загрузить с компьютера
                      </>
                    )}
                  </Button>
                  <Input
                    id="avatar"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="Или вставьте URL"
                  />
                </div>
              </div>
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