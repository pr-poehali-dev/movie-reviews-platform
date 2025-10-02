-- Create table for saved playlists
CREATE TABLE IF NOT EXISTS t_p58175694_movie_reviews_platfo.saved_playlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    playlist_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, playlist_id)
);