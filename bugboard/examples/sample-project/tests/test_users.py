from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_register_and_get_user():
    res = client.post("/users/register", json={"username": "alice", "email": "alice@example.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"

    user_id = data["id"]
    get_res = client.get(f"/users/{user_id}")
    assert get_res.status_code == 200
    assert get_res.json()["username"] == "alice"
