const pad = (value) => String(value).padStart(2, "0");

export const getLocalDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getEmployeeAttendanceStorageKey = (employeeKey) =>
  `employee-attendance:${encodeURIComponent(employeeKey)}`;

export const calculateEmployeeMinutes = (record, now) => {
  if (!record?.checkIn) return 0;
  const start = new Date(record.checkIn).getTime();
  const end = record.checkOut ? new Date(record.checkOut).getTime() : now;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }
  return Math.max(
    0,
    Math.floor((end - start) / 60_000) - (record.breakMinutes || 0),
  );
};

const createMockRecords = (today, employeeId) => {
  const records = [];
  const statusPattern = [
    "present",
    "present",
    "present",
    "absent",
    "leave",
    "present",
  ];
  const cursor = new Date(today);
  let workday = 0;

  while (workday < 12) {
    cursor.setDate(cursor.getDate() - 1);
    if (cursor.getDay() === 0 || cursor.getDay() === 6) continue;

    const status = statusPattern[workday % statusPattern.length];
    const date = getLocalDateKey(cursor);
    const isPresent = status === "present";
    const checkIn = isPresent
      ? new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate(),
          workday % 4 === 0 ? 9 : 8,
          workday % 4 === 0 ? 12 : 50,
        ).toISOString()
      : null;
    const workingMinutes = isPresent ? 450 + ((workday * 13) % 100) : 0;

    records.push({
      employeeId,
      date,
      status,
      checkIn,
      checkOut: isPresent
        ? new Date(
            new Date(checkIn).getTime() + (workingMinutes + 45) * 60_000,
          ).toISOString()
        : null,
      breakMinutes: isPresent ? 45 : 0,
      workingMinutes,
      overtimeMinutes: isPresent ? Math.max(0, workingMinutes - 480) : 0,
      late: isPresent && workday % 4 === 0,
    });
    workday += 1;
  }

  return records;
};

export const loadEmployeeAttendanceRecords = (employeeKey) => {
  if (!employeeKey) throw new Error("An employee identity is required.");

  const storageKey = getEmployeeAttendanceStorageKey(employeeKey);
  const saved = localStorage.getItem(storageKey);
  const savedRecords = saved ? JSON.parse(saved) : null;
  if (savedRecords !== null && !Array.isArray(savedRecords)) {
    throw new Error("Attendance data has an invalid format.");
  }

  const ownRecords = (
    savedRecords || createMockRecords(new Date(), employeeKey)
  ).filter(
    (record) =>
      record &&
      record.employeeId === employeeKey &&
      typeof record.date === "string",
  );
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(ownRecords));
  }
  return ownRecords;
};

export const saveEmployeeAttendanceRecords = (employeeKey, records) => {
  if (!employeeKey) throw new Error("An employee identity is required.");
  localStorage.setItem(
    getEmployeeAttendanceStorageKey(employeeKey),
    JSON.stringify(records),
  );
};

export const markEmployeeCheckedIn = (records, employeeKey, timestamp) => {
  const date = getLocalDateKey(timestamp);
  const existing = records.find((record) => record.date === date) || {
    employeeId: employeeKey,
    date,
    status: "pending",
    checkIn: null,
    checkOut: null,
    breakMinutes: 0,
    workingMinutes: 0,
    overtimeMinutes: 0,
    late: false,
  };
  const nextRecord = {
    ...existing,
    checkIn: timestamp.toISOString(),
    checkOut: null,
    status: "present",
    late:
      timestamp.getHours() > 9 ||
      (timestamp.getHours() === 9 && timestamp.getMinutes() > 0),
  };

  return [nextRecord, ...records.filter((record) => record.date !== date)];
};

export const markEmployeeCheckedOut = (records, timestamp) => {
  const date = getLocalDateKey(timestamp);
  const existing = records.find((record) => record.date === date);
  if (!existing?.checkIn) return null;

  const checkOut = timestamp.toISOString();
  const workingMinutes = calculateEmployeeMinutes(
    { ...existing, checkOut },
    timestamp.getTime(),
  );
  const nextRecord = {
    ...existing,
    checkOut,
    workingMinutes,
    overtimeMinutes: Math.max(0, workingMinutes - 480),
  };

  return [nextRecord, ...records.filter((record) => record.date !== date)];
};
