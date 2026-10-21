/**
 * coordinate-mapper.js
 *
 * Converts real-world lat/lng coordinates into Babylon.js XZ scene positions.
 *
 * The math:  "It's just the xyz coordinates of an object and a perspective
 * algorithm with scale applied when the angles change." — Babylon handles the
 * perspective automatically once we give it the right Vector3 position.
 *
 * Coordinate convention:
 *   Lat  → Z axis  (north = -Z, matching Babylon's default forward)
 *   Lng  → X axis  (east  = +X)
 *   Alt  → Y axis  (height above terrain, default 0)
 *
 * Usage:
 *   const mapper = new CoordinateMapper({ lat: 25.0, lng: -80.0 }, 0.001);
 *   const pos = mapper.toVector3(40.758, -73.985);   // → BABYLON.Vector3
 *   const ll  = mapper.fromVector3(pos);              // → { lat, lng }
 */
class CoordinateMapper {
    /**
     * @param {{ lat: number, lng: number }} originLatLng
     *   The real-world coordinate that maps to scene origin (0, 0, 0).
     *   Default: Miami Beach area (suits an island scene).
     *
     * @param {number} scale
     *   Babylon units per metre.
     *   0.001  = 1 unit per km  (global view — 20-unit scene = 20 km)
     *   0.01   = 1 unit per 100 m (city view)
     *   0.1    = 1 unit per 10 m  (neighbourhood view)
     */
    constructor(
        originLatLng = { lat: 25.761681, lng: -80.191788 },
        scale = 0.002
    ) {
        this.origin = originLatLng;
        this.scale  = scale;

        // Metres per degree at origin latitude
        this._mPerDegLat = 110540;
        this._mPerDegLng = 111320 * Math.cos(originLatLng.lat * (Math.PI / 180));
    }

    /**
     * Convert lat/lng → BABYLON.Vector3(x, y, z)
     * @param {number} lat
     * @param {number} lng
     * @param {number} [altitudeM=0]  Height above terrain in metres
     * @returns {BABYLON.Vector3}
     */
    toVector3(lat, lng, altitudeM = 0) {
        const deltaLat = lat - this.origin.lat;
        const deltaLng = lng - this.origin.lng;

        const x =  deltaLng * this._mPerDegLng * this.scale;
        const z = -deltaLat * this._mPerDegLat * this.scale;  // north = -Z
        const y =  altitudeM * this.scale;

        return new BABYLON.Vector3(x, y, z);
    }

    /**
     * Convert BABYLON.Vector3 → { lat, lng }
     * @param {BABYLON.Vector3} v
     * @returns {{ lat: number, lng: number }}
     */
    fromVector3(v) {
        const deltaLat =  -v.z / (this._mPerDegLat * this.scale);
        const deltaLng =   v.x / (this._mPerDegLng * this.scale);
        return {
            lat: this.origin.lat + deltaLat,
            lng: this.origin.lng + deltaLng,
        };
    }

    /**
     * Radius in metres → Babylon scene units
     * @param {number} radiusMetres
     * @returns {number}
     */
    radiusToUnits(radiusMetres) {
        return radiusMetres * this.scale;
    }

    /**
     * Update the scale factor at runtime (e.g. for zoom in/out)
     * @param {number} newScale
     */
    setScale(newScale) {
        this.scale = newScale;
        this._mPerDegLng = 111320 * Math.cos(this.origin.lat * (Math.PI / 180));
    }
}

// Expose globally for use in index.html and other scripts
window.CoordinateMapper = CoordinateMapper;
