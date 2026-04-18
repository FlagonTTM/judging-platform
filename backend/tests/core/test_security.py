import pytest

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_round_trip():
    h = hash_password("qwerty123")
    assert verify_password("qwerty123", h)
    assert not verify_password("wrong", h)


def test_token_round_trip():
    token = create_access_token("user-1", "admin")
    payload = decode_access_token(token)
    assert payload["sub"] == "user-1"
    assert payload["role"] == "admin"


def test_token_invalid():
    with pytest.raises(ValueError):
        decode_access_token("garbage")
