import json
import os
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User authentication, registration and profile management
    Args: event - dict with httpMethod, body, headers
          context - object with request_id, function_name
    Returns: HTTP response with user data and JWT token
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    
    if method == 'GET':
        headers = event.get('headers', {})
        token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Authentication required'}),
                'isBase64Encoded': False
            }
        
        try:
            decoded = jwt.decode(token, jwt_secret, algorithms=['HS256'])
            user_id = decoded['user_id']
        except:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid token'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            query_params = event.get('queryStringParameters') or {}
            target_user_id = query_params.get('user_id')
            
            if target_user_id:
                cursor.execute(
                    "SELECT id, username, email, role, avatar_url, age, bio, status, created_at FROM users WHERE id = %s",
                    (target_user_id,)
                )
            else:
                cursor.execute(
                    "SELECT id, username, email, role, avatar_url, age, bio, status, created_at FROM users WHERE id = %s",
                    (user_id,)
                )
            
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'role': user.get('role', 'user'),
                    'avatar_url': user['avatar_url'],
                    'age': user['age'],
                    'bio': user['bio'],
                    'status': user['status'],
                    'created_at': user['created_at'].isoformat() if user['created_at'] else None
                }),
                'isBase64Encoded': False
            }
        finally:
            cursor.close()
            conn.close()
    
    if method == 'PUT':
        headers = event.get('headers', {})
        token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Authentication required'}),
                'isBase64Encoded': False
            }
        
        try:
            decoded = jwt.decode(token, jwt_secret, algorithms=['HS256'])
            user_id = decoded['user_id']
        except:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid token'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        
        username = body_data.get('username', '').strip()
        avatar_url = body_data.get('avatar_url', '').strip()
        age = body_data.get('age')
        bio = body_data.get('bio', '').strip()
        status = body_data.get('status', '').strip()
        
        if age is not None and (not isinstance(age, int) or age < 0 or age > 150):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Некорректный возраст'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            if username:
                cursor.execute(
                    "SELECT id FROM users WHERE username = %s AND id != %s",
                    (username, user_id)
                )
                if cursor.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Имя пользователя уже занято'}),
                        'isBase64Encoded': False
                    }
            
            update_fields = []
            update_values = []
            
            if username:
                update_fields.append("username = %s")
                update_values.append(username)
            
            if avatar_url:
                update_fields.append("avatar_url = %s")
                update_values.append(avatar_url)
            
            if age is not None:
                update_fields.append("age = %s")
                update_values.append(age)
            
            if bio:
                update_fields.append("bio = %s")
                update_values.append(bio)
            
            if status:
                update_fields.append("status = %s")
                update_values.append(status)
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            update_values.append(user_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s RETURNING id, username, email, avatar_url, age, bio, status, created_at"
            cursor.execute(query, update_values)
            user = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'avatar_url': user['avatar_url'],
                    'age': user['age'],
                    'bio': user['bio'],
                    'status': user['status'],
                    'created_at': user['created_at'].isoformat() if user['created_at'] else None
                }),
                'isBase64Encoded': False
            }
        finally:
            cursor.close()
            conn.close()
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    db_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET')
    
    if not db_url or not jwt_secret:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Server configuration error'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if action == 'register':
            email = body_data.get('email', '').lower().strip()
            password = body_data.get('password', '')
            username = body_data.get('username', '').strip()
            
            if not email or not password or not username:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Все поля обязательны для заполнения'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute(
                "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id, email, username, created_at",
                (email, password_hash, username)
            )
            user = cursor.fetchone()
            conn.commit()
            
            token = jwt.encode({
                'user_id': user['id'],
                'email': user['email'],
                'exp': datetime.utcnow() + timedelta(days=30)
            }, jwt_secret, algorithm='HS256')
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'username': user['username']
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            email = body_data.get('email', '').lower().strip()
            password = body_data.get('password', '')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Email и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute(
                "SELECT id, email, username, role FROM users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Неверный email или пароль'}),
                    'isBase64Encoded': False
                }
            
            token = jwt.encode({
                'user_id': user['id'],
                'email': user['email'],
                'exp': datetime.utcnow() + timedelta(days=30)
            }, jwt_secret, algorithm='HS256')
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'username': user['username'],
                        'role': user.get('role', 'user')
                    }
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Unknown action'}),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()