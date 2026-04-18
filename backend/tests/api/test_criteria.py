from fastapi.testclient import TestClient


def _setup(client: TestClient) -> str:
    client.post("/api/v1/auth/register", json={
        "email": "a@b.c", "password": "qwerty123", "name": "A", "role": "admin",
    })
    r = client.post("/api/v1/events", json={
        "name": "E", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    })
    return r.json()["id"]


def test_criteria_crud(client: TestClient):
    event_id = _setup(client)
    r = client.post(f"/api/v1/events/{event_id}/criteria", json={
        "name": "Tech", "weight": 40, "max_score": 10,
    })
    assert r.status_code == 201, r.text
    crit_id = r.json()["id"]

    r = client.post(f"/api/v1/events/{event_id}/criteria", json={
        "name": "UX", "weight": 60, "max_score": 10,
    })
    assert r.status_code == 201

    r = client.get(f"/api/v1/events/{event_id}/criteria")
    assert r.status_code == 200 and len(r.json()) == 2

    r = client.patch(f"/api/v1/criteria/{crit_id}", json={"name": "Technical"})
    assert r.status_code == 200 and r.json()["name"] == "Technical"


def test_criteria_weight_overflow(client: TestClient):
    event_id = _setup(client)
    client.post(f"/api/v1/events/{event_id}/criteria", json={
        "name": "A", "weight": 70, "max_score": 10,
    })
    r = client.post(f"/api/v1/events/{event_id}/criteria", json={
        "name": "B", "weight": 40, "max_score": 10,
    })
    assert r.status_code == 409


def test_criteria_update_weight_overflow(client: TestClient):
    event_id = _setup(client)
    url = f"/api/v1/events/{event_id}/criteria"
    r1 = client.post(url, json={"name": "A", "weight": 50, "max_score": 10})
    client.post(url, json={"name": "B", "weight": 40, "max_score": 10})
    r = client.patch(f"/api/v1/criteria/{r1.json()['id']}", json={"weight": 80})
    assert r.status_code == 409
