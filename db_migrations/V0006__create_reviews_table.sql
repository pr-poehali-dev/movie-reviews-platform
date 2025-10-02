CREATE TABLE t_p58175694_movie_reviews_platfo.reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    movie_title VARCHAR(255) NOT NULL,
    movie_image TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_user_id ON t_p58175694_movie_reviews_platfo.reviews(user_id);
CREATE INDEX idx_reviews_movie_id ON t_p58175694_movie_reviews_platfo.reviews(movie_id);
CREATE INDEX idx_reviews_created_at ON t_p58175694_movie_reviews_platfo.reviews(created_at DESC);