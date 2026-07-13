import pytest
from fastapi import HTTPException

import src.app as app_module


def test_signup_for_activity_adds_participant():
    # Arrange
    activity_name = "Programming Class"
    new_email = "unit.student@mergington.edu"

    # Act
    result = app_module.signup_for_activity(activity_name=activity_name, email=new_email)

    # Assert
    assert result == {"message": f"Signed up {new_email} for {activity_name}"}
    assert new_email in app_module.activities[activity_name]["participants"]


def test_signup_for_activity_raises_for_unknown_activity():
    # Arrange
    activity_name = "Unknown Club"
    new_email = "unit.student@mergington.edu"

    # Act
    with pytest.raises(HTTPException) as exc_info:
        app_module.signup_for_activity(activity_name=activity_name, email=new_email)

    # Assert
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Activity not found"


def test_signup_for_activity_raises_for_duplicate_participant():
    # Arrange
    activity_name = "Programming Class"
    existing_email = "emma@mergington.edu"

    # Act
    with pytest.raises(HTTPException) as exc_info:
        app_module.signup_for_activity(activity_name=activity_name, email=existing_email)

    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Student already signed up for this activity"


def test_unregister_from_activity_removes_participant():
    # Arrange
    activity_name = "Programming Class"
    existing_email = "emma@mergington.edu"

    # Act
    result = app_module.unregister_from_activity(activity_name=activity_name, email=existing_email)

    # Assert
    assert result == {"message": f"Removed {existing_email} from {activity_name}"}
    assert existing_email not in app_module.activities[activity_name]["participants"]


def test_unregister_from_activity_raises_for_unknown_activity():
    # Arrange
    activity_name = "Unknown Club"
    email = "unit.student@mergington.edu"

    # Act
    with pytest.raises(HTTPException) as exc_info:
        app_module.unregister_from_activity(activity_name=activity_name, email=email)

    # Assert
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Activity not found"


def test_unregister_from_activity_raises_for_missing_participant():
    # Arrange
    activity_name = "Programming Class"
    email = "not.registered@mergington.edu"

    # Act
    with pytest.raises(HTTPException) as exc_info:
        app_module.unregister_from_activity(activity_name=activity_name, email=email)

    # Assert
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Participant not found for this activity"
