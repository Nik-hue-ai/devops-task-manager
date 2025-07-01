from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import logging
from prometheus_flask_exporter import PrometheusMetrics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Prometheus metrics
metrics = PrometheusMetrics(app)

# Database configuration
database_url = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/autodeploy_db')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Routes
@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'connected'
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'disconnected',
            'error': str(e)
        }), 503

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    try:
        tasks = Task.query.all()
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        return jsonify({'error': 'Failed to fetch tasks'}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    try:
        data = request.get_json()
        
        if not data or not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        task = Task(
            title=data['title'],
            description=data.get('description', '')
        )
        
        db.session.add(task)
        db.session.commit()
        
        logger.info(f"Created task: {task.title}")
        return jsonify(task.to_dict()), 201
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create task'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'completed' in data:
            task.completed = data['completed']
        
        task.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Updated task: {task.title}")
        return jsonify(task.to_dict()), 200
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update task'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        
        logger.info(f"Deleted task: {task.title}")
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete task'}), 500

@app.route('/api/stats')
def get_stats():
    """Get application statistics"""
    try:
        total_tasks = Task.query.count()
        completed_tasks = Task.query.filter_by(completed=True).count()
        pending_tasks = total_tasks - completed_tasks
        
        return jsonify({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500

# Initialize database
@app.before_first_request
def create_tables():
    db.create_all()
    logger.info("Database tables created")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
