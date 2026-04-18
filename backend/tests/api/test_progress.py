from fastapi.testclient import TestClient


def _bootstrap(client: TestClient) -> tuple[str, str, str, str]:
    client.post("/api/v1/auth/register", json={
        "email": "admin@x.y", "password": "qwerty123", "name": "A", "role": "admin",
    })
    event_id = client.post("/api/v1/events", json={
        "name": "E", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    }).json()["id"]
    team_id = client.post(f"/api/v1/events/{event_id}/teams", json={
        "name": "Alpha", "contacts": {"owner_email": "owner@x.y"},
    }).json()["id"]
    s1 = client.post(
        f"/api/v1/events/{event_id}/stages", json={"name": "Идея", "order": 0}
    ).json()["id"]
    s2 = client.post(
        f"/api/v1/events/{event_id}/stages", json={"name": "MVP", "order": 1}
    ).json()["id"]
    client.post("/api/v1/auth/logout")
    return event_id, team_id, s1, s2


def _login_team(client: TestClient, email: str = "owner@x.y") -> None:
    client.post("/api/v1/auth/register", json={
        "email": email, "password": "qwerty123", "name": "T", "role": "team",
    })


def test_owner_can_set_status(client: TestClient):
    _, team_id, s1, _ = _bootstrap(client)
    _login_team(client)
    r = client.put(f"/api/v1/teams/{team_id}/progress", json={
        "stage_id": s1, "status": "in_progress",
    })
    assert r.status_code == 200, r.text
    items = {i["stage_id"]: i for i in r.json()["items"]}
    assert items[s1]["status"] == "in_progress"


def test_non_owner_team_cannot_set(client: TestClient):
    _, team_id, s1, _ = _bootstrap(client)
    client.post("/api/v1/auth/register", json={
        "email": "stranger@x.y", "password": "qwerty123", "name": "X", "role": "team",
    })
    r = client.put(f"/api/v1/teams/{team_id}/progress", json={
        "stage_id": s1, "status": "in_progress",
    })
    assert r.status_code == 403


def test_judge_can_view_event_progress(client: TestClient):
    event_id, team_id, s1, _ = _bootstrap(client)
    _login_team(client)
    client.put(f"/api/v1/teams/{team_id}/progress", json={
        "stage_id": s1, "status": "done",
    })
    client.post("/api/v1/auth/logout")
    client.post("/api/v1/auth/register", json={
        "email": "j@x.y", "password": "qwerty123", "name": "J", "role": "judge",
    })
    r = client.get(f"/api/v1/events/{event_id}/progress")
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 1
    statuses = {i["stage_id"]: i["status"] for i in rows[0]["items"]}
    assert statuses[s1] == "done"


def test_invalid_stage_for_team_event_rejected(client: TestClient):
    _, team_id, _, _ = _bootstrap(client)
    client.post("/api/v1/auth/register", json={
        "email": "a2@x.y", "password": "qwerty123", "name": "A2", "role": "admin",
    })
    other_event = client.post("/api/v1/events", json={
        "name": "E2", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    }).json()["id"]
    other_stage = client.post(
        f"/api/v1/events/{other_event}/stages", json={"name": "X", "order": 0}
    ).json()["id"]
    client.post("/api/v1/auth/logout")
    _login_team(client)
    r = client.put(f"/api/v1/teams/{team_id}/progress", json={
        "stage_id": other_stage, "status": "done",
    })
    assert r.status_code == 422
