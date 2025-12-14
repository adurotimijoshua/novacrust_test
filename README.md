# SETUP GUIDE
## This guide will help you set up the project on your local machine.

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v6 or higher)
- Git
- docker desktop (for running the postgres database), i used postgres becase i was having issues with sqlite dependencies and it was taking too long to resolve.
- The project does not use and external environment variables, all configurations are done within the codebase for simplicity.


### Installation Steps
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
    ```
   
2. **Install Dependencies**
   ```bash
   pnpm install
   ```
   
3. **Set Up the Database**
   - Make sure Docker is running on your machine.
   - Start a PostgreSQL container:
   ```bash
   docker-compose up -d
   ```
   - The database configuration is already set in the codebase. No additional setup is required.
 4. ** Run the Application
   ```bash
    pnpm start:dev
   ```
   
## API Documentation Link
- Once the application is running, you can access the API postman documentation at:
    ```
    https://documenter.getpostman.com/view/43568208/2sB3dTsT1Y
    ```
- This documentation provides details about the available endpoints, request/response formats, error samples, success responses, and other relevant information.