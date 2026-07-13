document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const toastPopup = document.getElementById("toast-popup");
  let toastTimer;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, type = "success") {
    if (!toastPopup) {
      return;
    }

    toastPopup.textContent = message;
    toastPopup.classList.remove("hidden", "success", "error", "show");
    toastPopup.classList.add(type, "show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastPopup.classList.remove("show");
      setTimeout(() => {
        toastPopup.classList.add("hidden");
      }, 220);
    }, 2600);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch(`/activities?ts=${Date.now()}`, { cache: "no-store" });
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participantsMarkup = details.participants.length
          ? `
            <ul class="participants-list">
              ${details.participants
                .map(
                  (participant) => `
                    <li class="participant-item">
                      <span class="participant-email">${escapeHtml(participant)}</span>
                      <button
                        type="button"
                        class="delete-participant-btn"
                        data-activity="${encodeURIComponent(name)}"
                        data-email="${encodeURIComponent(participant)}"
                        aria-label="Remove ${escapeHtml(participant)} from ${escapeHtml(name)}"
                        title="Remove participant"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                        </svg>
                      </button>
                    </li>
                  `
                )
                .join("")}
            </ul>
          `
          : `<p class="no-participants">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-title"><strong>Participants</strong></p>
            ${participantsMarkup}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);

      if (response.ok) {
        await fetchActivities();
      }
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".delete-participant-btn");
    if (!deleteButton) {
      return;
    }

    const encodedActivity = deleteButton.dataset.activity;
    const encodedEmail = deleteButton.dataset.email;
    if (!encodedActivity || !encodedEmail) {
      return;
    }

    const activityName = decodeURIComponent(encodedActivity);
    const participantEmail = decodeURIComponent(encodedEmail);

    try {
      const response = await fetch(
        `/activities/${encodedActivity}/participants?email=${encodedEmail}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        await fetchActivities();
        showToast(result.message, "success");
      } else {
        messageDiv.textContent = result.detail || "Unable to remove participant.";
        messageDiv.className = "error";
        showToast(messageDiv.textContent, "error");
      }
    } catch (error) {
      messageDiv.textContent = `Failed to remove ${participantEmail} from ${activityName}.`;
      messageDiv.className = "error";
      console.error("Error unregistering participant:", error);
      showToast(messageDiv.textContent, "error");
    }

    messageDiv.classList.remove("hidden");
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  });

  // Initialize app
  fetchActivities();
});
