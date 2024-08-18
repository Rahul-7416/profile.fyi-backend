# Profile.fyi-assignment - Backend

This is the backend repository for the Profile.fyi project. It provides secure API endpoints for managing user profiles, handling authentication, and serving data to the frontend application.

## Live Application

The backend server is live but cannot be accessed directly for security reasons. You can use the API through our frontend application: [Profile.fyi-assignment Live Website](https://profile-fyi-assignment-uf6f.onrender.com)

## Frontend Repository

The frontend of this application is available at: [Profile.fyi-assignment Frontend](https://github.com/Rahul-7416/profile.fyi-assignment)

## Features

- User Authentication (JWT-based)
- Profile Management API
- Data Validation and Error Handling
- Secure Communication with the Frontend

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens) for Authentication
- dotenv for Environment Variables

## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB installed locally or a MongoDB Atlas account

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Rahul-7416/profile.fyi-backend.git
    cd profile.fyi-backend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following:
    ```env
    PORT=3000
    MONGO_URI=<your-mongodb-uri>
    JWT_SECRET=<your-jwt-secret>
    ```

4. Run the server:
    ```bash
    npm start
    ```

5. The API will be running at `http://localhost:3000`.

## API Endpoints

- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/refresh-token` - refresh the tokens
- `POST /api/v1/users/logout` - User logout
- `GET /api/v1/products/` - Get cart products saved by user
- `POST /api/v1/products/add-product` - add a new product to the cart
- `PUT /api/v1/products/update-product` - Update any specific cart product
- `DELETE /api/v1/products/remove-product` - Delete any specific cart product

## Contributing

Feel free to fork this repository, make feature branches, and submit pull requests. All contributions are welcome!

## License

This project is licensed under the MIT License.
