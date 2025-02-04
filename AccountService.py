import sqlite3
import hashlib

def create_user(conn, cursor, username, password, email, database):
    conn = sqlite3.connect(database)
    cursor = conn.cursor()
    
    # Hash the password for security
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        cursor.execute("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)", 
                       (username, password_hash, email))
        conn.commit()
        print("User registered successfully!")
    except sqlite3.IntegrityError:
        print("Error: Username or email already exists.")
    
    conn.close()

def authenticate_user(username, password, database):
    conn = sqlite3.connect(database)
    cursor = conn.cursor()
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cursor.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", (username, password_hash))
    user = cursor.fetchone()
    
    if user:
        print("Login successful!")
        return True
    else:
        print("Invalid username or password.")
        return False




def create_database(conn, cursor):
    

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')


database = "Databases/accounts.db"

# Connect to (or create) the database
conn = sqlite3.connect(database)
cursor = conn.cursor()


create_database(conn, cursor)

# Example usage
create_user(conn, cursor, "testuser", "securepassword", "test@example.com", database)

authenticate_user("testuser", "securepassword", database)

conn.commit()
conn.close()







