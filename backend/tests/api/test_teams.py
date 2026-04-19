from fastapi.testclient import TestClient


def _setup(client: TestClient) -> str:
    client.post("/api/v1/auth/register", json={
        "email": "a@b.c", "password": "qwerty123", "name": "A", "role": "admin",
    })
    r = client.post("/api/v1/events", json={
        "name": "E", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    })
    return r.json()["id"]


def test_teams_crud(client: TestClient):
    event_id = _setup(client)
    r = client.post(f"/api/v1/events/{event_id}/teams", json={
        "name": "Alpha",
        "track": "AI",
        "members": [{"name": "Иван", "email": "i@x.y"}],
        "contacts": {"telegram": "@alpha"},
    })
    assert r.status_code == 201, r.text
    team_id = r.json()["id"]
    assert r.json()["members"][0]["name"] == "Иван"

    client.post(f"/api/v1/events/{event_id}/teams", json={"name": "Beta"})

    r = client.get(f"/api/v1/events/{event_id}/teams")
    assert r.status_code == 200 and len(r.json()) == 2

    r = client.patch(f"/api/v1/teams/{team_id}", json={"name": "Alpha+"})
    assert r.status_code == 200 and r.json()["name"] == "Alpha+"

    r = client.delete(f"/api/v1/teams/{team_id}")
    assert r.status_code == 204

    r = client.get(f"/api/v1/events/{event_id}/teams")
    assert len(r.json()) == 1


def test_teams_create_forbidden_for_team_role(client: TestClient):
    event_id = _setup(client)
    client.post("/api/v1/auth/logout")
    client.post("/api/v1/auth/register", json={
        "email": "t@b.c", "password": "qwerty123", "name": "T", "role": "team",
    })
    r = client.post(f"/api/v1/events/{event_id}/teams", json={"name": "X"})
    assert r.status_code == 403


def test_team_owner_marked_via_contacts(client: TestClient):
    event_id = _setup(client)
    r = client.post(f"/api/v1/events/{event_id}/teams", json={
        "name": "Owned", "contacts": {"owner_email": "owner@x.y"},
    })
    assert r.status_code == 201, r.text
    assert r.json()["contacts"]["owner_email"] == "owner@x.y"


def test_my_team_returns_owned_team(client: TestClient):
    event_id = _setup(client)
    client.post(f"/api/v1/events/{event_id}/teams", json={
        "name": "Mine", "contacts": {"owner_email": "owner@x.y"},
    })
    client.post("/api/v1/auth/logout")
    client.post("/api/v1/auth/register", json={
        "email": "owner@x.y", "password": "qwerty123", "name": "O", "role": "team",
    })
    r = client.get("/api/v1/me/team")
    assert r.status_code == 200 and r.json()["name"] == "Mine"


def test_my_team_returns_null_if_none(client: TestClient):
    _setup(client)
    client.post("/api/v1/auth/logout")
    client.post("/api/v1/auth/register", json={
        "email": "lonely@x.y", "password": "qwerty123", "name": "L", "role": "team",
    })
    r = client.get("/api/v1/me/team")
    assert r.status_code == 200 and r.json() is None


def test_get_team_by_id(client: TestClient):
    event_id = _setup(client)
    r = client.post(f"/api/v1/events/{event_id}/teams", json={
        "name": "TestTeam",
        "track": "Web",
        "members": [{"name": "John", "email": "j@x.y"}],
        "contacts": {"phone": "+123"},
    })
    assert r.status_code == 201, r.text
    team_id = r.json()["id"]

    r = client.get(f"/api/v1/teams/{team_id}")
    assert r.status_code == 200
    assert r.json()["name"] == "TestTeam"
    assert r.json()["id"] == team_id

    r = client.get("/api/v1/teams/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
