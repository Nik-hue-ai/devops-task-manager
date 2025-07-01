# 🚀 DevOps Task Manager

A comprehensive full-stack application demonstrating modern DevOps practices with Docker, monitoring, and automated deployment. **Currently deployed and fully operational!**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Flask Backend │    │   PostgreSQL    │
│     (Port 3000)  │────│    (Port 5000)  │────│   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Docker Compose                     │
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │            Kubernetes Cluster                   │
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │         Prometheus + Grafana                    │
         └─────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Testing**: pytest, Jest

## 🎯 Current Status

✅ **FULLY DEPLOYED AND OPERATIONAL**

All services are running and accessible:
- **Frontend**: http://localhost:3000 (Task Management UI)
- **Backend API**: http://localhost:5000 (REST API)
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090 (Metrics)
- **Database**: localhost:5432 (PostgreSQL)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js & npm
- Python 3.9+
- kubectl (for Kubernetes)

### Local Development
```bash
# Clone the repository
git clone https://github.com/Nik-hue-ai/devops-task-manager.git
cd AutoDeploy-Hub

# Start all services
docker-compose up -d

# Access applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

### Manual Setup
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm start
```

## 📊 Monitoring

- **Grafana Dashboard**: http://localhost:3001
- **Prometheus Metrics**: http://localhost:9090
- **Application Health**: http://localhost:5000/health

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline automatically:
1. Runs tests on push/PR
2. Builds Docker images
3. Pushes to container registry
4. Deploys to Kubernetes (on main branch)

## 🐳 Docker Commands

```bash
# Build all images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services

# Access via port-forward
kubectl port-forward service/frontend-service 3000:3000
kubectl port-forward service/backend-service 5000:5000
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📈 Features

- ✅ Microservices architecture
- ✅ Containerized applications
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Kubernetes deployment
- ✅ Monitoring with Prometheus & Grafana
- ✅ Health checks and metrics
- ✅ Automated testing
- ✅ Environment-based configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
