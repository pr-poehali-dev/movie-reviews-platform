-- Set admin role for grinstrel@yandex.ru
UPDATE t_p58175694_movie_reviews_platfo.users 
SET role = 'admin' 
WHERE email = 'grinstrel@yandex.ru';