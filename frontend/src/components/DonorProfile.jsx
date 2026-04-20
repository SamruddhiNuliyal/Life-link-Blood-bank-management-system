import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function DonorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Read user from localStorage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  })();

  const [form, setForm] = useState({
    email: storedUser?.email || "",
    name: "",
    phone: "",
    age: "",
    gender: "",
    bloodType: "",
    state: "",
    city: "",
  });

  // ---------------------------------------------------
  // LOAD EXISTING PROFILE FROM BACKEND ON PAGE LOAD
  // ---------------------------------------------------
  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return; // user not logged in
      }

      try {
        const res = await fetch(`${API_BASE}/donors/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const d = data.donor;

          setForm({
            email: d.email,
            name: d.name,
            phone: d.phone,
            age: d.age,
            gender: d.gender,
            bloodType: d.bloodType,
            state: d.state,
            city: d.city,
          });
        }
      } catch (err) {
        console.log("Error loading profile:", err);
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  // update any field
  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ---------------------------------------------------
  // SAVE PROFILE (CREATE OR UPDATE)
  // ---------------------------------------------------
  async function handleSave(e) {
    e.preventDefault();

    setMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", text: "Not logged in" });
      return;
    }

    if (!form.name || !form.bloodType) {
      setMessage({ type: "error", text: "Name & blood type required" });
      return;
    }

    setSaving(true);

    try {
      const isNew = false; // we use PUT /donors/me always now

      const res = await fetch(`${API_BASE}/donors/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "ok", text: "Profile saved successfully" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save profile",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    }

    setSaving(false);
  }

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------

  if (loading) {
    return <div className="p-4 text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="card p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-3">Your Donor Profile</h2>

      <form onSubmit={handleSave} className="grid gap-4">

        <label className="font-medium text-sm">
          Email (readonly)
          <input
            className="input"
            value={form.email}
            readOnly
          />
        </label>

        <label className="font-medium text-sm">
          Full Name
          <input
            className="input"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your name"
          />
        </label>

        <label className="font-medium text-sm">
          Phone
          <input
            className="input"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="font-medium text-sm">
            Age
            <input
              className="input"
              value={form.age}
              onChange={(e) => updateField("age", e.target.value)}
            />
          </label>

          <label className="font-medium text-sm">
            Gender
            <select
              className="input"
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
        </div>

        <label className="font-medium text-sm">
          Blood Type
          <select
            className="input"
            value={form.bloodType}
            onChange={(e) => updateField("bloodType", e.target.value)}
          >
            <option value="">Select</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>O+</option>
            <option>O-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
        </label>

        <label className="font-medium text-sm">
          State
          <input
            className="input"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
          />
        </label>

        <label className="font-medium text-sm">
          City
          <input
            className="input"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="py-2 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {message && (
          <div
            className={
              message.type === "ok"
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
