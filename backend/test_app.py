import pytest
import json
from app import app, db, Task

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_get_tasks_empty(client):
    """Test getting tasks when none exist"""
    response = client.get('/api/tasks')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data == []

def test_create_task(client):
    """Test creating a new task"""
    task_data = {
        'title': 'Test Task',
        'description': 'This is a test task'
    }
    response = client.post('/api/tasks', 
                          data=json.dumps(task_data),
                          content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Test Task'
    assert data['description'] == 'This is a test task'
    assert data['completed'] == False

def test_create_task_missing_title(client):
    """Test creating task without title"""
    task_data = {'description': 'No title task'}
    response = client.post('/api/tasks',
                          data=json.dumps(task_data),
                          content_type='application/json')
    assert response.status_code == 400

def test_update_task(client):
    """Test updating a task"""
    # First create a task
    task_data = {'title': 'Original Task', 'description': 'Original description'}
    response = client.post('/api/tasks',
                          data=json.dumps(task_data),
                          content_type='application/json')
    task_id = json.loads(response.data)['id']
    
    # Update the task
    update_data = {'title': 'Updated Task', 'completed': True}
    response = client.put(f'/api/tasks/{task_id}',
                         data=json.dumps(update_data),
                         content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Updated Task'
    assert data['completed'] == True

def test_delete_task(client):
    """Test deleting a task"""
    # First create a task
    task_data = {'title': 'Task to Delete'}
    response = client.post('/api/tasks',
                          data=json.dumps(task_data),
                          content_type='application/json')
    task_id = json.loads(response.data)['id']
    
    # Delete the task
    response = client.delete(f'/api/tasks/{task_id}')
    assert response.status_code == 200
    
    # Verify it's deleted
    response = client.get('/api/tasks')
    data = json.loads(response.data)
    assert len(data) == 0

def test_get_stats(client):
    """Test getting statistics"""
    # Create some tasks
    tasks = [
        {'title': 'Task 1', 'completed': True},
        {'title': 'Task 2', 'completed': False},
        {'title': 'Task 3', 'completed': True}
    ]
    
    for task in tasks:
        client.post('/api/tasks',
                   data=json.dumps(task),
                   content_type='application/json')
    
    response = client.get('/api/stats')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['total_tasks'] == 3
    assert data['completed_tasks'] == 2
    assert data['pending_tasks'] == 1
    assert data['completion_rate'] == 66.67
