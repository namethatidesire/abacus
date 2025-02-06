import sqlite3
import hashlib
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_database(database):
    conn = sqlite3.connect(database)
    cursor = conn.cursor()
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

    conn.commit()
    conn.close()

def run_server(host="localhost", port=8080, database="databases/accounts.db"):
    """
    Starts the AccountService server.

    Args:
        host (str): The host IP address. Defaults to "localhost".
        port (int): The port number. Defaults to 8080.
    """
    config = ServiceConfig()
    server = HTTPServer((config.host, config.port), AccountHandler)
    logger.info(f"Starting AccountService on {host}:{port}")

    create_database(database)
    server.serve_forever()

class ServiceConfig:
    """
    Handles the configuration of service endpoints.

    Attributes:
        config (dict): The configuration loaded from the JSON file.
        host (str): The host IP address for the AccountService server.
        port (int): The port number for the AccountService server.
    """

    def __init__(self, config_path="configs\\accountservice.json"):
        """
        Initializes the ServiceConfig by loading the configuration from the specified JSON file.

        Parameters:
            config_path (str): Path to the configuration JSON file. Defaults to "config.json".
        """
        
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        # Get AccountService config
        self.host = self.config.get("ip", "localhost")
        self.port = self.config.get("port", 8080)

class AccountHandler(BaseHTTPRequestHandler):
    """
    Handles incoming HTTP requests and forwards them to the appropriate service.

    Attributes:
        config (ServiceConfig): The service configuration.
    """

    def __init__(self, *args, **kwargs):
        """
        Initializes the ISCSHandler with the service configuration.
        """
        self.database = "databases/accounts.db"
        self.config = ServiceConfig()
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
        Handles GET requests and forwards them to the appropriate service.
        """

        path = urlparse(self.path).path
        response, code = "", -1
        
        if path.startswith('/username/'):
            
            username = path[10:]

            if not username:
                username = ""

            response, code = self.get_users(username, self.database)

        elif path.startswith('/account/'):
            response, code = self.get_account(path[9:], self.database)
            
        else:
            response, code = "Invalid path", 404

        # Send response back
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))
    
    def do_POST(self):
        """
        Handles POST requests processes them.
        """
        try:
            # Read body for POST requests
            body = json.loads(self._read_body())
            response, code = "", -1

            if(body['command'] == 'create'):
                response, code = self.create_user(body['username'], body['password'], body['email'], self.database)
            
            if(body['command'] == 'authenticate'):
                response, code = self.authenticate_user(body['username'], body['password'], self.database)
            
            if(body['command'] == 'delete'):
                response, code = self.delete_user(body['username'], body['password'], self.database)

             # Send response back
            self.send_response(code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response.encode('utf-8'))

        except Exception as e:
            logger.error(f"Error forwarding request: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")
        


    def create_user(self, username, password, email, database):
        conn = sqlite3.connect(database)
        cursor = conn.cursor()
        
        # Hash the password for security
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        response = ("", -1)
        try:
            cursor.execute("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)", 
                        (username, password_hash, email))
            conn.commit()
            response = ("User registered successfully!", 200)
        except sqlite3.IntegrityError:
            response =  ("Error: Username or email already exists.", 404)
        
        conn.close()
        return response

    def authenticate_user(self, username, password, database):
        conn = sqlite3.connect(database)
        cursor = conn.cursor()
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        cursor.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", (username, password_hash))
        user = cursor.fetchone()
        conn.close()
        if user:
            return ("Login successful!", 200)
        else:
            return ("Invalid username or password.", 403)
        
    def delete_user(self, username, password, database):
        # Authenticate user first
        auth_response, status_code = self.authenticate_user(username, password, database)

        if status_code != 200:
            return ("Error: Invalid username or password.", 403)

        conn = sqlite3.connect(database)
        cursor = conn.cursor()

        try:
            # Delete the user after successful authentication
            cursor.execute("DELETE FROM users WHERE username = ?", (username,))
            conn.commit()
            response = ("User deleted successfully!", 200)

        except sqlite3.Error as e:
            response = (f"Database error: {e}", 500)

        finally:
            conn.close()

        return response
    
    def get_users(self, username, database):
        conn = sqlite3.connect(database)
        cursor = conn.cursor()

        try:
            # Retrieve user details, excluding password_hash
            cursor.execute("SELECT id, username, email FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()

            if user:
                user_data = {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                }
                response = (json.dumps(user_data), 200)

            elif not user:
                response = self.GET_all(database)

            else:
                response = (json.dumps({"error": "Account not found"}), 404)

        except sqlite3.Error as e:
            response = (json.dumps({"error": f"Database error: {e}"}), 500)

        finally:
            conn.close()

        return response
    
    def get_account(self, id, database):
        # make a connection to the database
        conn = sqlite3.connect(database)
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT id, username, email FROM users WHERE id = ?", (id,))
            account = cursor.fetchone()

            if account:
                account_data = {
                    "id": account[0],
                    "username": account[1],
                    "email": account[2],
                }
                # save a response code and data 
                response = (json.dumps(account_data), 200)
            else:
                response = (json.dumps({"error": "Account not found"}), 404)

        except sqlite3.Error as e:
            response = (json.dumps({"error": f"Database error: {e}"}), 500)
        
        finally:
            conn.close()
        
        return response
    

    def GET_all(self, database):
        """
        Retrieves all user data from the Database when no specific username is provided.
        """
        path = urlparse(self.path).path
        response = ("", -1)
        conn = sqlite3.connect(database)
        cursor = conn.cursor()

        try:
            if path == "/username/":  # No specific username provided
                # Retrieve all user data from the users table
                cursor.execute("SELECT id, username, email FROM users")
                users = cursor.fetchall()
                
                users_data = [{"id": row[0], "username": row[1], "email": row[2]} for row in users]
                response= (json.dumps(users_data), 200)

            # Send response back to the client
            return response

        except sqlite3.Error as e:
            response = (json.dumps({"error": str(e)}), 500)


if __name__ == "__main__":
    run_server()

# # Example usage
# create_user("testuser", "securepassword", "test@example.com", database)

# authenticate_user("testuser", "securepassword", database)






