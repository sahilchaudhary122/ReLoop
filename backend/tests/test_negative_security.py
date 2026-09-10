import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(username, password="password"):
    res = client.post("/api/v1/auth/login", data={"username": username, "password": password})
    return res.json()["access_token"]

def test_unauthenticated_requests_denied():
    # 401 Unauthorized when no token provided
    res1 = client.get("/api/v1/citizens/me/pickups")
    assert res1.status_code == 401

    res2 = client.get("/api/v1/aggregator/dashboard")
    assert res2.status_code == 401

    res3 = client.get("/api/v1/compliance/report")
    assert res3.status_code == 401

def test_forged_or_invalid_jwt_denied():
    fake_headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature"}
    res = client.get("/api/v1/citizens/me/pickups", headers=fake_headers)
    assert res.status_code == 401

def test_client_side_role_spoofing_prevented():
    citizen_token = get_token("citizen@demo.com")
    headers = {"Authorization": f"Bearer {citizen_token}"}

    # Citizen attempting admin assign endpoint with client payload
    res = client.post("/api/v1/pickups/1/assign?collector_id=2", headers=headers)
    assert res.status_code == 403
    assert "Only administrators" in res.json()["detail"]

def test_cross_role_access_denials():
    citizen_token = get_token("citizen@demo.com")
    collector_token = get_token("collector@demo.com")
    aggregator_token = get_token("aggregator@demo.com")
    recycler_token = get_token("recycler@demo.com")

    # 1. Citizen cannot receive or verify batches at Aggregator dock
    res_agg = client.post(
        "/api/v1/batches/1/receive",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={"latitude": 12.97, "longitude": 77.59}
    )
    assert res_agg.status_code == 403

    # 2. Collector cannot view compliance report
    res_comp = client.get(
        "/api/v1/compliance/report",
        headers={"Authorization": f"Bearer {collector_token}"}
    )
    assert res_comp.status_code == 403

    # 3. Recycler cannot create citizen pickup
    res_pick = client.post(
        "/api/v1/pickups",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={"latitude": 12.97, "longitude": 77.59, "description": "old laptop"}
    )
    assert res_pick.status_code == 403
