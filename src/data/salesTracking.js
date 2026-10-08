const pad = (value) => String(value).padStart(2, "0");

export const localDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const makeTimestamp = (date, time) => `${date}T${time}:00`;

const createDay = (date, shiftMinutes = 0) => {
  const points = [
    {
      time: "09:10",
      latitude: 23.0225,
      longitude: 72.5714,
      location: "Shivvilon Office, Ahmedabad",
      activity: "Check-in",
      description: "Started the workday and began the route.",
    },
    {
      time: "10:05",
      latitude: 23.0301,
      longitude: 72.5788,
      location: "Navrangpura, Ahmedabad",
      activity: "Customer visit",
      description: "Met the customer and discussed the current order.",
    },
    {
      time: "11:35",
      latitude: 23.0392,
      longitude: 72.5647,
      location: "University Road, Ahmedabad",
      activity: "Customer visit",
      description: "Shared product details and collected requirements.",
    },
    {
      time: "13:00",
      latitude: 23.0136,
      longitude: 72.5623,
      location: "Vastrapur, Ahmedabad",
      activity: "Break",
      description: "Lunch break.",
    },
    {
      time: "14:20",
      latitude: 23.0078,
      longitude: 72.5732,
      location: "Bodakdev, Ahmedabad",
      activity: "Customer visit",
      description: "Follow-up visit; shared a quotation with the customer.",
    },
    {
      time: "17:42",
      latitude: 23.0221,
      longitude: 72.5708,
      location: "Shivvilon Office, Ahmedabad",
      activity: "Check-out",
      description: "Returned to the office and completed the route.",
    },
  ].map((point, index) => ({
    ...point,
    time: makeTimestamp(date, point.time),
    latitude: point.latitude + shiftMinutes * 0.00004,
    longitude: point.longitude - shiftMinutes * 0.00003,
    id: `${date}-point-${index + 1}`,
  }));

  return {
    date,
    attendance: {
      checkIn: points[0].time,
      checkOut: points[points.length - 1].time,
      status: "Present",
    },
    points,
  };
};

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const todayKey = localDateKey(today);
const yesterdayKey = localDateKey(yesterday);

export const salesPeople = [
  {
    id: "SP-104",
    name: "Rohan Mehta",
    days: {
      [todayKey]: createDay(todayKey),
      [yesterdayKey]: createDay(yesterdayKey, 1),
    },
  },
  {
    id: "SP-108",
    name: "Diya Shah",
    days: {
      [todayKey]: createDay(todayKey, 2),
      [yesterdayKey]: createDay(yesterdayKey, 3),
    },
  },
];

export const calculateRouteDistance = (points = []) => {
  const earthRadiusKm = 6371;
  let distance = 0;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const latitudeDelta =
      ((current.latitude - previous.latitude) * Math.PI) / 180;
    const longitudeDelta =
      ((current.longitude - previous.longitude) * Math.PI) / 180;
    const previousLatitude = (previous.latitude * Math.PI) / 180;
    const currentLatitude = (current.latitude * Math.PI) / 180;

    const a =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(previousLatitude) *
        Math.cos(currentLatitude) *
        Math.sin(longitudeDelta / 2) ** 2;
    distance += 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return distance;
};

export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const minutes = Math.max(
    0,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60_000),
  );
  return minutes;
};

export const loadSalesActivityDescriptions = (salesPersonId, date) => {
  if (!salesPersonId || !date) return [];

  const key = `sales-activity-descriptions:${salesPersonId}:${date}`;
  const stored = localStorage.getItem(key);
  if (!stored) return [];

  let descriptions;
  try {
    descriptions = JSON.parse(stored);
  } catch {
    throw new Error("Saved sales activity descriptions have invalid data.");
  }
  if (
    !Array.isArray(descriptions) ||
    descriptions.some(
      (item) =>
        !item ||
        typeof item.id !== "string" ||
        item.salesPersonId !== salesPersonId ||
        typeof item.time !== "string" ||
        typeof item.location !== "string" ||
        typeof item.description !== "string",
    )
  ) {
    throw new Error("Saved sales activity descriptions have an invalid format.");
  }

  return descriptions;
};
