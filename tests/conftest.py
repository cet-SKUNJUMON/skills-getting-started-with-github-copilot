import copy

import pytest
from fastapi.testclient import TestClient

import src.app as app_module

BASELINE_ACTIVITIES = copy.deepcopy(app_module.activities)


@pytest.fixture
def client():
    return TestClient(app_module.app)


@pytest.fixture
def baseline_activities():
    return copy.deepcopy(BASELINE_ACTIVITIES)


@pytest.fixture(autouse=True)
def reset_activities():
    app_module.activities = copy.deepcopy(BASELINE_ACTIVITIES)
    yield
    app_module.activities = copy.deepcopy(BASELINE_ACTIVITIES)
