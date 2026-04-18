from fastapi.testclient import TestClient


def _bootstrap(client: TestClient) -> tuple[str, str, list[str]]:
    client.post("/api/v1/auth/register", json={
        "email": "admin@x.y", "password": "qwerty123", "name": "A", "role": "admin",
    })
    event_id = client.post("/api/v1/events", json={
        "name": "E", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    }).json()["id"]
    team_id = client.post(f"/api/v1/events/{event_id}/teams", json={"name": "Alpha"}).json()["id"]
    c1 = client.post(f"/api/v1/events/{event_id}/criteria", json={
        "name": "Tech", "weight": 40, "max_score": 10,
    }).json()["id"]
    c2 = client.post(f"/api/v1/events/{event_id}/criteria", json={
        "name": "UX", "weight": 60, "max_score": 10,
    }).json()["id"]
    client.post("/api/v1/auth/logout")
    return event_id, team_id, [c1, c2]


def _login_judge(client: TestClient, email: str = "judge@x.y") -> None:
    client.post("/api/v1/auth/register", json={
        "email": email, "password": "qwerty123", "name": "J", "role": "judge",
    })


def test_upsert_then_submit(client: TestClient):
    _, team_id, [c1, c2] = _bootstrap(client)
    _login_judge(client)

    r = client.put(f"/api/v1/teams/{team_id}/scores", json={
        "items": [
            {"criterion_id": c1, "value": 8, "comment": "good tech"},
            {"criterion_id": c2, "value": 7},
        ],
    })
    assert r.status_code == 200, r.text
    assert all(s["status"] == "draft" for s in r.json())

    r = client.put(f"/api/v1/teams/{team_id}/scores", json={
        "items": [{"criterion_id": c1, "value": 9}],
    })
    assert r.status_code == 200
    me = client.get(f"/api/v1/teams/{team_id}/scores/me").json()
    by_crit = {s["criterion_id"]: s for s in me}
    assert float(by_crit[c1]["value"]) == 9

    r = client.post(f"/api/v1/teams/{team_id}/scores/submit")
    assert r.status_code == 200
    assert all(s["status"] == "submitted" for s in r.json())


def test_value_out_of_range(client: TestClient):
    _, team_id, [c1, _] = _bootstrap(client)
    _login_judge(client)
    r = client.put(f"/api/v1/teams/{team_id}/scores", json={
        "items": [{"criterion_id": c1, "value": 99}],
    })
    assert r.status_code == 422


def test_submit_requires_all_criteria(client: TestClient):
    _, team_id, [c1, _] = _bootstrap(client)
    _login_judge(client)
    client.put(f"/api/v1/teams/{team_id}/scores", json={
        "items": [{"criterion_id": c1, "value": 5}],
    })
    r = client.post(f"/api/v1/teams/{team_id}/scores/submit")
    assert r.status_code == 422


def test_cannot_edit_after_submit(client: TestClient):
    _, team_id, [c1, c2] = _bootstrap(client)
    _login_judge(client)
    client.put(f"/api/v1/teams/{team_id}/scores", json={
        "items": [
            {"criterion_id": c1, "value": 5},
            {"criterion_id": c2, "value": 5},
        ],
    })
    client.post(f"/api/v1/teams/{team_id}/scores/submit")
    r = client.put(f"/api/v1/teams/{team_id}/scores", json={
        "items": [{"criterion_id": c1, "value": 9}],
    })
    assert r.status_code == 422


def test_team_role_cannot_score(client: TestClient):
    _, team_id, [c1, _] = _bootstrap(client)
    client.post("/api/v1/auth/register", json={
        "email": "t@x.y", "password": "qwerty123", "name": "T", "role": "team",
    })
    r = client.put(f"/api/v1/teams/{team_id}/scores", json={
        "items": [{"criterion_id": c1, "value": 5}],
    })
    assert r.status_code == 403
