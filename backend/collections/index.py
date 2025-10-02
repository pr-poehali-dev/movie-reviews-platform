import json
import os
import jwt
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user movie collections
    Args: event - dict with httpMethod, body, headers
          context - object with request_id, function_name
    Returns: HTTP response with collection data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
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
    
    db_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET')
    
    if not db_url or not jwt_secret:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Server configuration error'}),
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
        if method == 'GET':
            cursor.execute(
                "SELECT * FROM user_collections WHERE user_id = %s ORDER BY added_at DESC",
                (user_id,)
            )
            collections = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'collections': [dict(c) for c in collections]}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            movie_id = body_data.get('movie_id')
            movie_title = body_data.get('movie_title')
            movie_genre = body_data.get('movie_genre')
            movie_rating = body_data.get('movie_rating')
            movie_image = body_data.get('movie_image')
            movie_description = body_data.get('movie_description')
            
            if not movie_id or not movie_title:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'movie_id и movie_title обязательны'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT id FROM user_collections WHERE user_id = %s AND movie_id = %s",
                (user_id, movie_id)
            )
            existing = cursor.fetchone()
            
            if existing:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Фильм уже в коллекции'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """INSERT INTO user_collections 
                   (user_id, movie_id, movie_title, movie_genre, movie_rating, movie_image, movie_description) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s) 
                   RETURNING *""",
                (user_id, movie_id, movie_title, movie_genre, movie_rating, movie_image, movie_description)
            )
            new_collection = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'collection': dict(new_collection)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            movie_id = query_params.get('movie_id')
            
            if not movie_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'movie_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT * FROM user_collections WHERE user_id = %s AND movie_id = %s",
                (user_id, int(movie_id))
            )
            collection = cursor.fetchone()
            
            if not collection:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Фильм не найден в коллекции'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "UPDATE user_collections SET movie_id = NULL WHERE user_id = %s AND movie_id = %s",
                (user_id, int(movie_id))
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'Фильм удалён из коллекции'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()
