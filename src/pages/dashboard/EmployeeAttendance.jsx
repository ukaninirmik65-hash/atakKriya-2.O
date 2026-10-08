import { useEffect, useMemo, useState } from "react";
import useEmployeeIdentity from "../../hook/useEmployeeIdentity";
import useToast from "../../hook/useToast";
import LoadingState from "../../components/common/LoadingState";
import {
  calculateEmployeeMinutes,
  getEmployeeAttendanceStorageKey,
  getLocalDateKey,
  loadEmployeeAttendanceRecords,
  markEmployeeCheckedIn,
  markEmployeeCheckedOut,
  saveEmployeeAttendanceRecords,
} from "../../data/employeeAttendance";

const pad = (value) => String(value).padStart(2, "0");

const formatTime = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatHours = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0h 00m";
  return `${Math.floor(minutes / 60)}h ${pad(minutes % 60)}m`;
};

const StatCard = ({ label, value, tone = "text-slate-900" }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
  </article>
);

const StatusBadge = ({ status, late }) => {
  const styles = {
    present: "bg-emerald-50 text-emerald-700",
    absent: "bg-red-50 text-red-700",
    leave: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
  };
  const label = status === "leave" ? "Leave" : status;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
          styles[status] || styles.pending
        }`}
      >
        {label}
      </span>
      {late && (
        <span className="text-xs font-medium text-orange-600">Late</span>
      )}
    </span>
  );
};

const EmployeeAttendance = () => {
  const {
    loading: authLoading,
    employeeKey,
    employeeName,
    displayEmployeeId,
  } = useEmployeeIdentity();
  const { showToast } = useToast();
  const storageKey = employeeKey
    ? getEmployeeAttendanceStorageKey(employeeKey)
    : null;
  const [records, setRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}`;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (authLoading) return undefined;

    let active = true;
    Promise.resolve().then(() => {
      if (!storageKey || !employeeKey) {
        if (active) {
          setError(
            "We could not identify your employee account. Please sign in again.",
          );
          setLoading(false);
        }
        return;
      }

      try {
        const ownRecords = loadEmployeeAttendanceRecords(employeeKey);

        if (active) {
          setRecords(ownRecords);
          setError("");
          setLoading(false);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof SyntaxError
              ? "Your saved attendance data could not be read. Please clear this app's saved attendance data or contact support."
              : "Attendance data is unavailable in this browser. Check your browser storage settings and try again.",
          );
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [authLoading, employeeKey, storageKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const todayKey = getLocalDateKey(now);
  const todayRecord = records.find((record) => record.date === todayKey);
  const todayMinutes = calculateEmployeeMinutes(todayRecord, now.getTime());
  const monthRecords = useMemo(
    () => records.filter((record) => record.date.startsWith(selectedMonth)),
    [records, selectedMonth],
  );

  const summary = useMemo(() => {
    const workingDays = monthRecords.filter(
      (record) => record.status !== "leave",
    );
    return {
      workingDays: workingDays.length,
      present: monthRecords.filter((record) => record.status === "present")
        .length,
      absent: monthRecords.filter((record) => record.status === "absent")
        .length,
      leave: monthRecords.filter((record) => record.status === "leave").length,
      late: monthRecords.filter((record) => record.late).length,
      workingMinutes: monthRecords.reduce(
        (total, record) => total + (record.workingMinutes || 0),
        0,
      ),
      overtimeMinutes: monthRecords.reduce(
        (total, record) => total + (record.overtimeMinutes || 0),
        0,
      ),
    };
  }, [monthRecords]);

  const saveRecords = (nextRecords) => {
    if (!storageKey) {
      setError(
        "Your employee account could not be identified. Please sign in again.",
      );
      return false;
    }

    try {
      saveEmployeeAttendanceRecords(employeeKey, nextRecords);
      setRecords(nextRecords);
      setError("");
      return true;
    } catch {
      setError(
        "Your attendance could not be saved. Check browser storage and try again.",
      );
      return false;
    }
  };

  const checkIn = () => {
    const timestamp = new Date();
    const saved = saveRecords(
      markEmployeeCheckedIn(records, employeeKey, timestamp),
    );
    if (saved) {
      setNow(timestamp);
      showToast("Attendance marked successfully", { type: "success" });
    }
  };

  const checkOut = () => {
    if (!todayRecord?.checkIn) return;
    const timestamp = new Date();
    const nextRecords = markEmployeeCheckedOut(records, timestamp);
    const saved = nextRecords ? saveRecords(nextRecords) : false;
    if (saved) {
      setNow(timestamp);
      showToast("Attendance marked successfully", { type: "success" });
    }
  };

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(`${selectedMonth}-01T12:00:00`));

  if (authLoading || loading) {
    return <LoadingState message="Loading your attendance…" />;
  }

  if (error && records.length === 0) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
        role="alert"
      >
        <h2 className="font-semibold">Attendance unavailable</h2>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  const summaryCards = [
    { label: "Working days", value: summary.workingDays },
    { label: "Present days", value: summary.present, tone: "text-emerald-600" },
    { label: "Absent days", value: summary.absent, tone: "text-red-600" },
    { label: "Leave days", value: summary.leave, tone: "text-blue-600" },
    { label: "Late days", value: summary.late, tone: "text-orange-600" },
    { label: "Working hours", value: formatHours(summary.workingMinutes) },
    {
      label: "Overtime hours",
      value: formatHours(summary.overtimeMinutes),
      tone: "text-indigo-600",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl space-y-6" aria-label="My attendance">
      {error && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div>
        <p className="text-sm font-medium text-blue-600">My Attendance</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Today&apos;s attendance
        </h2>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {employeeName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Employee ID: {displayEmployeeId}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(now)}
            </p>
          </div>
          <StatusBadge
            status={todayRecord?.status || "pending"}
            late={todayRecord?.late}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["Check-in", formatTime(todayRecord?.checkIn)],
            ["Check-out", formatTime(todayRecord?.checkOut)],
            ["Working hours", formatHours(todayMinutes)],
            ["Overtime", formatHours(todayRecord?.overtimeMinutes || 0)],
            [
              "Break duration",
              todayRecord?.breakMinutes
                ? `${todayRecord.breakMinutes} min`
                : "Not recorded",
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={Boolean(todayRecord?.checkIn)}
            onClick={checkIn}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Check In
          </button>
          <button
            type="button"
            disabled={!todayRecord?.checkIn || Boolean(todayRecord?.checkOut)}
            onClick={checkOut}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Check Out
          </button>
        </div>
      </article>

      <section aria-labelledby="monthly-summary-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="monthly-summary-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Monthly summary
            </h2>
            <p className="text-sm text-slate-500">{monthLabel}</p>
          </div>
          <label className="text-sm font-medium text-slate-600">
            <span className="sr-only">Select attendance month</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section aria-labelledby="attendance-history-heading">
        <div className="mb-3">
          <h2
            id="attendance-history-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Attendance history
          </h2>
          <p className="text-sm text-slate-500">
            Your records for {monthLabel}
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {monthRecords.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No attendance records are available for {monthLabel}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Working Hours</th>
                    <th className="px-4 py-3">Overtime</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...monthRecords]
                    .sort((first, second) =>
                      second.date.localeCompare(first.date),
                    )
                    .map((record) => {
                      const workingMinutes =
                        record.workingMinutes ||
                        (record.date === todayKey && !record.checkOut
                          ? todayMinutes
                          : 0);
                      return (
                        <tr key={record.date} className="text-slate-700">
                          <td className="whitespace-nowrap px-4 py-3">
                            {new Intl.DateTimeFormat(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }).format(new Date(`${record.date}T12:00:00`))}
                          </td>
                          <td className="px-4 py-3">
                            {formatTime(record.checkIn)}
                          </td>
                          <td className="px-4 py-3">
                            {formatTime(record.checkOut)}
                          </td>
                          <td className="px-4 py-3">
                            {formatHours(workingMinutes)}
                          </td>
                          <td className="px-4 py-3">
                            {formatHours(record.overtimeMinutes || 0)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              status={record.status}
                              late={record.late}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default EmployeeAttendance;
