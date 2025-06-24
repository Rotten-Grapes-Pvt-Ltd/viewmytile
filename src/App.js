import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { transformExtent } from "ol/proj";
import "ol/ol.css";
import "./App.css";

function App() {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [pathUrl, setPathUrl] = useState("");
  const [cogInfo, setCogInfo] = useState(null);
  const [bandType, setBandType] = useState("single");
  const [selectedBand, setSelectedBand] = useState(1);
  const [colormap, setColormap] = useState("viridis");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [nodataValue, setNodataValue] = useState("");
  const [tileLayer, setTileLayer] = useState(null);

  const titilerUrl = "http://127.0.0.1:8000"; // Assuming titiler server is running here

  useEffect(() => {
    const cogTileLayer = new TileLayer({ source: new XYZ({ url: "" }) });
    const mapInstance = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), cogTileLayer],
      view: new View({
        center: [8747875, 2831018],
        zoom: 18,
      }),
    });
    setMap(mapInstance);
    setTileLayer(cogTileLayer);

    return () => mapInstance.setTarget(null);
  }, []);

  useEffect(() => {
    const fetchCogInfo = async () => {
      if (pathUrl.trim()) {
        const apiUrl = `${titilerUrl}/cog/info?url=${encodeURIComponent(
          pathUrl
        )}`;

        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          console.log("COG Info:", data);
          setCogInfo(data);
        } catch (error) {
          console.error("Error fetching COG info:", error);
          setCogInfo(null);
        }
      } else {
        setCogInfo(null);
      }
    };

    const timeoutId = setTimeout(fetchCogInfo, 500);
    return () => clearTimeout(timeoutId);
  }, [pathUrl]);

  const updateTileSource = () => {
    if (tileLayer && pathUrl.trim()) {
      let tileUrl = `${titilerUrl}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(
        pathUrl
      )}`;

      if (cogInfo?.count !== 3) {
        tileUrl += `&colormap_name=${colormap}`;

        if (
          (cogInfo?.count === 1 ||
            (cogInfo?.count > 1 && cogInfo?.count !== 3)) &&
          minValue &&
          maxValue
        ) {
          tileUrl += `&rescale=${minValue},${maxValue}`;
        }

        if (cogInfo?.count > 1 && cogInfo?.count !== 3) {
          tileUrl += `&bidx=${selectedBand}`;
        }

        if (cogInfo?.count !== 3 && nodataValue) {
          tileUrl += `&nodata=${nodataValue}`;
        }
      } else {
        tileUrl += `&rescale=0,255`;
      }

      tileLayer.getSource().setUrl(tileUrl);
    }
  };

  const showTile = () => {
    updateTileSource();

    if (map && cogInfo?.bounds) {
      const epsgCode = cogInfo.crs?.split("/").pop();
      const sourceCrs = `EPSG:${epsgCode}`;
      const transformedBounds = transformExtent(
        cogInfo.bounds,
        sourceCrs,
        "EPSG:3857"
      );
      map.getView().fit(transformedBounds, { padding: [20, 20, 20, 20] });
    }
  };

  useEffect(() => {
    if (tileLayer && pathUrl.trim()) {
      updateTileSource();
    }
  }, [colormap, minValue, maxValue, selectedBand, nodataValue]);

  return (
    <div className="app">
      <div ref={mapRef} className="map"></div>
      <div className="upload-card">
        <h3>Enter Path/URL</h3>
        <p className="note">Only EPSG:4326 is supported at the moment</p>
        <input
          type="text"
          value={pathUrl}
          onChange={(e) => setPathUrl(e.target.value)}
          placeholder="/path/to/file.tif or https://example.com/file.tif"
          className="file-input"
        />
        <div className="controls">
          {cogInfo?.count > 1 && cogInfo?.count !== 3 && (
            <>
              <label className="control-label">Band:</label>
              <select
                value={selectedBand}
                onChange={(e) => setSelectedBand(parseInt(e.target.value))}
                className="dropdown"
              >
                {cogInfo.band_descriptions?.map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Band {index + 1}
                  </option>
                ))}
              </select>
            </>
          )}

          {(cogInfo?.count === 1 ||
            (cogInfo?.count > 1 && cogInfo?.count !== 3)) && (
            <>
              <label className="control-label">Min Value:</label>
              <input
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="dropdown"
                placeholder="Min value"
              />

              <label className="control-label">Max Value:</label>
              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                className="dropdown"
                placeholder="Max value"
              />

              <label className="control-label">NoData Value:</label>
              <input
                type="number"
                value={nodataValue}
                onChange={(e) => setNodataValue(e.target.value)}
                className="dropdown"
                placeholder="NoData value"
              />
            </>
          )}

          {cogInfo?.count !== 3 && (
            <>
              <label className="control-label">Colormap:</label>
              <select
                value={colormap}
                onChange={(e) => setColormap(e.target.value)}
                className="dropdown"
              >
                <option value="viridis">Viridis</option>
                <option value="plasma">Plasma</option>
                <option value="inferno">Inferno</option>
                <option value="magma">Magma</option>
                <option value="coolwarm">Coolwarm</option>
                <option value="jet">Jet</option>
              </select>
            </>
          )}
        </div>

        <button onClick={showTile} className="submit-btn">
          Show Tile
        </button>
        {cogInfo && (
          <div className="cog-info">
            <h4>COG Information</h4>
            <div className="info-grid">
              <div>
                <strong>Dimensions:</strong> {cogInfo.width} × {cogInfo.height}
              </div>
              <div>
                <strong>Bands:</strong> {cogInfo.count}
              </div>
              <div>
                <strong>Data Type:</strong> {cogInfo.dtype}
              </div>
              <div>
                <strong>Driver:</strong> {cogInfo.driver}
              </div>
              <div>
                <strong>CRS:</strong> {cogInfo.crs?.split("/").pop()}
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="footer">
        <a
          href="https://rottengrapes.tech/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Rotten Grapes Private Limited
        </a>
      </footer>
    </div>
  );
}

export default App;
