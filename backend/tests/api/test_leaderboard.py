from fastapi.testclient import TestClient


def _setup_event(client: TestClient) -> tuple[str, list[str], list[str]]:
    client.post("/api/v1/auth/register", json={
        "email": "admin@x.y", "password": "qwerty123", "name": "A", "role": "admin",
    })
    event_id = client.post("/api/v1/events", json={
        "name": "E", "start_at": "2026-04-17T21:00:00Z", "end_at": "2026-04-19T13:00:00Z",
    }).json()["id"]
    t_alpha = client.post(f"/api/v1/events/{event_id}/teams", json={"name": "Alpha"}).json()["id"]
    t_beta = client.post(f"/api/v1/events/{event_id}/teams", json={"name": "Beta"}).json()["id"]
    c_tech = client.post(f"/api/v1/events/{event_id}/criteria", json={
        "name": "Tech", "weight": 40, "max_score": 10,
    }).json()["id"]
    c_ux = client.post(f"/api/v1/events/{event_id}/criteria", json={
        "name": "UX", "weight": 60, "max_score": 10,
    }).json()["id"]
    client.patch(f"/api/v1/events/{event_id}", json={"leaderboard_public": True})
    client.post("/api/v1/auth/logout")
    return event_id, [t_alpha, t_beta], [c_tech, c_ux]


def _judge_submits(
    client: TestClient,
    email: str,
    team_id: str,
    crits: list[str],
    values: list[int],
) -> None:
    client.post("/api/v1/auth/register", json={
        "email": email, "password": "qwerty123", "name": email, "role": "judge",
    })
    client.put(f"/api/v1/teams/{team_id}/scores", json={
        "items": [{"criterion_id": cid, "value": v} for cid, v in zip(crits, values, strict=True)],
    })
    client.post(f"/api/v1/teams/{team_id}/scores/submit")
    client.post("/api/v1/auth/logout")


def test_leaderboard_orders_by_final_score(client: TestClient):
    event_id, [alpha, beta], crits = _setup_event(client)

    # Alpha: judge1 8/7 → 32+42 = 74
    _judge_submits(client, "j1@x.y", alpha, crits, [8, 7])
    # Alpha: judge2 6/9 → 24+54 = 78; avg = 76
    _judge_submits(client, "j2@x.y", alpha, crits, [6, 9])
    # Beta: judge1 5/5 → 20+30 = 50
    _judge_submits(client, "j3@x.y", beta, crits, [5, 5])

    r = client.get(f"/api/v1/events/{event_id}/leaderboard")
    assert r.status_code == 200
    rows = r.json()
    assert [r["team_name"] for r in rows] == ["Alpha", "Beta"]
    assert float(rows[0]["final_score"]) == 76.0
    assert rows[0]["judges_count"] == 2
    assert float(rows[1]["final_score"]) == 50.0
    assert rows[1]["judges_count"] == 1


def test_leaderboard_ignores_drafts(client: TestClient):
    event_id, [alpha, _], crits = _setup_event(client)
    client.post("/api/v1/auth/register", json={
        "email": "j@x.y", "password": "qwerty123", "name": "J", "role": "judge",
    })
    client.put(f"/api/v1/teams/{alpha}/scores", json={
        "items": [{"criterion_id": cid, "value": 10} for cid in crits],
    })

    r = client.get(f"/api/v1/events/{event_id}/leaderboard")
    rows = {r["team_name"]: r for r in r.json()}
    assert float(rows["Alpha"]["final_score"]) == 0.0
    assert rows["Alpha"]["judges_count"] == 0


def test_leaderboard_skips_partial_judges(client: TestClient):
    event_id, [alpha, _], crits = _setup_event(client)
    client.post("/api/v1/auth/register", json={
        "email": "j@x.y", "password": "qwerty123", "name": "J", "role": "judge",
    })
    client.put(f"/api/v1/teams/{alpha}/scores", json={
        "items": [{"criterion_id": crits[0], "value": 10}],
    })

    r = client.get(f"/api/v1/events/{event_id}/leaderboard")
    alpha_row = next(r for r in r.json() if r["team_name"] == "Alpha")
    assert alpha_row["judges_count"] == 0
