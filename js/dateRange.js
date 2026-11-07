// Date helper from the original class starter project (preserved behavior).
// APOD begins on June 16, 1995; the default range includes the most recent 9 days.
const earliestDate = '1995-06-16';
const today = new Date().toISOString().split('T')[0];

function setupDateInputs(startInput, endInput) {
  startInput.min = earliestDate;
  startInput.max = today;
  endInput.min = earliestDate;
  endInput.max = today;

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 8);
  startInput.value = lastWeek.toISOString().split('T')[0];
  endInput.value = today;

  startInput.addEventListener('change', () => {
    if (!startInput.value) return;
    const startDate = new Date(startInput.value);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 8);
    endInput.value = endDate > new Date(today) ? today : endDate.toISOString().split('T')[0];
  });
}
