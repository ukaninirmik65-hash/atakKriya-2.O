import { useMemo } from "react";
import { Link } from "react-router";
import {
  Banknote,
  CalendarCheck2,
  MapPin,
  PersonStanding,
  UserRoundCheck,
} from "lucide";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import LucideIcon from "../../components/common/LucideIcon";
import useEmployeeDashboardData from "../../hook/useEmployeeDashboardData";

const formatTime = (timestamp) => {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

const formatHours = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0h 00m";
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
};

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const statusStyles = {
  present: "bg-emerald-50 text-emerald-700",
  absent: "bg-red-50 text-red-700",
  leave: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};

const StatusBadge = ({ status = "pending" }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
      statusStyles[status] || "bg-slate-100 text-slate-700"
    }`}
  >
    {status === "pending" ? "Not checked in" : status}
  </span>
);

const SummaryCard = ({ label, value, tone = "text-slate-900" }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
  </article>
);

const DetailItem = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>
      {value}
    </p>
  </div>
);

const QuickAction = ({ to, icon, label, description }) => (
  <Link
    to={to}
    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
      <LucideIcon icon={icon} />
    </span>
    <span>
      <span className="block font-semibold text-slate-800">{label}</span>
      <span className="mt-1 block text-sm text-slate-500">{description}</span>
    </span>
  </Link>
);

const Dashboard = () => {
  const {
    employeeName,
    displayEmployeeId,
    loading,
    errors,
    todayRecord,
    todayMinutes,
    monthlySummary,
    leaveSummary,
    expenses,
    todayExpenses,
    salesPerson,
    salesTracking,
    salesActivity,
    salesActivityError,
    salesActivityLoading,
    checkIn,
    checkOut,
  } = useEmployeeDashboardData();

  const currentDate = new Date();
  const greeting =
    currentDate.getHours() < 12
      ? "Good morning"
      : currentDate.getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const currentMonthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(currentDate);
  const todayExpenseTotal = todayExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const pendingExpenseCount = expenses.filter(
    (expense) => expense.status.toLowerCase() === "pending",
  ).length;
  const recentFieldActivities = useMemo(() => {
    const trackingActivities = (salesTracking?.points || [])
      .filter((point) => point.description)
      .map((point) => ({
        id: point.id,
        time: point.time,
        location: point.location,
        description: point.description,
      }));

    const recentDescriptions = [...salesActivity]
      .sort((first, second) => new Date(second.time) - new Date(first.time))
      .slice(0, 3);
    const recentTrackingActivities = trackingActivities
      .sort((first, second) => new Date(second.time) - new Date(first.time))
      .slice(0, Math.max(0, 3 - recentDescriptions.length));

    return [...recentDescriptions, ...recentTrackingActivities];
  }, [salesActivity, salesTracking]);
  const latestTrackingPoint = salesTracking?.currentPoint;

  if (loading) {
    return <LoadingState message="Loading your personal dashboard…" />;
  }

  const attendanceStatus = todayRecord?.status || "pending";
  const attendanceError = errors.attendance;
  const canCheckIn = !attendanceError && !todayRecord?.checkIn;
  const canCheckOut =
    !attendanceError && Boolean(todayRecord?.checkIn) && !todayRecord?.checkOut;
  const salesTodayAttendance = salesTracking?.attendance;

  return (
    <section className="mx-auto max-w-7xl space-y-6" aria-label="My dashboard">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-blue-600">Employee self-service</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {greeting}, {employeeName}
        </h2>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>{formatDate(currentDate)}</span>
          <span>Employee ID: {displayEmployeeId}</span>
        </div>
      </header>

      <section aria-labelledby="dashboard-attendance-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 id="dashboard-attendance-heading" className="text-lg font-semibold text-slate-900">
              Today&apos;s attendance
            </h3>
            <p className="text-sm text-slate-500">{formatDate(currentDate)}</p>
          </div>
          <StatusBadge status={attendanceStatus} />
        </div>
        {attendanceError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {attendanceError}
          </div>
        ) : (
          <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <DetailItem label="Check-in" value={formatTime(todayRecord?.checkIn)} />
              <DetailItem label="Check-out" value={formatTime(todayRecord?.checkOut)} />
              <DetailItem label="Working hours" value={formatHours(todayMinutes)} />
              <DetailItem
                label="Overtime"
                value={formatHours(todayRecord?.overtimeMinutes || 0)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!canCheckIn}
                onClick={checkIn}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Check In
              </button>
              <button
                type="button"
                disabled={!canCheckOut}
                onClick={checkOut}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Check Out
              </button>
            </div>
          </article>
        )}
      </section>

      <section aria-labelledby="monthly-summary-heading" className="space-y-3">
        <div>
          <h3 id="monthly-summary-heading" className="text-lg font-semibold text-slate-900">
            My attendance this month
          </h3>
          <p className="text-sm text-slate-500">{currentMonthLabel}</p>
        </div>
        {attendanceError ? (
          <EmptyState
            title="Monthly summary unavailable"
            description="Your attendance records could not be loaded."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <SummaryCard label="Present days" value={monthlySummary.present} tone="text-emerald-700" />
            <SummaryCard label="Absent days" value={monthlySummary.absent} tone="text-red-700" />
            <SummaryCard label="Leave days" value={monthlySummary.leave} tone="text-blue-700" />
            <SummaryCard label="Late days" value={monthlySummary.late} tone="text-amber-700" />
            <SummaryCard label="Working hours" value={formatHours(monthlySummary.workingMinutes)} />
            <SummaryCard label="Overtime" value={formatHours(monthlySummary.overtimeMinutes)} />
          </div>
        )}
      </section>

      <section aria-labelledby="leave-summary-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 id="leave-summary-heading" className="text-lg font-semibold text-slate-900">
              My leave requests
            </h3>
            <p className="text-sm text-slate-500">Your request status and recent activity</p>
          </div>
          <Link
            to="/leave-requests"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Apply Leave
          </Link>
        </div>
        {errors.leave ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errors.leave}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard label="Pending" value={leaveSummary.pending.length} tone="text-amber-700" />
              <SummaryCard label="Approved" value={leaveSummary.approved.length} tone="text-emerald-700" />
              <SummaryCard label="Rejected" value={leaveSummary.rejected.length} tone="text-red-700" />
            </div>
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-800">Recent leave requests</h4>
                <Link to="/leave-requests#leave-history-heading" className="text-sm font-medium text-blue-700 hover:underline">
                  Leave History
                </Link>
              </div>
              {leaveSummary.recent.length === 0 ? (
                <p className="text-sm text-slate-500">You have no leave requests yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {leaveSummary.recent.map((request) => (
                    <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                      <span className="text-slate-700">
                        {request.leaveType} · {request.startDate}
                        {request.endDate !== request.startDate ? ` – ${request.endDate}` : ""}
                      </span>
                      <StatusBadge status={request.status} />
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        )}
      </section>

      {salesPerson && (
        <section aria-labelledby="sales-person-dashboard-heading" className="space-y-3">
          <div>
            <h3 id="sales-person-dashboard-heading" className="text-lg font-semibold text-slate-900">
              My field activity
            </h3>
            <p className="text-sm text-slate-500">
              Salesperson details for {salesPerson.name} only
            </p>
          </div>
          {salesTracking ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <SummaryCard
                  label="Sales attendance"
                  value={salesTodayAttendance?.status || "Not recorded"}
                  tone="text-blue-700"
                />
                <SummaryCard label="Sales check-in" value={formatTime(salesTodayAttendance?.checkIn)} />
                <SummaryCard label="Sales check-out" value={formatTime(salesTodayAttendance?.checkOut)} />
                <SummaryCard
                  label="Today's expenses"
                  value={new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "INR",
                  }).format(todayExpenseTotal)}
                />
                <SummaryCard label="Pending expenses" value={pendingExpenseCount} tone="text-amber-700" />
                <SummaryCard
                  label="Tracking status"
                  value={salesTracking.points.length ? "Route recorded" : "No route"}
                  tone={salesTracking.points.length ? "text-emerald-700" : "text-slate-700"}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-800">Latest tracking activity</h4>
                    <Link to="/sales-location" className="text-sm font-medium text-blue-700 hover:underline">
                      Sales Location
                    </Link>
                  </div>
                  {latestTrackingPoint ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-slate-800">
                        {latestTrackingPoint.activity || "Tracking point"} · {formatTime(latestTrackingPoint.time)}
                      </p>
                      <p className="text-slate-600">{latestTrackingPoint.location}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No location tracking is recorded today.</p>
                  )}
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-800">Recent field descriptions</h4>
                    <Link to="/sales-location#daily-tracking-notes-heading" className="text-sm font-medium text-blue-700 hover:underline">
                      Add Description
                    </Link>
                  </div>
                  {salesActivityError ? (
                    <p role="alert" className="text-sm text-red-700">{salesActivityError}</p>
                  ) : salesActivityLoading ? (
                    <p className="text-sm text-slate-500">Loading your field descriptions…</p>
                  ) : recentFieldActivities.length ? (
                    <ul className="space-y-3">
                      {recentFieldActivities.map((activity) => (
                        <li key={activity.id} className="border-l-2 border-blue-200 pl-3">
                          <p className="text-xs font-medium text-blue-700">
                            {formatTime(activity.time)} · {activity.location}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">{activity.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No field descriptions are recorded today.</p>
                  )}
                </article>
              </div>
            </>
          ) : (
            <EmptyState
              title="No sales activity recorded today"
              description="Your sales attendance and tracking details will appear here when available."
            />
          )}
        </section>
      )}

      <section aria-labelledby="quick-actions-heading" className="space-y-3">
        <div>
          <h3 id="quick-actions-heading" className="text-lg font-semibold text-slate-900">
            Quick actions
          </h3>
          <p className="text-sm text-slate-500">Go directly to your employee tools</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            to="/employee-attendance"
            icon={UserRoundCheck}
            label="Attendance"
            description="View and update today's attendance"
          />
          <QuickAction
            to="/leave-requests"
            icon={CalendarCheck2}
            label="Apply Leave"
            description="Create or review a leave request"
          />
          <QuickAction
            to="/employee-attendance#attendance-history-heading"
            icon={UserRoundCheck}
            label="Attendance History"
            description="Review your monthly attendance"
          />
          <QuickAction
            to="/leave-requests#leave-history-heading"
            icon={CalendarCheck2}
            label="Leave History"
            description="Review your previous leave requests"
          />
          {salesPerson && (
            <>
              <QuickAction
                to="/sales-attendance"
                icon={PersonStanding}
                label="Sales Attendance"
                description="View your sales attendance"
              />
              <QuickAction
                to="/sales-expenses"
                icon={Banknote}
                label="Add Expense"
                description="Record a company-related expense"
              />
              <QuickAction
                to="/sales-location"
                icon={MapPin}
                label="Sales Location / Tracking"
                description="View your route and field activity"
              />
              <QuickAction
                to="/sales-location#daily-tracking-notes-heading"
                icon={PersonStanding}
                label="Add Description"
                description="Record a field visit note"
              />
            </>
          )}
        </div>
      </section>
    </section>
  );
};

export default Dashboard;
