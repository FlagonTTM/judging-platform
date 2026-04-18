from fastapi.testclient import TestClient


def _admin_event(client: TestClient) -> str:
    client.post("/api/v1/auth/register", json={
        "email": "a@x.y", "password": "qwerty123", "name": "A", "role": "admin",
    })
    return client.post("/api/v1/events", json={
        "name": "E", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    }).json()["id"]


def test_leaderboard_hidden_by_default(client: TestClient) -> None:
    event_id = _admin_event(client)
    client.post("/api/v1/auth/logout")
    r = client.get(f"/api/v1/events/{event_id}/leaderboard")
    assert r.status_code == 403


def test_leaderboard_visible_after_flag(client: TestClient) -> None:
    event_id = _admin_event(client)
    r = client.patch(f"/api/v1/events/{event_id}", json={"leaderboard_public": True})
    assert r.status_code == 200 and r.json()["leaderboard_public"] is True
    client.post("/api/v1/auth/logout")
    r = client.get(f"/api/v1/events/{event_id}/leaderboard")
    assert r.status_code == 200


def test_admin_sees_leaderboard_even_if_hidden(client: TestClient) -> None:
    event_id = _admin_event(client)
    r = client.get(f"/api/v1/events/{event_id}/leaderboard")
    assert r.status_code == 200
