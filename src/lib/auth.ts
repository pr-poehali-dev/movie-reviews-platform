const AUTH_API_URL = 'https://functions.poehali.dev/c11d4d5e-526c-44e6-be66-fc489d9735fa';
const COLLECTIONS_API_URL = 'https://functions.poehali.dev/fe6d9067-b1a6-4375-974e-95c9fcd84489';

export interface User {
  id: number;
  email: string;
  username: string;
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
