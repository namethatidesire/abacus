import sqlite3


def create_user(conn, cursor, username, date, title, description, type, database):
    conn = sqlite3.connect(database)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO events (username, date, title, description, type) VALUES (?, ?, ?, ?, ?)", 
                       (username, date, title, description, type))
        conn.commit()
        print("Event added successfully!")
    except sqlite3.IntegrityError:
        print("Error: A similar event already exists.")
    
    conn.close()


def checkIfEventExists(username, date, title):
    conn = sqlite3.connect(database)
    cursor = conn.cursor()
        
    cursor.execute("SELECT * FROM events WHERE username = ? AND date = ? AND title = ?", (username, date, title))
    event = cursor.fetchone()
    
    if event:
        print("Event exists!")
        return True
    else:
        print("No matching event found.")
        return False


def create_database(conn, cursor):
    # Create events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
        )
    ''')


database = "Databases/calendar.db"
# Connect to (or create) the database
conn = sqlite3.connect(database)
cursor = conn.cursor()

create_database(conn, cursor)
# Example usage
# create_user(conn, cursor, "testuser", "today", "test@example.com", database)

# authenticate_user("testuser", "securepassword", database)

# conn.commit()
# conn.close()







