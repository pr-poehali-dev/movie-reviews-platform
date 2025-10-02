import json
import os
import jwt
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin moderation of user playlists and reviews
    Args: event - dict with httpMethod, body, headers, queryStringParameters
          context - object with request_id, function_name
    Returns: HTTP response with moderation data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'admin':
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён. Требуются права администратора'}),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            content_type = query_params.get('type', 'playlists')
            status_filter = query_params.get('status', 'pending')
            
            if content_type == 'reviews':
                cursor.execute(
                    """SELECT r.*, u.username as author_name, u.avatar_url as author_avatar
                       FROM reviews r
                       LEFT JOIN users u ON r.user_id = u.id
                       WHERE r.status = %s
                       ORDER BY r.created_at ASC""",
                    (status_filter,)
                )
                reviews = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'reviews': [dict(r) for r in reviews]}, default=str),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute(
                    """SELECT p.*, u.username as author_name,
                       (SELECT COUNT(*) FROM playlist_movies WHERE playlist_id = p.id) as movies_count
                       FROM playlists p
                       LEFT JOIN users u ON p.user_id = u.id
                       WHERE p.status = %s
                       ORDER BY p.created_at ASC""",
                    (status_filter,)
                )
                playlists = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'playlists': [dict(p) for p in playlists]}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            content_type = body_data.get('type', 'playlist')
            
            if content_type == 'review':
                review_id = body_data.get('review_id')
                
                if not review_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'review_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                if action == 'approve':
                    cursor.execute(
                        """UPDATE reviews 
                           SET status = 'approved'
                           WHERE id = %s RETURNING *""",
                        (review_id,)
                    )
                    review = cursor.fetchone()
                    
                    cursor.execute(
                        """INSERT INTO notifications (user_id, type, title, message)
                           VALUES (%s, 'review_approved', %s, %s)""",
                        (
                            review['user_id'],
                            'Рецензия одобрена',
                            f"Ваша рецензия на \"{review['movie_title']}\" прошла модерацию и опубликована!"
                        )
                    )
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'message': 'Рецензия одобрена', 'review': dict(review)}, default=str),
                        'isBase64Encoded': False
                    }
                
                elif action == 'reject':
                    comment = body_data.get('comment', '')
                    cursor.execute(
                        """UPDATE reviews 
                           SET status = 'rejected', moderation_comment = %s
                           WHERE id = %s RETURNING *""",
                        (comment, review_id)
                    )
                    review = cursor.fetchone()
                    
                    notification_message = f"Ваша рецензия на \"{review['movie_title']}\" была отклонена модератором."
                    if comment:
                        notification_message += f" Причина: {comment}"
                    
                    cursor.execute(
                        """INSERT INTO notifications (user_id, type, title, message)
                           VALUES (%s, 'review_rejected', %s, %s)""",
                        (
                            review['user_id'],
                            'Рецензия отклонена',
                            notification_message
                        )
                    )
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'message': 'Рецензия отклонена', 'review': dict(review)}, default=str),
                        'isBase64Encoded': False
                    }
            
            else:
                playlist_id = body_data.get('playlist_id')
                
                if not playlist_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'playlist_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                if action == 'approve':
                    cursor.execute(
                        """UPDATE playlists 
                           SET status = 'approved', moderated_by = %s, moderated_at = NOW()
                           WHERE id = %s RETURNING *""",
                        (user_id, playlist_id)
                    )
                    playlist = cursor.fetchone()
                    
                    cursor.execute(
                        """INSERT INTO notifications (user_id, type, title, message, playlist_id)
                           VALUES (%s, 'playlist_approved', %s, %s, %s)""",
                        (
                            playlist['user_id'],
                            'Подборка одобрена',
                            f"Ваша подборка \"{playlist['title']}\" прошла модерацию и теперь доступна всем пользователям!",
                            playlist_id
                        )
                    )
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'message': 'Подборка одобрена', 'playlist': dict(playlist)}, default=str),
                        'isBase64Encoded': False
                    }
                
                elif action == 'reject':
                    comment = body_data.get('comment', '')
                    cursor.execute(
                        """UPDATE playlists 
                           SET status = 'rejected', moderation_comment = %s, 
                               moderated_by = %s, moderated_at = NOW()
                           WHERE id = %s RETURNING *""",
                        (comment, user_id, playlist_id)
                    )
                    playlist = cursor.fetchone()
                    
                    notification_message = f"Ваша подборка \"{playlist['title']}\" была отклонена модератором."
                    if comment:
                        notification_message += f" Причина: {comment}"
                    
                    cursor.execute(
                        """INSERT INTO notifications (user_id, type, title, message, playlist_id)
                           VALUES (%s, 'playlist_rejected', %s, %s, %s)""",
                        (
                            playlist['user_id'],
                            'Подборка отклонена',
                            notification_message,
                            playlist_id
                        )
                    )
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'message': 'Подборка отклонена', 'playlist': dict(playlist)}, default=str),
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