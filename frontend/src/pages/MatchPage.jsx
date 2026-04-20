// src/pages/MatchPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LOCATIONS } from "../data/locations";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("hospital_token");
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export default function MatchPage() {
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [bloodType, setBloodType] = useState("A+");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state && LOCATIONS[state]) setCities(LOCATIONS[state]);
    else setCities([]);
    setCity("");
  }, [state]);

  const stateOptions = useMemo(() => Object.keys(LOCATIONS), []);

  async function findMatches(e) {
    e && e.preventDefault();
    setError("");
    setLoading(true);
    setDonors([]);
    try {
      const res = await fetch(`${API_BASE}/match`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ bloodType, city: city || undefined, state: state || undefined }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Match failed");
      setDonors(j.donors || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // small helper to copy email/phone
  function copy(text) {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    alert("Copied to clipboard: " + text);
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
      <motion.h2 initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-semibold mb-4">
        Find Matching Donors
      </motion.h2>

      <form onSubmit={findMatches} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-sm text-gray-600">State</label>
          <select value={state} onChange={(e)=>setState(e.target.value)} className="w-full p-2 border rounded">
            <option value="">— Select state —</option>
            {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">City</label>
          <select value={city} onChange={(e)=>setCity(e.target.value)} className="w-full p-2 border rounded" disabled={!cities.length}>
            <option value="">{cities.length ? "— Select city —" : "Select state first"}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Blood Type</label>
          <select value={bloodType} onChange={(e)=>setBloodType(e.target.value)} className="w-full p-2 border rounded">
            {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>

        <div>
          <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded">
            {loading ? "Searching..." : "Find Donors"}
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-6">
        <div className="text-sm text-gray-600 mb-2">Results ({donors.length})</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {donors.map(d => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-slate-50 rounded shadow-sm">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-lg font-medium">{d.name || "— No name —"}</div>
                  <div className="text-sm text-gray-600">{d.email}</div>
                  <div className="text-sm">Blood: <strong>{d.bloodType}</strong></div>
                  <div className="text-sm">Location: {d.city}, {d.state}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={()=>copy(d.email)} className="px-3 py-1 border rounded text-sm">Copy email</button>
                  <button onClick={()=>copy(d.phone)} className="px-3 py-1 border rounded text-sm">Copy phone</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
