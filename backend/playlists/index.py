import json
import os
import jwt
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user movie playlists
    Args: event - dict with httpMethod, body, headers, queryStringParameters
          context - object with request_id, function_name
    Returns: HTTP response with playlist data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET')
    
    if not db_url or not jwt_secret:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Server configuration error'}),
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    query_params = event.get('queryStringParameters', {}) or {}
    
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            playlist_id = query_params.get('id')
            user_filter = query_params.get('user_id')
            
            if playlist_id:
                cursor.execute(
                    """SELECT p.*, u.username as author_name,
                       (SELECT COUNT(*) FROM playlist_movies WHERE playlist_id = p.id) as movies_count
                       FROM playlists p
                       LEFT JOIN users u ON p.user_id = u.id
                       WHERE p.id = %s AND (p.is_public = true OR p.user_id = %s)""",
                    (playlist_id, user_filter or 0)
                )
                playlist = cursor.fetchone()
                
                if not playlist:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Подборка не найдена'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT * FROM playlist_movies WHERE playlist_id = %s ORDER BY position, added_at",
                    (playlist_id,)
                )
                movies = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'playlist': dict(playlist),
                        'movies': [dict(m) for m in movies]
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            elif user_filter:
                cursor.execute(
                    """SELECT p.*, u.username as author_name,
                       (SELECT COUNT(*) FROM playlist_movies WHERE playlist_id = p.id) as movies_count
                       FROM playlists p
                       LEFT JOIN users u ON p.user_id = u.id
                       WHERE p.user_id = %s
                       ORDER BY p.created_at DESC""",
                    (user_filter,)
                )
            else:
                cursor.execute(
                    """SELECT p.*, u.username as author_name,
                       (SELECT COUNT(*) FROM playlist_movies WHERE playlist_id = p.id) as movies_count
                       FROM playlists p
                       LEFT JOIN users u ON p.user_id = u.id
                       WHERE p.is_public = true
                       ORDER BY p.created_at DESC"""
                )
            
            playlists = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'playlists': [dict(p) for p in playlists]}, default=str),
                'isBase64Encoded': False
            }
        
        auth_token = headers.get('x-auth-token') or headers.get('X-Auth-Token')
        
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        try:
            payload = jwt.decode(auth_token, jwt_secret, algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Токен истёк'}),
                'isBase64Encoded': False
            }
        except jwt.InvalidTokenError:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Неверный токен'}),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create':
                title = body_data.get('title', '').strip()
                description = body_data.get('description', '').strip()
                is_public = body_data.get('is_public', True)
                
                if not title:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Название подборки обязательно'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """INSERT INTO playlists (user_id, title, description, is_public)
                       VALUES (%s, %s, %s, %s) RETURNING *""",
                    (user_id, title, description, is_public)
                )
                playlist = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'playlist': dict(playlist)}, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_movie':
                playlist_id = body_data.get('playlist_id')
                movie_id = body_data.get('movie_id')
                movie_title = body_data.get('movie_title')
                movie_genre = body_data.get('movie_genre')
                movie_rating = body_data.get('movie_rating')
                movie_image = body_data.get('movie_image')
                movie_description = body_data.get('movie_description')
                
                if not playlist_id or not movie_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'playlist_id и movie_id обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT user_id FROM playlists WHERE id = %s",
                    (playlist_id,)
                )
                playlist = cursor.fetchone()
                
                if not playlist or playlist['user_id'] != user_id:
                    return {
                        'statusCode': 403,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Нет доступа к этой подборке'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """INSERT INTO playlist_movies 
                       (playlist_id, movie_id, movie_title, movie_genre, movie_rating, movie_image, movie_description)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)
                       ON CONFLICT (playlist_id, movie_id) DO NOTHING
                       RETURNING *""",
                    (playlist_id, movie_id, movie_title, movie_genre, movie_rating, movie_image, movie_description)
                )
                movie = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'movie': dict(movie) if movie else None}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            playlist_id = query_params.get('id')
            movie_id = query_params.get('movie_id')
            
            if movie_id and playlist_id:
                cursor.execute(
                    """SELECT p.user_id FROM playlists p WHERE p.id = %s""",
                    (playlist_id,)
                )
                playlist = cursor.fetchone()
                
                if not playlist or playlist['user_id'] != user_id:
                    return {
                        'statusCode': 403,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Нет доступа'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "UPDATE playlist_movies SET movie_id = NULL WHERE playlist_id = %s AND movie_id = %s",
                    (playlist_id, movie_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Фильм удалён из подборки'}),
                    'isBase64Encoded': False
                }
            
            elif playlist_id:
                cursor.execute(
                    "SELECT user_id FROM playlists WHERE id = %s",
                    (playlist_id,)
                )
                playlist = cursor.fetchone()
                
                if not playlist or playlist['user_id'] != user_id:
                    return {
                        'statusCode': 403,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Нет доступа'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("UPDATE playlists SET title = NULL WHERE id = %s", (playlist_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Подборка удалена'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
