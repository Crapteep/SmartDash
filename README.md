# SmartDash

## About the Project

This project was made available online as part of my master's thesis. While it is functional, there are several shortcomings, mostly aesthetic, due to time constraints that prevented further refinement. However, the project is accessible online and available for testing.

Link to the online version: [https://smartdash.netlify.app/](https://smartdash.netlify.app/)

## Installation and Setup

**Note:** This project uses Docker for easy setup and deployment.

1. **Clone the Repository and navigate to the project directory**

   ```bash
   git clone https://github.com/Crapteep/SmartDash.git
   cd SmartDash
   ```

2. **Configure Environment Variables**

   Create a `.env` file in the root directory of the project and add the following variables:

   ```bash
   # Backend
   DB_URL=mongodb://db:27017  # or use your own mongodb database address
   SECRET_KEY_USER=your_secret_key_for_users
   SECRET_KEY_DEVICE=your_secret_key_for_devices
   ACCESS_TOKEN_EXPIRE_MINUTES=10080  # token expires after 7 days
   BACKEND_CORS_ORIGINS=http://localhost:3000  # if you want to add more, separate with commas, e.g.: http://localhost:3000,http://localhost:8080
   DOCKER_IMAGE_BACKEND=my_default_backend_image
   PROJECT_NAME=SmartDash

   # Frontend
   VITE_API_URL=http://localhost:8000  # backend API URL
   TAG=latest
   DOCKER_IMAGE_FRONTEND=my_default_frontend_image
   ```

   Replace the placeholder values with your actual configuration.

   To generate secret keys for users and devices, you can use the following command:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Run this command twice to generate separate keys for `SECRET_KEY_USER` and `SECRET_KEY_DEVICE`.

3. **Run the Application**

   Use Docker Compose to build and run the application:

   ```bash
   docker-compose up --build
   ```

   This command will build the Docker images for both the frontend and backend, and start the containers.

4. **Accessing the Application**

   Once the containers are up and running:
   - The frontend will be available at `http://localhost:3000`
   - The backend API will be accessible at `http://localhost:8000`
   - The MongoDB database will be accessible at `mongodb://localhost:27017`

   Note: The database is also accessible within the Docker network at `mongodb://db:27017`, which is the address used by the backend service.

## Development

For development purposes, you can make changes to the code and Docker will automatically reload the applications.

## Stopping the Application

To stop the application, use:

```bash
docker-compose down
```

This will stop and remove the containers, but preserve your data volumes.

## Additional Notes

- Make sure you have Docker and Docker Compose installed on your system before starting.
- If you need to modify any configurations, update the `.env` file and rebuild the containers.
- For production deployment, ensure you update the environment variables accordingly, especially security-related ones like `SECRET_KEY_USER` and `SECRET_KEY_DEVICE`.
- To connect to the MongoDB database using a GUI tool like MongoDB Compass, use the connection string `mongodb://localhost:27017`.