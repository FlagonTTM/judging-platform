from fastapi.testclient import TestClient


def test_register_login_me_logout(client: TestClient):
    r = client.post(
        "/api/v1/auth/register",
        json={"email": "a@b.c", "password": "qwerty123", "name": "A", "role": "admin"},
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["email"] == "a@b.c"
    assert body["role"] == "admin"

    r = client.get("/api/v1/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == "a@b.c"

    r = client.post("/api/v1/auth/logout")
    assert r.status_code == 204

    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401

    r = client.post("/api/v1/auth/login", json={"email": "a@b.c", "password": "qwerty123"})
    assert r.status_code == 200


def test_register_duplicate(client: TestClient):
    payload = {"email": "dup@b.c", "password": "qwerty123", "name": "X", "role": "team"}
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 409


def test_login_wrong_password(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={"email": "w@b.c", "password": "qwerty123", "name": "W", "role": "judge"},
    )
    r = client.post("/api/v1/auth/login", json={"email": "w@b.c", "password": "nope12345"})
    assert r.status_code == 401
