const IS_PREVIEW = window.location.hostname.includes('preview--');
const USE_MOCK = IS_PREVIEW;

const AUTH_API_URL = 'https://functions.poehali.dev/c11d4d5e-526c-44e6-be66-fc489d9735fa';
const COLLECTIONS_API_URL = 'https://functions.poehali.dev/fe6d9067-b1a6-4375-974e-95c9fcd84489';
const REVIEWS_API_URL = 'https://functions.poehali.dev/fe6d9067-b1a6-4375-974e-95c9fcd84489';
const PLAYLISTS_API_URL = 'https://functions.poehali.dev/d1c32b2a-126c-4ae1-a4b3-bbc8d7ddede1';
const MODERATION_API_URL = 'https://functions.poehali.dev/5e9858b0-439e-4bbf-bcbd-e1bc42cc796b';
const NOTIFICATIONS_API_URL = 'https://functions.poehali.dev/a5fa6d9e-26b8-4f93-b64c-162092c3ce0e';

export interface User {
  id: number;
  email: string;
  username: string;
  role?: string;
  avatar_url?: string;
  age?: number;
  bio?: string;
  status?: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockUser = {
        id: Math.floor(Math.random() * 1000),
        email,
        username,
        role: 'user',
        avatar_url: '/img/ea64283c-a994-41e0-a44f-e4de01bdb91b.jpg'
      };
      return {
        token: 'mock-token-' + Date.now(),
        user: mockUser
      };
    }
    
    try {
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
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Не удалось подключиться к серверу');
      }
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockUser = {
        id: 1,
        email,
        username: 'Тестовый пользователь',
        role: 'admin',
        avatar_url: '/img/ea64283c-a994-41e0-a44f-e4de01bdb91b.jpg'
      };
      return {
        token: 'mock-token-' + Date.now(),
        user: mockUser
      };
    }
    
    try {
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
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Не удалось подключиться к серверу');
      }
      throw error;
    }
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

  async getProfile(userId?: number): Promise<User> {
    try {
      const token = this.getToken();
      const url = userId ? `${AUTH_API_URL}?user_id=${userId}` : AUTH_API_URL;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки профиля');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const token = this.getToken();
    
    const response = await fetch(AUTH_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка обновления профиля');
    }

    const updatedUser = await response.json();
    this.setUser(updatedUser);
    return updatedUser;
  },
};

export const collectionsService = {
  async getCollections(): Promise<any[]> {
    try {
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
    } catch (error) {
      return [];
    }
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
    try {
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
    } catch (error) {
      return [];
    }
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
    const token = authService.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['X-Auth-Token'] = token;
    }
    
    const response = await fetch(`${PLAYLISTS_API_URL}?id=${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки подборки');
    }

    return response.json();
  },

  async createPlaylist(title: string, description: string, isPublic: boolean = true, coverImageUrl?: string): Promise<any> {
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
        cover_image_url: coverImageUrl || null,
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
    title_en?: string;
    year?: number;
    genre?: string;
    director?: string;
    rating: number;
    image?: string;
    cover_url?: string;
    description?: string;
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
        movie_title_en: movie.title_en,
        movie_year: movie.year,
        movie_genre: movie.genre,
        movie_director: movie.director,
        movie_rating: movie.rating,
        movie_image: movie.image,
        movie_cover_url: movie.cover_url,
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

  async getSavedPlaylists(): Promise<any[]> {
    try {
      const token = authService.getToken();
      
      const response = await fetch(`${PLAYLISTS_API_URL}?action=saved`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки сохранённых подборок');
      }

      const data = await response.json();
      return data.saved || [];
    } catch (error) {
      return [];
    }
  },

  async savePlaylist(playlistId: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(PLAYLISTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        action: 'save',
        playlist_id: playlistId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка сохранения подборки');
    }
  },

  async unsavePlaylist(playlistId: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(`${PLAYLISTS_API_URL}?action=unsave&playlist_id=${playlistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления из сохранённых');
    }
  },
};

export const moderationService = {
  async getPendingPlaylists(): Promise<any[]> {
    const token = authService.getToken();
    
    const response = await fetch(`${MODERATION_API_URL}?type=playlists&status=pending`, {
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

  async getPendingReviews(): Promise<any[]> {
    const token = authService.getToken();
    
    const response = await fetch(`${MODERATION_API_URL}?type=reviews&status=pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки рецензий на модерации');
    }

    const data = await response.json();
    return data.reviews || [];
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
        type: 'playlist',
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
        type: 'playlist',
        playlist_id: playlistId,
        comment,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка отклонения подборки');
    }
  },

  async approveReview(reviewId: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(MODERATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        action: 'approve',
        type: 'review',
        review_id: reviewId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка одобрения рецензии');
    }
  },

  async rejectReview(reviewId: number, comment: string): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(MODERATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        action: 'reject',
        type: 'review',
        review_id: reviewId,
        comment,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка отклонения рецензии');
    }
  },
};

export const notificationsService = {
  async getNotifications(): Promise<any> {
    try {
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
    } catch (error) {
      return { notifications: [], unread_count: 0 };
    }
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

export interface Review {
  id: number;
  user_id: number;
  username?: string;
  avatar_url?: string;
  movie_id: number;
  movie_title: string;
  movie_image?: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

export const reviewsService = {
  async getReviews(movieId?: number, userId?: number): Promise<Review[]> {
    try {
      const token = authService.getToken();
      let url = `${REVIEWS_API_URL}?action=reviews`;
      
      if (movieId) {
        url += `&movie_id=${movieId}`;
      } else if (userId) {
        url += `&user_id=${userId}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки рецензий');
      }

      return response.json();
    } catch (error) {
      return [];
    }
  },

  async createReview(data: {
    movie_id: number;
    movie_title: string;
    movie_image?: string;
    rating: number;
    review_text: string;
  }): Promise<Review> {
    const token = authService.getToken();
    
    const response = await fetch(`${REVIEWS_API_URL}?action=reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка создания рецензии');
    }

    return response.json();
  },

  async updateReview(reviewId: number, data: {
    rating: number;
    review_text: string;
  }): Promise<Review> {
    const token = authService.getToken();
    
    const response = await fetch(`${REVIEWS_API_URL}?action=reviews`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({
        review_id: reviewId,
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка обновления рецензии');
    }

    return response.json();
  },

  async deleteReview(reviewId: number): Promise<void> {
    const token = authService.getToken();
    
    const response = await fetch(`${REVIEWS_API_URL}?action=reviews&review_id=${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления рецензии');
    }
  },
};