from fastapi.testclient import TestClient


def _admin_event(client: TestClient) -> str:
    client.post("/api/v1/auth/register", json={
        "email": "a@b.c", "password": "qwerty123", "name": "A", "role": "admin",
    })
    return client.post("/api/v1/events", json={
        "name": "E", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    }).json()["id"]


def test_stages_crud(client: TestClient):
    event_id = _admin_event(client)
    r = client.post(f"/api/v1/events/{event_id}/stages", json={"name": "Идея", "order": 0})
    assert r.status_code == 201, r.text
    s_id = r.json()["id"]
    assert r.json()["name"] == "Идея"

    client.post(f"/api/v1/events/{event_id}/stages", json={"name": "Демо", "order": 1})

    r = client.get(f"/api/v1/events/{event_id}/stages")
    assert [s["name"] for s in r.json()] == ["Идея", "Демо"]

    r = client.patch(f"/api/v1/stages/{s_id}", json={"name": "Идея+"})
    assert r.json()["name"] == "Идея+"

    r = client.delete(f"/api/v1/stages/{s_id}")
    assert r.status_code == 204

    r = client.get(f"/api/v1/events/{event_id}/stages")
    assert len(r.json()) == 1


def test_stages_admin_only(client: TestClient):
    event_id = _admin_event(client)
    client.post("/api/v1/auth/logout")
    client.post("/api/v1/auth/register", json={
        "email": "j@x.y", "password": "qwerty123", "name": "J", "role": "judge",
    })
    r = client.post(f"/api/v1/events/{event_id}/stages", json={"name": "X", "order": 0})
    assert r.status_code == 403
