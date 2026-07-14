"use strict";

/*
  Annotation Review Dashboard
  Built with vanilla JavaScript.
*/

// Sample dataset
const samples = [
  {
    id: "SAMPLE-001",
    text: "The customer support team solved my issue quickly and professionally.",
  },
  {
    id: "SAMPLE-002",
    text: "The delivery arrived two days later than expected.",
  },
  {
    id: "SAMPLE-003",
    text: "The company released a new mobile application on Monday.",
  },
  {
    id: "SAMPLE-004",
    text: "I am extremely disappointed with the quality of this product.",
  },
  {
    id: "SAMPLE-005",
    text: "The interface is simple, attractive, and easy to navigate.",
  },
  {
    id: "SAMPLE-006",
    text: "The meeting has been moved from Tuesday to Thursday.",
  },
  {
    id: "SAMPLE-007",
    text: "I waited for over an hour and nobody responded to my request.",
  },
  {
    id: "SAMPLE-008",
    text: "The new update works much better than the previous version.",
  },
  {
    id: "SAMPLE-009",
    text: "The package contains three books and one notebook.",
  },
  {
    id: "SAMPLE-010",
    text: "The service was acceptable, although the response time could improve.",
  },
];

// Application state
let currentSampleIndex = 0;
let selectedLabel = "";
let annotations = loadAnnotations();

// Page elements
const sampleText = document.getElementById("sampleText");
const sampleId = document.getElementById("sampleId");
const currentSampleNumber = document.getElementById("currentSampleNumber");
const totalSamples = document.getElementById("totalSamples");
const completedCount = document.getElementById("completedCount");
const reviewedCount = document.getElementById("reviewedCount");
const remainingCount = document.getElementById("remainingCount");
const positiveCount = document.getElementById("positiveCount");
const neutralCount = document.getElementById("neutralCount");
const negativeCount = document.getElementById("negativeCount");
const flaggedCount = document.getElementById("flaggedCount");
const progressFill = document.getElementById("progressFill");
const confidenceInput = document.getElementById("confidence");
const confidenceValue = document.getElementById("confidenceValue");
const ambiguousCheckbox = document.getElementById("ambiguous");
const reviewNotes = document.getElementById("reviewNotes");
const statusMessage = document.getElementById("statusMessage");
const submitButton = document.getElementById("submitButton");
const skipButton = document.getElementById("skipButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const historyTableBody = document.getElementById("historyTableBody");
const labelButtons = document.querySelectorAll(".label-button");

// Load saved annotations from the browser
function loadAnnotations() {
  try {
    const savedAnnotations = localStorage.getItem(
      "annotationDashboardRecords"
    );

    return savedAnnotations ? JSON.parse(savedAnnotations) : [];
  } catch (error) {
    console.error("Unable to load saved annotations:", error);
    return [];
  }
}

// Save annotations in the browser
function saveAnnotations() {
  try {
    localStorage.setItem(
      "annotationDashboardRecords",
      JSON.stringify(annotations)
    );
  } catch (error) {
    console.error("Unable to save annotations:", error);
  }
}

// Display the current sample
function displayCurrentSample() {
  if (currentSampleIndex >= samples.length) {
    showCompletionScreen();
    return;
  }

  const currentSample = samples[currentSampleIndex];

  sampleText.textContent = currentSample.text;
  sampleId.textContent = currentSample.id;
  currentSampleNumber.textContent = currentSampleIndex + 1;
  totalSamples.textContent = samples.length;

  resetForm();
  updateStatistics();
}

// Select a sentiment label
function selectLabel(event) {
  selectedLabel = event.currentTarget.dataset.label;

  labelButtons.forEach((button) => {
    const isSelected = button.dataset.label === selectedLabel;

    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  showStatus(`${selectedLabel} label selected.`, "success");
}

// Submit an annotation
function submitAnnotation() {
  if (currentSampleIndex >= samples.length) {
    showStatus("All samples have already been reviewed.", "warning");
    return;
  }

  if (!selectedLabel) {
    showStatus(
      "Please select Positive, Neutral, or Negative before submitting.",
      "error"
    );
    return;
  }

  const currentSample = samples[currentSampleIndex];

  const annotation = {
    sampleId: currentSample.id,
    text: currentSample.text,
    label: selectedLabel,
    confidence: Number(confidenceInput.value),
    flagged: ambiguousCheckbox.checked,
    notes: reviewNotes.value.trim(),
    reviewedAt: new Date().toISOString(),
  };

  // Replace an old record if this sample was previously reviewed
  const existingIndex = annotations.findIndex(
    (item) => item.sampleId === currentSample.id
  );

  if (existingIndex >= 0) {
    annotations[existingIndex] = annotation;
  } else {
    annotations.push(annotation);
  }

  saveAnnotations();
  currentSampleIndex += 1;

  showStatus("Annotation submitted successfully.", "success");

  window.setTimeout(() => {
    displayCurrentSample();
  }, 400);
}

// Skip the current sample
function skipSample() {
  if (currentSampleIndex >= samples.length) {
    showStatus("There are no remaining samples to skip.", "warning");
    return;
  }

  currentSampleIndex += 1;
  displayCurrentSample();
  showStatus("Sample skipped.", "warning");
}

// Reset the annotation form
function resetForm() {
  selectedLabel = "";
  confidenceInput.value = "3";
  confidenceValue.textContent = "3";
  ambiguousCheckbox.checked = false;
  reviewNotes.value = "";

  labelButtons.forEach((button) => {
    button.classList.remove("active");
    button.setAttribute("aria-pressed", "false");
  });

  clearStatus();
}

// Update confidence number
function updateConfidenceValue() {
  confidenceValue.textContent = confidenceInput.value;
}

// Update dashboard statistics
function updateStatistics() {
  const totalReviewed = annotations.length;

  const totalPositive = annotations.filter(
    (item) => item.label === "Positive"
  ).length;

  const totalNeutral = annotations.filter(
    (item) => item.label === "Neutral"
  ).length;

  const totalNegative = annotations.filter(
    (item) => item.label === "Negative"
  ).length;

  const totalFlagged = annotations.filter(
    (item) => item.flagged
  ).length;

  const remaining = Math.max(samples.length - totalReviewed, 0);

  reviewedCount.textContent = totalReviewed;
  completedCount.textContent = totalReviewed;
  positiveCount.textContent = totalPositive;
  neutralCount.textContent = totalNeutral;
  negativeCount.textContent = totalNegative;
  flaggedCount.textContent = totalFlagged;
  remainingCount.textContent = remaining;
  totalSamples.textContent = samples.length;

  const progressPercentage =
    samples.length === 0
      ? 0
      : Math.min((totalReviewed / samples.length) * 100, 100);

  progressFill.style.width = `${progressPercentage}%`;

  const progressBar = progressFill.parentElement;

  if (progressBar) {
    progressBar.setAttribute(
      "aria-valuenow",
      String(Math.round(progressPercentage))
    );
  }

  renderHistory();
}

// Display submitted annotations
function renderHistory() {
  historyTableBody.innerHTML = "";

  if (annotations.length === 0) {
    const emptyRow = document.createElement("tr");

    emptyRow.innerHTML = `
      <td colspan="4">No annotations submitted yet.</td>
    `;

    historyTableBody.appendChild(emptyRow);
    return;
  }

  const recentAnnotations = [...annotations].reverse().slice(0, 10);

  recentAnnotations.forEach((annotation) => {
    const row = document.createElement("tr");

    const sampleCell = document.createElement("td");
    const labelCell = document.createElement("td");
    const confidenceCell = document.createElement("td");
    const flaggedCell = document.createElement("td");

    sampleCell.textContent = annotation.sampleId;
    labelCell.textContent = annotation.label;
    confidenceCell.textContent = `${annotation.confidence}/5`;
    flaggedCell.textContent = annotation.flagged ? "Yes" : "No";

    row.append(
      sampleCell,
      labelCell,
      confidenceCell,
      flaggedCell
    );

    historyTableBody.appendChild(row);
  });
}

// Clear all saved annotations
function clearHistory() {
  const confirmed = window.confirm(
    "Are you sure you want to remove all saved annotations?"
  );

  if (!confirmed) {
    return;
  }

  annotations = [];
  currentSampleIndex = 0;

  localStorage.removeItem("annotationDashboardRecords");

  displayCurrentSample();
  showStatus("Annotation history cleared.", "success");
}

// Display completion message
function showCompletionScreen() {
  sampleId.textContent = "Completed";
  sampleText.textContent =
    "All available samples have been reviewed. You can clear the history to begin again.";

  currentSampleNumber.textContent = samples.length;
  totalSamples.textContent = samples.length;

  submitButton.disabled = true;
  skipButton.disabled = true;

  labelButtons.forEach((button) => {
    button.disabled = true;
  });

  updateStatistics();
  showStatus("Dataset review completed successfully.", "success");
}

// Enable buttons when starting or restarting
function enableControls() {
  submitButton.disabled = false;
  skipButton.disabled = false;

  labelButtons.forEach((button) => {
    button.disabled = false;
  });
}

// Show a status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

// Remove a status message
function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

// Event listeners
labelButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", selectLabel);
});

confidenceInput.addEventListener("input", updateConfidenceValue);
submitButton.addEventListener("click", submitAnnotation);
skipButton.addEventListener("click", skipSample);

clearHistoryButton.addEventListener("click", () => {
  clearHistory();
  enableControls();
});

// Start the application
displayCurrentSample();