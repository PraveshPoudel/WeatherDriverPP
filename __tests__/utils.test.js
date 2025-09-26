function groupAlertsBySeverity(alerts) {
  return alerts.reduce((acc, a) => {
    (acc[a.severity] ||= []).push(a);
    return acc;
  }, {});
}

test("groupAlertsBySeverity groups correctly", () => {
  const g = groupAlertsBySeverity([{ severity: "Severe" }, { severity: "Severe" }, { severity: "Moderate" }]);
  expect(g.Severe).toHaveLength(2);
  expect(g.Moderate).toHaveLength(1);
});

test("groupAlertsBySeverity handles empty", () => {
  expect(groupAlertsBySeverity([])).toEqual({});
});
