import sqlite3
import hashlib
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_database(database):
    os.makedirs("databases", exist_ok=True)
    conn = sqlite3.connect(database)
    cursor = conn.cursor()
    
    # Create events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            accountId INTEGER NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL CHECK(date LIKE '__-__-____'),
            time TEXT NOT NULL CHECK(time LIKE '__:__'),
            recurring TEXT NOT NULL CHECK(recurring IN ('true', 'false')),
            color TEXT NOT NULL CHECK(color LIKE '#______')
        )
    ''')
    
    conn.commit()
    conn.close()

def run_server(host="localhost", port=8081, database="db/events.db"):
    """
    Starts the EventService server.

    Args:
        host (str): The host IP address. Defaults to "localhost".
        port (int): The port number. Defaults to 8080.
        database (str): The path to the SQLite database. Defaults to "databases/events.db".
    """
    print("Current Working Directory:", os.getcwd())
    
    config = ServiceConfig()
    server = HTTPServer((config.host, config.port), EventHandler)
    logger.info(f"Starting EventService on {host}:{port}")

    create_database(database)
    server.serve_forever()

class ServiceConfig:
    """
    Handles the configuration of service endpoints.

    Attributes:
        config (dict): The configuration loaded from the JSON file.
        host (str): The host IP address for the EventService server.
        port (int): The port number for the EventService server.
    """

    def __init__(self, config_path="../configs/accountservice.json"):
        """
        Initializes the ServiceConfig by loading the configuration from the specified JSON file.

        Parameters:
            config_path (str): Path to the configuration JSON file. Defaults to "configs/eventService.json".
        """
        
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        # Get EventService config
        self.host = self.config.get("ip", "localhost")
        self.port = self.config.get("port", 8080)

class EventHandler(BaseHTTPRequestHandler):
    """
    Handles incoming HTTP requests and processes them according to the EventService API.
    """

    def __init__(self, *args, **kwargs):
        """
        Initializes the EventHandler with the service configuration.
        """
        self.database = "databases/events.db"
        super().__init__(*args, **kwargs)

    def _set_cors_headers(self):
        """Sets CORS headers for preflight and actual requests."""
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow all origins (Change * to a specific domain if needed)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def _read_body(self):
        """
        Reads the body of the HTTP request.

        Returns:
            str: The body content as a string.
        """
        content_length = int(self.headers.get('Content-Length', 0))
        return self.rfile.read(content_length).decode('utf-8')
    
    def do_OPTIONS(self):
        """Handles preflight requests."""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        """
        Handles GET requests and processes them according to the EventService API.
        """
        path = urlparse(self.path).path
        response, code = "", -1
        
        if path.startswith('/event/'):
            event_id = path.split('/')[-1]
            response, code = self.get_event_by_id(event_id)
        elif path == '/event':
            response, code = self.get_all_events()
        elif path.startswith('/date/'):
            date = path.split('/')[-1]
            response, code = self.get_events_by_date(date)
        elif path.startswith('/account/'):
            account_id = path.split('/')[-1]
            response, code = self.get_events_by_account(account_id)
        else:
            response, code = "Invalid path", 404

        # Send response back
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()  # Set CORS headers for GET requests
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))
    
    def do_POST(self):
        """
        Handles POST requests and processes them according to the EventService API.
        """
        try:
            # Read body for POST requests
            body = json.loads(self._read_body())
            response, code = "", -1

            if body['command'] == 'create':
                response, code = self.create_event(body)
            elif body['command'] == 'update':
                response, code = self.update_event(body)
            elif body['command'] == 'delete':
                response, code = self.delete_event(body)
            else:
                response, code = "Invalid command", 400

            # Send response back
            self.send_response(code)
            self.send_header('Content-Type', 'application/json')
            self._set_cors_headers()  # Set CORS headers for POST requests
            self.end_headers()
            self.wfile.write(response.encode('utf-8'))

        except Exception as e:
            logger.error(f"Error processing request: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")
    
    def get_event_by_id(self, event_id):
        conn = sqlite3.connect(self.database)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        event = cursor.fetchone()
        conn.close()
        
        if event:
            event_data = {
                "id": event[0],
                "accountId": event[1],
                "title": event[2],
                "date": event[3],
                "time": event[4],
                "recurring": event[5],
                "color": event[6]
            }
            return json.dumps(event_data), 200
        else:
            return json.dumps({"error": "Event not found"}), 404
    
    def get_all_events(self):
        conn = sqlite3.connect(self.database)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM events")
        events = cursor.fetchall()
        conn.close()
        
        event_list = []
        for event in events:
            event_data = {
                "id": event[0],
                "accountId": event[1],
                "title": event[2],
                "date": event[3],
                "time": event[4],
                "recurring": event[5],
                "color": event[6]
            }
            event_list.append(event_data)
        
        return json.dumps({"events": event_list}), 200
    
    def get_events_by_date(self, date):
        conn = sqlite3.connect(self.database)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM events WHERE date = ?", (date,))
        events = cursor.fetchall()
        conn.close()
        
        event_list = []
        for event in events:
            event_data = {
                "id": event[0],
                "accountId": event[1],
                "title": event[2],
                "date": event[3],
                "time": event[4],
                "recurring": event[5],
                "color": event[6]
            }
            event_list.append(event_data)
        
        return json.dumps({"events": event_list}), 200
    
    def get_events_by_account(self, account_id):
        conn = sqlite3.connect(self.database)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM events WHERE accountId = ?", (account_id,))
        events = cursor.fetchall()
        conn.close()
        
        event_list = []
        for event in events:
            event_data = {
                "id": event[0],
                "accountId": event[1],
                "title": event[2],
                "date": event[3],
                "time": event[4],
                "recurring": event[5],
                "color": event[6]
            }
            event_list.append(event_data)
        
        return json.dumps({"events": event_list}), 200
    
    def create_event(self, body):
        required_fields = ['accountId', 'title', 'date', 'recurring']
        if not all(field in body for field in required_fields):
            return "Missing required fields for create command", 400
        
        conn = sqlite3.connect(self.database)
        cursor = conn.cursor()
        
        try:
            cursor.execute("INSERT INTO events (accountId, title, date, time, recurring, color) VALUES (?, ?, ?, ?, ?, ?)",
                           (body['accountId'], body['title'], body['date'], body.get('time', '00:00'), body.get('recurring', 'false'), body.get('color', '#ADD8E6')))
            conn.commit()
            return "Event created successfully!", 200
        except sqlite3.Error as e:
            return f"Database error: {e}", 500
        finally:
            conn.close()
    
    def update_event(self, body):
        if 'id' not in body:
            return "Missing event ID for update command", 400
        
        conn = sqlite3.connect(self.database)
        cursor = conn.cursor()
        
        try:
            update_fields = []
            update_values = []
            for field in ['accountId', 'title', 'date', 'time', 'recurring', 'color']:
                if field in body:
                    update_fields.append(f"{field} = ?")
                    update_values.append(body[field])
            
            if not update_fields:
                return "No fields to update", 400
            
            update_values.append(body['id'])
            cursor.execute(f"UPDATE events SET {', '.join(update_fields)} WHERE id = ?", update_values)
            conn.commit()
            return "Event updated successfully!", 200
        except sqlite3.Error as e:
            return f"Database error: {e}", 500
        finally:
            conn.close()
    
    def delete_event(self, body):
        if 'id' not in body:
            return "Missing event ID for delete command", 400
        
        conn = sqlite3.connect(self.database)
        cursor = conn.cursor()
        
        try:
            # Check if the event exists
            cursor.execute("SELECT id FROM events WHERE id = ?", (body['id'],))
            event = cursor.fetchone()
            
            if not event:
                return "Event does not exist", 404
            
            # If the event exists, delete it
            cursor.execute("DELETE FROM events WHERE id = ?", (body['id'],))
            conn.commit()
            return "Event deleted successfully!", 200
        except sqlite3.Error as e:
            return f"Database error: {e}", 500
        finally:
            conn.close()

if __name__ == "__main__":
    run_server()