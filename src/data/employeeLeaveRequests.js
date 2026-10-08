export const getEmployeeLeaveStorageKey = (employeeKey) =>
  `employee-leave-requests:${encodeURIComponent(employeeKey)}`;

export const loadEmployeeLeaveRequests = (employeeKey) => {
  if (!employeeKey) throw new Error("An employee identity is required.");

  const stored = localStorage.getItem(getEmployeeLeaveStorageKey(employeeKey));
  const requests = stored ? JSON.parse(stored) : [];
  if (!Array.isArray(requests)) {
    throw new Error("Saved leave requests have an invalid format.");
  }

  return requests.filter((request) => request?.employeeKey === employeeKey);
};
