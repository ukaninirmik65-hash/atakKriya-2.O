import { useEffect, useState } from "react";
import LoadingState from "../../components/common/LoadingState";
import useEmployeeIdentity from "../../hook/useEmployeeIdentity";
import useToast from "../../hook/useToast";
import {
  EXPENSE_CATEGORIES,
  loadSalesExpenses,
  PAYMENT_METHODS,
  saveSalesExpenses,
} from "../../data/salesExpenses";

const MAX_RECEIPT_SIZE = 1024 * 1024;
const today = new Date();
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const initialForm = {
  date: todayKey,
  category: EXPENSE_CATEGORIES[0],
  amount: "",
  description: "",
  paymentMethod: PAYMENT_METHODS[0],
};

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

const formatCreatedDate = (timestamp) =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));

const statusClass = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Reimbursed: "bg-blue-50 text-blue-700",
};

const readReceipt = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("The selected receipt could not be read."));
        return;
      }
      resolve({ name: file.name, dataUrl: reader.result });
    };
    reader.onerror = () => reject(new Error("The selected receipt could not be read."));
    reader.readAsDataURL(file);
  });

const SalesExpenses = () => {
  const { employeeKey, employeeName, loading: authLoading } = useEmployeeIdentity();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return undefined;

    let active = true;
    Promise.resolve().then(() => {
      if (!employeeKey) {
        if (active) {
          setError("We could not identify your salesperson account. Please sign in again.");
          setLoading(false);
        }
        return;
      }

      try {
        const records = loadSalesExpenses(employeeKey);
        if (active) {
          setExpenses(records);
          setError("");
          setLoading(false);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Expenses could not be loaded from this browser.",
          );
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [authLoading, employeeKey]);

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0] || null;
    setError("");
    if (!file) {
      setReceipt(null);
      return;
    }

    const allowedType =
      file.type === "application/pdf" || file.type.startsWith("image/");
    if (!allowedType) {
      event.target.value = "";
      setReceipt(null);
      setError("Upload a receipt as a PDF or image file.");
      return;
    }
    if (file.size > MAX_RECEIPT_SIZE) {
      event.target.value = "";
      setReceipt(null);
      setError("Receipt files must be 1 MB or smaller.");
      return;
    }

    setReceipt(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");

    if (!employeeKey) {
      setError("We could not identify your salesperson account. Please sign in again.");
      return;
    }
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!form.date || !form.description.trim()) {
      setError("Enter the expense date and description.");
      return;
    }

    setSaving(true);
    try {
      const savedReceipt = receipt ? await readReceipt(receipt) : null;
      const newExpense = {
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        employeeKey,
        salesPersonName: employeeName,
        date: form.date,
        category: form.category,
        description: form.description.trim(),
        amount: Math.round(amount * 100) / 100,
        paymentMethod: form.paymentMethod,
        receipt: savedReceipt,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };
      const updatedExpenses = [newExpense, ...expenses];
      saveSalesExpenses(employeeKey, updatedExpenses);
      setExpenses(updatedExpenses);
      setForm(initialForm);
      setReceipt(null);
      formElement.reset();
      showToast("Expense added successfully.", { type: "success" });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The expense could not be saved. Check browser storage and try again.",
      );
      showToast("Unable to save the expense. Please try again.", {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState message="Loading your sales expenses…" />;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6" aria-label="Sales person expenses">
      <header>
        <p className="text-sm font-medium text-blue-600">Sales person self-service</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Sales expenses</h2>
        <p className="mt-1 text-sm text-slate-500">
          Record company-related expenses paid by you and review submitted records.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Add expense</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add the expense details and attach a receipt if you have one.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Expense date
            <input
              type="date"
              name="date"
              value={form.date}
              max={todayKey}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Category
            <select
              name="category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Amount
            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({ ...current, amount: event.target.value }))
              }
              placeholder="0.00"
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Payment method
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  paymentMethod: event.target.value,
                }))
              }
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Receipt / bill (optional)
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleReceiptChange}
              className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white text-sm file:mr-3 file:h-10 file:border-0 file:bg-slate-50 file:px-3 file:font-medium file:text-slate-700"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              PDF or image, up to 1 MB{receipt ? ` · ${receipt.name}` : ""}
            </span>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              maxLength={500}
              placeholder="Describe the company-related expense."
              required
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? "Saving…" : "Submit Expense"}
          </button>
        </div>
      </form>

      <section aria-labelledby="expense-history-heading" className="space-y-3">
        <div>
          <h3 id="expense-history-heading" className="text-lg font-semibold text-slate-900">
            Expense list
          </h3>
          <p className="text-sm text-slate-500">
            Expenses recorded for {employeeName}.
          </p>
        </div>
        {expenses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h4 className="font-semibold text-slate-800">No expenses yet</h4>
            <p className="mt-1 text-sm text-slate-500">
              Submitted expenses will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Expense date</th>
                  <th className="px-4 py-3">Sales person</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment method</th>
                  <th className="px-4 py-3">Receipt / bill</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="align-top text-slate-700">
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(expense.date)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{expense.salesPersonName}</td>
                    <td className="whitespace-nowrap px-4 py-3">{expense.category}</td>
                    <td className="max-w-xs px-4 py-3">{expense.description}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "INR",
                      }).format(expense.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{expense.paymentMethod}</td>
                    <td className="px-4 py-3">
                      {expense.receipt ? (
                        <a
                          href={expense.receipt.dataUrl}
                          download={expense.receipt.name}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-700 hover:underline"
                        >
                          View receipt
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusClass[expense.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatCreatedDate(expense.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default SalesExpenses;
