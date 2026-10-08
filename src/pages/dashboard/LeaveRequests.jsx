import { useEffect, useState } from "react";
import useEmployeeIdentity from "../../hook/useEmployeeIdentity";
import useToast from "../../hook/useToast";
import LoadingState from "../../components/common/LoadingState";
import {
  getEmployeeLeaveStorageKey,
  loadEmployeeLeaveRequests,
} from "../../data/employeeLeaveRequests";

const todayKey = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
};

const countWorkingDays = (start, end) => {
  if (!start || !end || end < start) return 0;
  const cursor = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  let days = 0;
  while (cursor <= last) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

const statusClass = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};

const LeaveRequests = () => {
  const { employeeKey, loading: authLoading } = useEmployeeIdentity();
  const { showToast } = useToast();
  const storageKey = employeeKey
    ? getEmployeeLeaveStorageKey(employeeKey)
    : null;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    leaveType: "Annual leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    if (authLoading) return undefined;

    let active = true;
    Promise.resolve().then(() => {
      if (!storageKey) {
        if (active) {
          setError("We could not identify your employee account. Please sign in again.");
          setLoading(false);
        }
        return;
      }

      try {
        const ownRequests = loadEmployeeLeaveRequests(employeeKey);
        if (active) {
          setRequests(ownRequests);
          setError("");
          setLoading(false);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof SyntaxError
              ? "Your saved leave requests could not be read."
              : "Leave requests are unavailable in this browser. Check your browser storage settings.",
          );
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [authLoading, employeeKey, storageKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!storageKey) {
      setError("We could not identify your employee account. Please sign in again.");
      return;
    }
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setError("Enter the leave dates and a reason before submitting.");
      return;
    }
    if (form.startDate < todayKey()) {
      setError("The start date cannot be in the past.");
      return;
    }
    if (form.endDate < form.startDate) {
      setError("The end date must be the same as or later than the start date.");
      return;
    }
    if (countWorkingDays(form.startDate, form.endDate) === 0) {
      setError("The selected dates do not include a working day.");
      return;
    }

    const nextRequest = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      employeeKey,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      workingDays: countWorkingDays(form.startDate, form.endDate),
      reason: form.reason.trim(),
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    const nextRequests = [nextRequest, ...requests];

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextRequests));
      setRequests(nextRequests);
      setForm({
        leaveType: "Annual leave",
        startDate: "",
        endDate: "",
        reason: "",
      });
      showToast("Leave request submitted successfully", { type: "success" });
    } catch {
      setError("Your request could not be saved. Check browser storage and try again.");
    }
  };

  if (authLoading || loading) {
    return <LoadingState message="Loading your leave requests…" />;
  }

  if (error && !storageKey) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
        <h2 className="font-semibold">Leave requests unavailable</h2>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6" aria-label="My leave requests">
      <header>
        <p className="text-sm font-medium text-blue-600">Employee self-service</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Leave requests</h2>
        <p className="mt-1 text-sm text-slate-500">
          Submit a leave request and review your personal request history.
        </p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Request leave</h3>
          <p className="mt-1 text-sm text-slate-500">
            Your request will be saved as pending for review.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Leave type
            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>Annual leave</option>
              <option>Sick leave</option>
              <option>Personal leave</option>
              <option>Unpaid leave</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-slate-700">
              From
              <input
                required
                type="date"
                name="startDate"
                min={todayKey()}
                value={form.startDate}
                onChange={handleChange}
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              To
              <input
                required
                type="date"
                name="endDate"
                min={form.startDate || todayKey()}
                value={form.endDate}
                onChange={handleChange}
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>

        {form.startDate && form.endDate && form.endDate >= form.startDate && (
          <p className="text-sm text-slate-500">
            {countWorkingDays(form.startDate, form.endDate)} working day(s), excluding weekends.
          </p>
        )}

        <label className="block text-sm font-medium text-slate-700">
          Reason
          <textarea
            required
            name="reason"
            value={form.reason}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Briefly explain the reason for your leave"
            className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
        >
          Submit leave request
        </button>
      </form>

      <section aria-labelledby="leave-history-heading">
        <div className="mb-3">
          <h3 id="leave-history-heading" className="text-lg font-semibold text-slate-900">
            My request history
          </h3>
          <p className="text-sm text-slate-500">
            Only your own submitted requests are shown here.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {requests.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              You haven&apos;t submitted any leave requests yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Leave type</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((request) => (
                    <tr key={request.id} className="align-top text-slate-700">
                      <td className="px-4 py-3 font-medium">{request.leaveType}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDate(request.startDate)}
                        {request.endDate !== request.startDate && (
                          <> – {formatDate(request.endDate)}</>
                        )}
                      </td>
                      <td className="px-4 py-3">{request.workingDays}</td>
                      <td className="max-w-xs whitespace-pre-wrap px-4 py-3">
                        {request.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusClass[request.status] || statusClass.Pending
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default LeaveRequests;
