import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import EmptyState from "../../components/common/EmptyState";

const MapPointSelector = ({ enabled, onSelect }) => {
  useMapEvents({
    click(event) {
      if (enabled) onSelect(event.latlng);
    },
  });

  return null;
};

const RouteBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const bounds = points.map((point) => [point.latitude, point.longitude]);
    if (bounds.length === 1) {
      map.setView(bounds[0], 15, { animate: true });
    } else {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15, animate: true });
    }
  }, [map, points]);

  return null;
};

const formatTime = (timestamp) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));

const createRouteMarkerIcon = (label, color) =>
  divIcon({
    className: "sales-route-marker",
    html: `<span style="display:flex;width:30px;height:30px;align-items:center;justify-content:center;border:2px solid #fff;border-radius:9999px;background:${color};box-shadow:0 2px 8px rgba(15,23,42,.35);color:#fff;font:700 11px/1 system-ui,sans-serif">${label}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });

const SalesRouteMap = ({
  points,
  salesPersonName,
  selectionMode,
  onMapPointSelect,
}) => {
  if (!points.length) {
    return (
      <EmptyState
        title="No route to display"
        description="Choose a sales person and date with recorded tracking points."
        className="min-h-[360px] content-center"
      />
    );
  }

  const route = points.map((point) => [point.latitude, point.longitude]);
  const middlePointCount = Math.max(0, points.length - 2);

  return (
    <div className="relative z-0 isolate">
      <div
        aria-label="Map legend"
        className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600"
      >
        <span className="inline-flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">S</span>
          Start
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-1 w-6 rounded bg-blue-600" />
          Travelled route
        </span>
        {middlePointCount > 0 && (
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
            Stops in time order
          </span>
        )}
        {points.length > 1 && (
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">E</span>
            End
          </span>
        )}
      </div>

      <div className="relative z-0 isolate h-[340px] overflow-hidden rounded-xl border border-slate-300 bg-slate-100 shadow-sm sm:h-[440px]">
        <MapContainer
          center={route[0]}
          zoom={13}
          scrollWheelZoom
          className="sales-route-map h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapPointSelector
            enabled={Boolean(selectionMode)}
            onSelect={onMapPointSelect}
          />
          <RouteBounds points={points} />
          <Polyline
            positions={route}
            pathOptions={{
              color: "#1d4ed8",
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          {points.map((point, index) => {
            const isStart = index === 0;
            const isEnd = index === points.length - 1;
            const isSinglePoint = points.length === 1;
            const label = isSinglePoint
              ? "S/E"
              : isStart
                ? "S"
                : isEnd
                  ? "E"
                  : String(index);
            const markerColor = isStart ? "#15803d" : isEnd ? "#b91c1c" : "#1d4ed8";
            return (
              <Marker
                key={point.id}
                position={[point.latitude, point.longitude]}
                icon={createRouteMarkerIcon(label, markerColor)}
                zIndexOffset={isStart || isEnd ? 1000 : 0}
              >
                <Popup>
                  <div className="min-w-44 space-y-2 p-0.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">
                        {isSinglePoint
                          ? "Start and end"
                          : isStart
                            ? "Start location"
                            : isEnd
                              ? "End location"
                              : `Stop ${index}`}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {point.activity || "Tracking point"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <span className="font-medium text-slate-800">Time:</span>{" "}
                      {formatTime(point.time)}
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-medium text-slate-800">Sales person:</span>{" "}
                      {salesPersonName || "Sales person"}
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-medium text-slate-800">Location:</span>{" "}
                      {point.location}
                    </p>
                    {point.description && (
                      <p className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600">
                        {point.description}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default SalesRouteMap;
