export const EXPENSE_CATEGORIES = [
  "Travel",
  "Fuel",
  "Food",
  "Hotel/Stay",
  "Parking",
  "Toll",
  "Customer Meeting",
  "Other",
];

export const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Other"];

const getStorageKey = (employeeKey) =>
  `sales-expenses:${encodeURIComponent(employeeKey)}`;

const isExpenseRecord = (expense) =>
  expense &&
  typeof expense.id === "string" &&
  typeof expense.employeeKey === "string" &&
  typeof expense.salesPersonName === "string" &&
  typeof expense.date === "string" &&
  EXPENSE_CATEGORIES.includes(expense.category) &&
  typeof expense.description === "string" &&
  Number.isFinite(expense.amount) &&
  typeof expense.paymentMethod === "string" &&
  typeof expense.status === "string" &&
  typeof expense.createdAt === "string" &&
  (expense.receipt === null ||
    (expense.receipt &&
      typeof expense.receipt.name === "string" &&
      typeof expense.receipt.dataUrl === "string"));

export const loadSalesExpenses = (employeeKey) => {
  if (!employeeKey) throw new Error("A salesperson identity is required.");

  const stored = localStorage.getItem(getStorageKey(employeeKey));
  if (!stored) return [];

  let records;
  try {
    records = JSON.parse(stored);
  } catch {
    throw new Error("Saved expenses could not be read because their data is invalid.");
  }

  if (!Array.isArray(records) || !records.every(isExpenseRecord)) {
    throw new Error("Saved expenses have an invalid format.");
  }

  return records.filter((expense) => expense.employeeKey === employeeKey);
};

export const saveSalesExpenses = (employeeKey, expenses) => {
  if (!employeeKey) throw new Error("A salesperson identity is required.");
  localStorage.setItem(getStorageKey(employeeKey), JSON.stringify(expenses));
};
