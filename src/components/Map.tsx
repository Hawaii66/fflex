import { Circle, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { getGeoLocations } from "@/lib/api";

type Circle = {
  lat: number;
  lng: number;
  radius: number;
  label: string;
};

const WorldMap = () => {
  const [positions, setPositions] = useState<Circle[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await getGeoLocations();
      setPositions(
        response.map((i) => ({
          lat: i.Latitude,
          lng: i.Longitude,
          radius: i.Radius,
          label: i.Name,
        }))
      );
    };
    load();
  }, []);

  return (
    <div className="w-screen h-screen">
      <MapContainer
        style={{ height: "100vh", width: "100%" }}
        center={[61.15, 13]}
        zoom={12}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {positions.map((circle, index) => (
          <Circle
            key={index}
            center={[circle.lat, circle.lng]}
            radius={circle.radius}
          >
            <Tooltip>
              <span className="font-semibold text-lg">{circle.label} </span>
            </Tooltip>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
