ALTER TABLE t_p58175694_movie_reviews_platfo.reviews 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN moderation_comment TEXT;

CREATE INDEX idx_reviews_status ON t_p58175694_movie_reviews_platfo.reviews(status);