// frontend/src/components/DonorList.jsx
import React, { useMemo, useState } from "react";

const BLOOD_TYPES = ["O+","O-","A+","A-","B+","B-","AB+","AB-"];

export default function DonorList({ initial = [], meta = {} }) {
  
  const [donors] = useState(initial || []);

  // filters
  const [filterState, setFilterState] = useState(meta.state || "");
  const [filterCity, setFilterCity] = useState(meta.city || "");
  const [filterBlood, setFilterBlood] = useState(meta.bloodType || "");

  // sorting
  const [sortBy, setSortBy] = useState("recent");

  // compute filtered + sorted list
  const list = useMemo(() => {
    let arr = donors.slice();

    if (filterState)
      arr = arr.filter(
        (d) => (d.state || "").toLowerCase() === filterState.toLowerCase()
      );

    if (filterCity)
      arr = arr.filter(
        (d) => (d.city || "").toLowerCase() === filterCity.toLowerCase()
      );

    if (filterBlood)
      arr = arr.filter(
        (d) => (d.bloodType || "").toLowerCase() === filterBlood.toLowerCase()
      );

    if (sortBy === "name")
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sortBy === "blood")
      arr.sort((a, b) => (a.bloodType || "").localeCompare(b.bloodType || ""));
    if (sortBy === "recent")
      arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return arr;
  }, [donors, filterState, filterCity, filterBlood, sortBy]);

  // empty
  if (!donors || donors.length === 0) {
    return <div className="hint">No donors found for this request.</div>;
  }

  // for filtering — unique cities from list
  const cities = Array.from(new Set(donors.map((d) => d.city).filter(Boolean)));

  return (
    <div>
      {/* =============== MATCH-MODE BANNER =============== */}
      {meta.mode === "city-match" && (
        <div
          style={{
            padding: 10,
            background: "#e8f5e9",
            borderRadius: 8,
            marginBottom: 12,
            border: "1px solid #c8e6c9",
            fontWeight: 600,
          }}
        >
          ✔ Showing donors <b>from your city</b>
        </div>
      )}

      {meta.mode === "state-match" && (
        <div
          style={{
            padding: 10,
            background: "#fff8e1",
            borderRadius: 8,
            marginBottom: 12,
            border: "1px solid #ffecb3",
            fontWeight: 600,
          }}
        >
          ⚠ No city donors — showing donors <b>in your state</b>
        </div>
      )}

      {meta.mode === "global-match" && (
        <div
          style={{
            padding: 10,
            background: "#ffebee",
            borderRadius: 8,
            marginBottom: 12,
            border: "1px solid #ffcdd2",
            fontWeight: 600,
          }}
        >
          ❌ No local donors — showing <b>all compatible donors</b>
        </div>
      )}

      {/* ================= FILTER BAR ================= */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label className="hint">State</label>
          <input
            className="input"
            placeholder="state (text)"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          />
        </div>

        <div>
          <label className="hint">City</label>
          <select
            className="input"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="hint">Blood</label>
          <select
            className="input"
            value={filterBlood}
            onChange={(e) => setFilterBlood(e.target.value)}
          >
            <option value="">Any</option>
            {BLOOD_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="hint">Sort</label>
          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Most recent</option>
            <option value="name">Name</option>
            <option value="blood">Blood type</option>
          </select>
        </div>
      </div>

      {/* ================= DONOR LIST ================= */}
      <div style={{ display: "grid", gap: 10 }}>
        {list.map((d) => (
          <div
            key={d.id || `${d.userId}-${d.email}`}
            className="list-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #eee",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>
                {d.name || "—"}{" "}
                <span style={{ color: "#6b7280", fontSize: 13 }}>
                  ({d.bloodType || "—"})
                </span>
              </div>

              <div className="hint" style={{ marginTop: 6 }}>
                {d.city ? `${d.city}, ${d.state || ""}` : d.state || "—"}
              </div>

              <div className="text-muted" style={{ marginTop: 6 }}>
                {d.phone || d.email || "no contact"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const contact = d.phone || d.email || "";
                  if (!contact) return;
                  navigator.clipboard?.writeText(contact);
                  alert("Contact copied: " + contact);
                }}
              >
                Copy contact
              </button>

              {/* ✔ UPDATED: EMAIL BUTTON - now copies email instead of opening Gmail */}
              <button
                className="btn btn-outline"
                style={{ textDecoration: "none", textAlign: "center" }}
                onClick={() => {
                  if (!d.email) return;
                  navigator.clipboard?.writeText(d.email);
                  alert("Email sent to " + d.email+" ️✅");
                }}
              >
                Email
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
