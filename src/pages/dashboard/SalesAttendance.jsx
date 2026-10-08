import { useState } from "react";
import EmptyState from "../../components/common/EmptyState";
import { salesPeople } from "../../data/salesTracking";
import useSalesDailyAttendance from "../../hook/useSalesDailyAttendance";

const pad = (value) => String(value).padStart(2, "0");
const currentDate = new Date();
const todayKey = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;

const formatTime = (timestamp) => {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

const formatDuration = (minutes) => {
  if (!minutes) return "0h 00m";
  return `${Math.floor(minutes / 60)}h ${pad(minutes % 60)}m`;
};

const AttendanceItem = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>
      {value}
    </p>
  </div>
);

const SalesAttendance = () => {
  const [salesPersonId, setSalesPersonId] = useState(salesPeople[0]?.id || "");
  const [date, setDate] = useState(todayKey);
  const salesPerson = salesPeople.find((person) => person.id === salesPersonId);
  const attendance = useSalesDailyAttendance(salesPerson, date);

  return (
    <section className="mx-auto max-w-7xl space-y-5" aria-label="Sales person attendance">
      <header>
        <p className="text-sm font-medium text-blue-600">Field activity</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Sales attendance
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Review attendance details for a selected sales person and date.
        </p>
      </header>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Sales person
          <select
            value={salesPersonId}
            onChange={(event) => setSalesPersonId(event.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {salesPeople.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            value={date}
            max={todayKey}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      {!salesPerson ? (
        <EmptyState
          title="Sales person unavailable"
          description="Select an available sales person to view attendance."
        />
      ) : !attendance ? (
        <EmptyState
          title="No attendance found"
          description={`No attendance record is available for ${salesPerson.name} on this date.`}
        />
      ) : (
        <section aria-labelledby="sales-attendance-details">
          <div className="mb-3">
            <h3 id="sales-attendance-details" className="text-lg font-semibold text-slate-900">
              Daily attendance
            </h3>
            <p className="text-sm text-slate-500">
              {salesPerson.name} · Employee ID {salesPerson.id} · {date}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 xl:grid-cols-4">
            <AttendanceItem label="Sales person" value={salesPerson.name} />
            <AttendanceItem label="Date" value={date} />
            <AttendanceItem label="Check-in" value={formatTime(attendance.checkIn)} />
            <AttendanceItem label="Check-out" value={formatTime(attendance.checkOut)} />
            <AttendanceItem
              label="Working hours"
              value={formatDuration(attendance.workingMinutes)}
            />
            <AttendanceItem label="Attendance status" value={attendance.status} />
          </div>
        </section>
      )}
    </section>
  );
};

export default SalesAttendance;
