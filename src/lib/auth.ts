const AUTH_API_URL = 'https://functions.poehali.dev/c11d4d5e-526c-44e6-be66-fc489d9735fa';
const COLLECTIONS_API_URL = 'https://functions.poehali.dev/fe6d9067-b1a6-4375-974e-95c9fcd84489';
const PLAYLISTS_API_URL = 'https://functions.poehali.dev/d1c32b2a-126c-4ae1-a4b3-bbc8d7ddede1';
const MODERATION_API_URL = 'https://functions.poehali.dev/5e9858b0-439e-4bbf-bcbd-e1bc42cc796b';
const NOTIFICATIONS_API_URL = 'https://functions.poehali.dev/a5fa6d9e-26b8-4f93-b64c-162092c3ce0e';

export interface User {
  id: number;
  email: string;
  username: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        email,
        password,
        username,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка регистрации');
    }

    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка входа');
    }

    return response.json();
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  },
};

export const collectionsService = {
  async getCollections(): Promise<any[]> {
    const token = authService.getToken();
    
    const response = await fetch(COLLECTIONS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки коллекций');
    }

    const data = await response.json();
    return data.collections || [];
  },

  async addToCollection(movie: {
    id: number;
    title: string;
    genre: string;
    rating: number;
    image: string;
    description: string;
  }): Promise<any> {
    const token = authService.getToken();
    
    const response = await fetch(COLLECTIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        movie_id: movie.id,
        movie_title: movie.title,
        movie_genre: movie.genre,
        movie_rating: movie.rating,
        movie_image: movie.image,
        movie_description: movie.description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка добавления в коллекцию');
    }

    return response.json();
  },

  async removeFromCollection(movieId: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(`${COLLECTIONS_API_URL}?movie_id=${movieId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления из коллекции');
    }
  },
};

export const playlistsService = {
  async getPublicPlaylists(): Promise<any[]> {
    const response = await fetch(PLAYLISTS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки подборок');
    }

    const data = await response.json();
    return data.playlists || [];
  },

  async getUserPlaylists(userId: number): Promise<any[]> {
    const response = await fetch(`${PLAYLISTS_API_URL}?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки подборок');
    }

    const data = await response.json();
    return data.playlists || [];
  },

  async getPlaylist(id: number): Promise<any> {
    const response = await fetch(`${PLAYLISTS_API_URL}?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки подборки');
    }

    return response.json();
  },

  async createPlaylist(title: string, description: string, isPublic: boolean = true): Promise<any> {
    const token = authService.getToken();
    
    const response = await fetch(PLAYLISTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        action: 'create',
        title,
        description,
        is_public: isPublic,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка создания подборки');
    }

    return response.json();
  },

  async addMovieToPlaylist(playlistId: number, movie: {
    id: number;
    title: string;
    genre: string;
    rating: number;
    image: string;
    description: string;
  }): Promise<any> {
    const token = authService.getToken();
    
    const response = await fetch(PLAYLISTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        action: 'add_movie',
        playlist_id: playlistId,
        movie_id: movie.id,
        movie_title: movie.title,
        movie_genre: movie.genre,
        movie_rating: movie.rating,
        movie_image: movie.image,
        movie_description: movie.description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка добавления фильма');
    }

    return response.json();
  },

  async removeMovieFromPlaylist(playlistId: number, movieId: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(`${PLAYLISTS_API_URL}?id=${playlistId}&movie_id=${movieId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления фильма');
    }
  },

  async deletePlaylist(playlistId: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(`${PLAYLISTS_API_URL}?id=${playlistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления подборки');
    }
  },
};

export const moderationService = {
  async getPendingPlaylists(): Promise<any[]> {
    const token = authService.getToken();
    
    const response = await fetch(`${MODERATION_API_URL}?status=pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки подборок на модерации');
    }

    const data = await response.json();
    return data.playlists || [];
  },

  async approvePlaylist(playlistId: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(MODERATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        action: 'approve',
        playlist_id: playlistId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка одобрения подборки');
    }
  },

  async rejectPlaylist(playlistId: number, comment: string): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(MODERATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        action: 'reject',
        playlist_id: playlistId,
        comment,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка отклонения подборки');
    }
  },
};

export const notificationsService = {
  async getNotifications(): Promise<any> {
    const token = authService.getToken();
    
    const response = await fetch(NOTIFICATIONS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки уведомлений');
    }

    return response.json();
  },

  async markAsRead(notificationId?: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(NOTIFICATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        action: 'mark_read',
        notification_id: notificationId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка отметки уведомлений');
    }
  },

  async deleteNotification(notificationId?: number): Promise<void> {
    const token = authService.getToken();
    
    const url = notificationId 
      ? `${NOTIFICATIONS_API_URL}?id=${notificationId}`
      : NOTIFICATIONS_API_URL;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления уведомлений');
    }
  },
};