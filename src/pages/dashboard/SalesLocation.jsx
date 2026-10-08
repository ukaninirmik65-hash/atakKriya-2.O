import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/common/EmptyState";
import { calculateRouteDistance, salesPeople } from "../../data/salesTracking";
import useSalesDailyTracking from "../../hook/useSalesDailyTracking";
import useToast from "../../hook/useToast";
import SalesRouteMap from "./SalesRouteMap";

const pad = (value) => String(value).padStart(2, "0");
const currentDate = new Date();
const todayKey = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
const EMPTY_POINTS = [];
const EMPTY_DESCRIPTIONS = [];
const ENDPOINT_STORAGE_KEY = "sales-route-endpoints";
const DESCRIPTION_STORAGE_KEY = "sales-activity-descriptions";

const getEndpointStorageKey = (salesPersonId, date) =>
  `${ENDPOINT_STORAGE_KEY}:${salesPersonId}:${date}`;

const getDescriptionStorageKey = (salesPersonId, date) =>
  `${DESCRIPTION_STORAGE_KEY}:${salesPersonId}:${date}`;

const readDescriptions = (salesPersonId, date) => {
  const key = getDescriptionStorageKey(salesPersonId, date);
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return { key, descriptions: [], issue: null };

    const parsed = JSON.parse(saved);
    if (
      !Array.isArray(parsed) ||
      parsed.some(
        (item) =>
          !item ||
          typeof item.id !== "string" ||
          typeof item.time !== "string" ||
          typeof item.location !== "string" ||
          typeof item.description !== "string" ||
          typeof item.salesPersonId !== "string",
      )
    ) {
      throw new Error("Saved activity descriptions are invalid");
    }

    return { key, descriptions: parsed, issue: null };
  } catch {
    try {
      localStorage.removeItem(key);
      return {
        key,
        descriptions: [],
        issue: "Invalid saved activity descriptions were cleared.",
      };
    } catch {
      return {
        key,
        descriptions: [],
        issue: "Saved activity descriptions could not be read or cleared.",
      };
    }
  }
};

const isValidEndpoint = (endpoint) =>
  endpoint &&
  Number.isFinite(endpoint.latitude) &&
  endpoint.latitude >= -90 &&
  endpoint.latitude <= 90 &&
  Number.isFinite(endpoint.longitude) &&
  endpoint.longitude >= -180 &&
  endpoint.longitude <= 180 &&
  typeof endpoint.location === "string" &&
  endpoint.location.trim().length > 0;

const readRouteEndpoints = (salesPersonId, date) => {
  const salesPerson = salesPeople.find((person) => person.id === salesPersonId);
  const points = salesPerson?.days[date]?.points ?? [];
  if (!points.length) return { value: null, issue: null };

  const orderedPoints = [...points].sort(
    (first, second) => new Date(first.time) - new Date(second.time),
  );
  const fallback = {
    start: {
      latitude: orderedPoints[0].latitude,
      longitude: orderedPoints[0].longitude,
      location: orderedPoints[0].location,
    },
    end: {
      latitude: orderedPoints.at(-1).latitude,
      longitude: orderedPoints.at(-1).longitude,
      location: orderedPoints.at(-1).location,
    },
  };
  const storageKey = getEndpointStorageKey(salesPersonId, date);

  let saved;
  try {
    saved = localStorage.getItem(storageKey);
  } catch {
    return {
      value: fallback,
      issue: {
        message: "Saved route locations could not be read from this browser.",
        type: "error",
      },
    };
  }
  if (!saved) return { value: fallback, issue: null };

  try {
    const parsed = JSON.parse(saved);
    if (!isValidEndpoint(parsed.start) || !isValidEndpoint(parsed.end)) {
      throw new Error("Saved route endpoints are invalid");
    }
    return { value: { start: parsed.start, end: parsed.end }, issue: null };
  } catch {
    return {
      value: fallback,
      issue: {
        message: "Invalid saved route locations were cleared.",
        type: "warning",
        clearStorageKey: storageKey,
      },
    };
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

const TrackingItem = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>
      {value}
    </p>
  </div>
);

const SalesLocation = () => {
  const [salesPersonId, setSalesPersonId] = useState(salesPeople[0]?.id || "");
  const [date, setDate] = useState(todayKey);
  const [descriptionState, setDescriptionState] = useState(() =>
    readDescriptions(salesPeople[0]?.id || "", todayKey),
  );
  const [descriptionText, setDescriptionText] = useState("");
  const [selectedPointId, setSelectedPointId] = useState("");
  const [endpointState, setEndpointState] = useState(() => ({
    key: getEndpointStorageKey(salesPeople[0]?.id || "", todayKey),
    ...readRouteEndpoints(salesPeople[0]?.id || "", todayKey),
  }));
  const [selectionState, setSelectionState] = useState(null);
  const salesPerson = salesPeople.find((person) => person.id === salesPersonId);
  const tracking = useSalesDailyTracking(salesPerson, date);
  const points = tracking?.points ?? EMPTY_POINTS;
  const { showToast } = useToast();
  const currentStorageKey = getEndpointStorageKey(salesPersonId, date);
  const currentDescriptionKey = getDescriptionStorageKey(salesPersonId, date);
  const savedDescriptions =
    descriptionState.key === currentDescriptionKey
      ? descriptionState.descriptions
      : EMPTY_DESCRIPTIONS;
  const endpointDraft =
    endpointState.key === currentStorageKey ? endpointState.value : null;
  const selectionMode =
    selectionState?.key === currentStorageKey ? selectionState.mode : "";

  useEffect(() => {
    if (
      endpointState.key !== currentStorageKey ||
      !endpointState.issue
    ) return;

    const { issue } = endpointState;
    if (issue.clearStorageKey) {
      try {
        localStorage.removeItem(issue.clearStorageKey);
      } catch {
        showToast("Invalid saved route locations could not be cleared.", {
          type: "error",
        });
        return;
      }
    }
    showToast(issue.message, { type: issue.type });
  }, [currentStorageKey, endpointState, showToast]);

  useEffect(() => {
    if (
      descriptionState.key === currentDescriptionKey &&
      descriptionState.issue
    ) {
      showToast(descriptionState.issue, { type: "warning" });
    }
  }, [currentDescriptionKey, descriptionState, showToast]);

  const routePoints = useMemo(() => {
    if (!points.length || !endpointDraft) return points;

    return points.map((point, index) => {
      if (index === 0) return { ...point, ...endpointDraft.start };
      if (index === points.length - 1) return { ...point, ...endpointDraft.end };
      return point;
    });
  }, [endpointDraft, points]);
  const routeDistanceKm = useMemo(
    () => calculateRouteDistance(routePoints),
    [routePoints],
  );

  const activities = useMemo(
    () =>
      [...routePoints].sort(
        (first, second) => new Date(first.time) - new Date(second.time),
      ),
    [routePoints],
  );
  const activityHistory = useMemo(
    () =>
      [...activities, ...savedDescriptions].sort(
        (first, second) => new Date(first.time) - new Date(second.time),
      ),
    [activities, savedDescriptions],
  );

  const changeTrackingDay = (nextSalesPersonId, nextDate) => {
    setDescriptionState(readDescriptions(nextSalesPersonId, nextDate));
    setDescriptionText("");
    setSelectedPointId("");
  };

  const saveDescription = (event) => {
    event.preventDefault();
    const description = descriptionText.trim();
    const selectedPoint = routePoints.find(
      (point) => point.id === selectedPointId,
    ) || routePoints[0];

    if (!description || !selectedPoint) {
      showToast(
        selectedPoint
          ? "Enter a description before saving."
          : "No tracking location is available for this date.",
        { type: "warning" },
      );
      return;
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      salesPersonId,
      time: new Date().toISOString(),
      location: selectedPoint.location,
      description,
      activity: "Description",
    };
    const nextDescriptions = [...savedDescriptions, entry];

    try {
      localStorage.setItem(
        currentDescriptionKey,
        JSON.stringify(nextDescriptions),
      );
      setDescriptionState({
        key: currentDescriptionKey,
        descriptions: nextDescriptions,
        issue: null,
      });
      setDescriptionText("");
      showToast("Description added successfully.", { type: "success" });
    } catch {
      showToast("Unable to save the description in this browser.", {
        type: "error",
      });
    }
  };

  const handleMapPointSelect = ({ lat, lng }) => {
    if (!selectionMode) return;

    setEndpointState((current) => ({
      key: currentStorageKey,
      value: {
        ...current.value,
        [selectionMode]: {
          ...current.value[selectionMode],
          latitude: lat,
          longitude: lng,
        },
      },
    }));
    showToast(
      `${selectionMode === "start" ? "Start" : "End"} location placed on the map.`,
      { type: "success" },
    );
    setSelectionState(null);
  };

  const saveEndpoints = () => {
    if (
      !endpointDraft ||
      !isValidEndpoint(endpointDraft.start) ||
      !isValidEndpoint(endpointDraft.end)
    ) {
      showToast("Add a name and map position for both locations.", {
        type: "warning",
      });
      return;
    }

    try {
      localStorage.setItem(
        currentStorageKey,
        JSON.stringify(endpointDraft),
      );
      showToast("Start and end locations saved successfully.", {
        type: "success",
      });
    } catch {
      showToast("Unable to save route locations in this browser.", {
        type: "error",
      });
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-5" aria-label="Sales person location tracking">
      <header>
        <p className="text-sm font-medium text-blue-600">Field activity</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Sales location &amp; route
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          View daily movement, tracking points, and notes for a selected sales person.
        </p>
      </header>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Sales person
          <select
            value={salesPersonId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSalesPersonId(nextId);
              changeTrackingDay(nextId, date);
              setEndpointState({
                key: getEndpointStorageKey(nextId, date),
                ...readRouteEndpoints(nextId, date),
              });
              setSelectionState(null);
            }}
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
            onChange={(event) => {
              const nextDate = event.target.value;
              setDate(nextDate);
              changeTrackingDay(salesPersonId, nextDate);
              setEndpointState({
                key: getEndpointStorageKey(salesPersonId, nextDate),
                ...readRouteEndpoints(salesPersonId, nextDate),
              });
              setSelectionState(null);
            }}
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      {!salesPerson ? (
        <EmptyState
          title="Sales person unavailable"
          description="Select an available sales person to view location tracking."
        />
      ) : !tracking ? (
        <EmptyState
          title="No tracking found"
          description={`No location tracking is available for ${salesPerson.name} on this date.`}
        />
      ) : (
        <>
          <section aria-labelledby="daily-tracking-heading" className="space-y-3">
            <div>
              <h3 id="daily-tracking-heading" className="text-lg font-semibold text-slate-900">
                Daily tracking
              </h3>
              <p className="text-sm text-slate-500">
                {salesPerson.name} · Employee ID {salesPerson.id} · {date}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              <TrackingItem label="Start location" value={endpointDraft?.start.location || "Not recorded"} />
              <TrackingItem label="End location" value={endpointDraft?.end.location || "Not recorded"} />
              <TrackingItem label="Distance travelled" value={`${routeDistanceKm.toFixed(2)} km`} />
              <TrackingItem label="Tracking points" value={String(points.length)} />
              <TrackingItem label="Last known location" value={endpointDraft?.end.location || "Not available"} />
              <TrackingItem label="Last update" value={formatTime(tracking.currentPoint?.time)} />
              <TrackingItem label="First point" value={formatTime(tracking.startPoint?.time)} />
              <TrackingItem label="Route duration" value={`${Math.floor(tracking.routeMinutes / 60)}h ${pad(tracking.routeMinutes % 60)}m`} />
            </div>
          </section>

          <section aria-labelledby="daily-route-heading" className="space-y-3">
            <div>
              <h3 id="daily-route-heading" className="text-lg font-semibold text-slate-900">
                Daily route
              </h3>
              <p className="text-sm text-slate-500">
                Set or update the start and end pins. Click a map marker for its time, location, and activity.
              </p>
            </div>
            {endpointDraft && (
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
                {["start", "end"].map((endpoint) => (
                  <div key={endpoint} className="space-y-2">
                    <label className="block text-sm font-medium capitalize text-slate-700">
                      {endpoint} location name
                      <input
                        value={endpointDraft[endpoint].location}
                        onChange={(event) =>
                          setEndpointState((current) => ({
                            key: currentStorageKey,
                            value: {
                              ...current.value,
                              [endpoint]: {
                                ...current.value[endpoint],
                                location: event.target.value,
                              },
                            },
                          }))
                        }
                        placeholder={`Enter ${endpoint} location`}
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <button
                      type="button"
                      aria-pressed={selectionMode === endpoint}
                      onClick={() =>
                        setSelectionState((current) =>
                          current?.key === currentStorageKey &&
                          current.mode === endpoint
                            ? null
                            : { key: currentStorageKey, mode: endpoint },
                        )
                      }
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        selectionMode === endpoint
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {selectionMode === endpoint
                        ? "Click the map to place pin"
                        : "Choose position on map"}
                    </button>
                  </div>
                ))}
                <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                  <p className="text-xs text-slate-500">
                    Pins are saved separately for this salesperson and date.
                  </p>
                  <button
                    type="button"
                    onClick={saveEndpoints}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Save locations
                  </button>
                </div>
              </div>
            )}
            {selectionMode && (
              <p role="status" className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
                Click the map to place the {selectionMode} location pin.
              </p>
            )}
            <SalesRouteMap
              points={routePoints}
              salesPersonName={salesPerson.name}
              selectionMode={selectionMode}
              onMapPointSelect={handleMapPointSelect}
            />
          </section>

          <section aria-labelledby="daily-tracking-notes-heading" className="space-y-3">
            <div>
              <h3 id="daily-tracking-notes-heading" className="text-lg font-semibold text-slate-900">
                Add description
              </h3>
              <p className="text-sm text-slate-500">
                Record a note for this sales person’s selected field location.
              </p>
            </div>
            <form
              onSubmit={saveDescription}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <label className="block text-sm font-medium text-slate-700">
                Tracking location
                <select
                  value={selectedPointId || routePoints[0]?.id || ""}
                  onChange={(event) => setSelectedPointId(event.target.value)}
                  required
                  disabled={!routePoints.length}
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {routePoints.map((point, index) => (
                    <option key={point.id} value={point.id}>
                      {formatTime(point.time)} — {point.location || `Tracking point ${index + 1}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={descriptionText}
                  onChange={(event) => setDescriptionText(event.target.value)}
                  maxLength={500}
                  rows={3}
                  required
                  placeholder="Example: Met customer and discussed new order."
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {descriptionText.length}/500 characters
                </span>
                <button
                  type="submit"
                  disabled={!routePoints.length}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Description
                </button>
              </div>
            </form>

            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Location notes &amp; activities
              </h3>
              <p className="text-sm text-slate-500">
                Tracking activities and saved descriptions in chronological order.
              </p>
            </div>
            {activityHistory.length === 0 ? (
              <EmptyState
                title="No activities or descriptions"
                description="There are no tracking activities or saved descriptions for this day."
              />
            ) : (
              <ol className="space-y-3">
                {activityHistory.map((activity) => (
                  <li
                    key={activity.id}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <time
                      dateTime={activity.time}
                      className="w-20 shrink-0 pt-0.5 text-sm font-semibold text-blue-700"
                    >
                      {formatTime(activity.time)}
                    </time>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-slate-800">
                          {activity.activity || "Activity"}
                        </h4>
                        {activity.salesPersonId && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {salesPerson.name}
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {activity.location}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {activity.description || "No description provided."}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </section>
  );
};

export default SalesLocation;
