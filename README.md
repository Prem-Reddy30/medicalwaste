# AI-Based Medical Waste Management System

A full-stack web application for managing medical waste with AI-powered detection capabilities.

## Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + MongoDB
- **AI Service**: Python FastAPI with YOLOv8
- **Charts**: Recharts

## Features

- Role-based views (Admin/Compounder) without authentication
- Camera-based waste detection using AI
- Image upload for waste classification
- Comprehensive dashboard with analytics
- Chatbot for assistance
- Dark mode support
- Responsive design

## Project Structure

```
medical/
├── client/          # React frontend
├── server/          # Node.js backend
├── ai-service/      # Python FastAPI AI service
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- MongoDB

### Easy Startup (Recommended)

#### Windows Users:
```bash
# Run the startup script
start-services.bat

# To stop all services
stop-services.bat
```

#### Linux/Mac Users:
```bash
# Make scripts executable (first time only)
chmod +x start-services.sh stop-services.sh

# Run the startup script
./start-services.sh

# To stop all services
./stop-services.sh
```

### Manual Installation & Setup

1. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install AI Service Dependencies**
   ```bash
   cd ai-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Manual Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

3. **Start AI Service**
   ```bash
   cd ai-service
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python main.py
   ```

4. **Start Frontend**
   ```bash
   cd client
   npm run dev
   ```

The application will be available at `http://localhost:5173`

### Docker Setup (Alternative)

```bash
# Build and run all services
docker-compose up -d

# To stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **AI Service**: http://localhost:8000
- **Health Check**: http://localhost:5000/api/health

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/medical-waste
PORT=5000
AI_SERVICE_URL=http://localhost:8000
```

### AI Service (.env)
```
MODEL_PATH=models/yolov8n.pt
```

## API Endpoints

### Backend
- `POST /api/waste` - Add waste entry
- `GET /api/waste` - Get all waste entries
- `GET /api/analytics` - Get analytics data

### AI Service
- `POST /predict` - Predict waste type from image

## Waste Types Detected

- Syringe
- Mask
- Gloves
- Medicine bottle

## License

MIT
