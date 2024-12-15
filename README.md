<div align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="SQL"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</div>

# TravelBase

👋 Welcome to TravelBase - A Full Stack Vacation Manager! This application is built with React for the frontend, Express with JWT tokens for session management and middleware, and MySQL for data storage.

![TravelBase Demo](./assets/output.gif)

### Admin Dashboard:
  🔧 Create, Read, Update, and Delete vacation packages
  
  👥 Manage user accounts
  
  📊 View analytics and reports

### User Dashboard:
  🗺️ Browse vacation packages
  
  🔍 Sort and filter options
  
  ⭐ Create and manage wishlist
  
  📌 Track favorite destinations

Added Socket.IO for direct server-to-frontend communication, specifically for handling JWT token refresh. This bypasses multiple route handlers and simplifies token management by emitting new access tokens directly from the authentication middleware

Added Tailwind CSS breakpoints for responsive design across common screen sizes, while acknowledging device coverage limitations.

## Docker Setup (Recommended)
1. Clone the repository
2. Run `docker-compose up`
3. Wait for MySQL initialization (Could take up to 5 minutes)

## Known Issues & Challenges

### Frontend Route Protection Limitations
- Client-side code remains exposed to user inspection/modification
- Role-based UI elements can be accessed by determined users
- Solution: Focus on backend security while maintaining basic frontend guards
- Implementation: Verify roles on mount, use obscure role names, ensure critical operations require server validation

### JWT Authorization Header Bug
- Authorization header strips all content except 'Bearer' and single token
- Multiple tokens or custom text in header get removed unexpectedly
- Solution: Send tokens in request body instead of Authorization header



