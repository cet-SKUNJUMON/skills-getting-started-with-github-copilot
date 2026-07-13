def test_get_activities_returns_activity_map(client):
    # Arrange
    expected_activity = "Chess Club"

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, dict)
    assert expected_activity in payload


def test_signup_adds_new_participant(client):
    # Arrange
    activity_name = "Programming Class"
    new_email = "new.student@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": new_email})

    # Assert
    assert response.status_code == 200
    assert response.json() == {"message": f"Signed up {new_email} for {activity_name}"}

    activities_response = client.get("/activities")
    participants = activities_response.json()[activity_name]["participants"]
    assert new_email in participants


def test_unregister_removes_existing_participant(client):
    # Arrange
    activity_name = "Programming Class"
    existing_email = "emma@mergington.edu"

    # Act
    response = client.delete(
        f"/activities/{activity_name}/participants",
        params={"email": existing_email},
    )

    # Assert
    assert response.status_code == 200
    assert response.json() == {"message": f"Removed {existing_email} from {activity_name}"}

    activities_response = client.get("/activities")
    participants = activities_response.json()[activity_name]["participants"]
    assert existing_email not in participants


def test_signup_returns_404_for_unknown_activity(client):
    # Arrange
    activity_name = "Unknown Club"
    new_email = "new.student@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": new_email})

    # Assert
    assert response.status_code == 404
    assert response.json() == {"detail": "Activity not found"}


def test_signup_returns_400_for_duplicate_participant(client):
    # Arrange
    activity_name = "Programming Class"
    existing_email = "emma@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": existing_email})

    # Assert
    assert response.status_code == 400
    assert response.json() == {"detail": "Student already signed up for this activity"}


def test_unregister_returns_404_for_missing_participant(client):
    # Arrange
    activity_name = "Programming Class"
    missing_email = "not.registered@mergington.edu"

    # Act
    response = client.delete(
        f"/activities/{activity_name}/participants",
        params={"email": missing_email},
    )

    # Assert
    assert response.status_code == 404
    assert response.json() == {"detail": "Participant not found for this activity"}
