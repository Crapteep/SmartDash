## Installation
**Note:** Depending on your operating system, you may need to use `python3` instead of `python` - mainly on MacOS and Linux.
<br />
<br/>

1. **Clone the Repository and navigate to the project directory**
```bash
git clone https://github.com/Crapteep/SmartDash.git
cd SmartDash
```
<br />

2. **Create and activate Virtual Environment (optional):**
```bash
python -m venv venv  # or use your preferred name for the virtual environment
source venv/bin/activate  # On MacOS and Linux
venv\Scripts\activate  # On Windows

```
<br />

3. **Install Backend Dependencies:**
```bash
pip install -r backend/requirements.txt
```
<br />

4. **Install Frontend Dependencies:**
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```
<br />

5. **Set Up Environment Variables:**

**Backend Configuration:**

**For Development: `backend/.env`**

```bash
ENV_NAME=development
DB_URL=<database_URL>
SECRET_KEY_USER=<secret_key_for_users>
SECRET_KEY_DEVICE=<secret_key_for_devices>
ALGORITHM=<preferred_algorithm>
ACCESS_TOKEN_EXPIRE_MINUTES=<login_token_expiry_time_in_minutes>
```

**For Production: `backend/.env.production`**

```bash
ENV_NAME=production
DB_URL=<database_URL>
SECRET_KEY=<secret_key>
ALGORITHM=<preferred_algorithm>
ACCESS_TOKEN_EXPIRE_MINUTES=<token_expiry_time_in_minutes>
CLIENT_URL=<client_URL>
```


**Frontend Configuration:**

**`frontend/.env`**

```bash
VITE_APP_ENV=DEV
VITE_APP_API_URL=<your_API_URL>
PUBLIC_URL=<public_URL>
```
<br />


6. **Run the Backend Server:**

**To run the backend server, execute the following command in your terminal:**

```bash
# For development with automatic code reloading
uvicorn backend.app.main:app --reload  

# For production deployment with specified host and port
uvicorn backend.app.main:app --host 0.0.0.0 --port 10000

```
<br />

7. **Run the Frontend Development Server:**

**Navigate to the frontend directory:**

```bash
cd frontend
```

**Then run the development server:**
```bash
# Running a development server with automatic code reloading
npm run dev

# Running a development server with access to all devices on the local network
npm run dev -- --host 0.0.0.0
```
<br />

8. **Build the Frontend (Optional):**

If you want to build the frontend for production, execute:

```bash
npm install -g serve

npm run build

```
This will create a production-ready frontend build in the frontend/dist directory.

<br />

9. **Run the Built Frontend Server:**

After building the server, navigate to the built frontend directory:

```bash
cd dist

```

Then run an HTTP server, for example using http-server:

```bash
serve

```

Make sure the chosen port is not occupied, otherwise, you will need to use another free port.
After completing these steps, the built frontend server should be available at the chosen URL in your web browser.