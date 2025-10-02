-- Добавление статуса модерации и роли администратора
ALTER TABLE playlists ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE playlists ADD COLUMN moderation_comment TEXT;
ALTER TABLE playlists ADD COLUMN moderated_at TIMESTAMP;
ALTER TABLE playlists ADD COLUMN moderated_by INTEGER REFERENCES users(id);

-- Добавление роли администратора к пользователям
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Индексы для быстрой фильтрации
CREATE INDEX idx_playlists_status ON playlists(status);
CREATE INDEX idx_users_role ON users(role);

-- Обновление существующих подборок - устанавливаем статус "одобрено"
UPDATE playlists SET status = 'approved' WHERE status IS NULL OR status = 'pending';