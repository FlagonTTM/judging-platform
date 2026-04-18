from fastapi.testclient import TestClient


def _login_admin(client: TestClient) -> None:
    client.post("/api/v1/auth/register", json={
        "email": "admin@b.c", "password": "qwerty123", "name": "Admin", "role": "admin",
    })


def _login_team(client: TestClient) -> None:
    client.post("/api/v1/auth/register", json={
        "email": "team@b.c", "password": "qwerty123", "name": "T", "role": "team",
    })


def test_event_crud_admin(client: TestClient):
    _login_admin(client)
    r = client.post("/api/v1/events", json={
        "name": "TulaHack", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    })
    assert r.status_code == 201, r.text
    event_id = r.json()["id"]

    r = client.get("/api/v1/events")
    assert r.status_code == 200 and len(r.json()) == 1

    r = client.patch(f"/api/v1/events/{event_id}", json={"name": "TulaHack 2026"})
    assert r.status_code == 200 and r.json()["name"] == "TulaHack 2026"

    r = client.delete(f"/api/v1/events/{event_id}")
    assert r.status_code == 204


def test_event_create_forbidden_for_team(client: TestClient):
    _login_team(client)
    r = client.post("/api/v1/events", json={
        "name": "X", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    })
    assert r.status_code == 403


def test_event_create_unauthorized(client: TestClient):
    r = client.post("/api/v1/events", json={
        "name": "X", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    })
    assert r.status_code == 401
