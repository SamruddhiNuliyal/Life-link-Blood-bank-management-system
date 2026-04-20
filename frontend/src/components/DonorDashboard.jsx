import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function DonorDashboard({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("donor_token");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_BASE}/donors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to fetch profile");
      setProfile(j.donor || null);
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const body = {
        name: profile.name,
        phone: profile.phone,
        age: profile.age,
        gender: profile.gender,
        bloodType: profile.bloodType,
        state: profile.state,
        city: profile.city,
      };
      const res = await fetch(`${API_BASE}/donors/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to save profile");
      setMsg("Saved");
      setTimeout(() => setMsg(""), 1400);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return (
      <div className="logged-shell" style={{ paddingTop: 36 }}>
        <div style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div className="app-header">
            <div>
              <div className="brand">LifeLink</div>
              <div className="text-muted">Donor Dashboard</div>
            </div>
            <div className="header-right">
              <div style={{ textAlign: "right", marginRight: 8 }}>
                <div style={{ fontWeight: 700 }}>{user.email}</div>
                <div className="text-muted">Donor</div>
              </div>
              <button className="btn btn-outline" onClick={onLogout}>Logout</button>
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 800 }}>Create your donor profile</div>
              <div className="hint">Profile is required to match with hospitals</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <form onSubmit={saveProfile} className="grid-2">
                <input className="input" placeholder="Full name" value={profile?.name || ""} onChange={(e)=>setProfile({...profile, name:e.target.value})} />
                <input className="input" placeholder="Phone" value={profile?.phone || ""} onChange={(e)=>setProfile({...profile, phone:e.target.value})} />
                <input className="input" placeholder="Age" value={profile?.age || ""} onChange={(e)=>setProfile({...profile, age:e.target.value})} />
                <select className="input" value={profile?.gender || ""} onChange={(e)=>setProfile({...profile, gender: e.target.value})}>
                  <option value="">Gender</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
                <select className="input" value={profile?.bloodType || ""} onChange={(e)=>setProfile({...profile, bloodType:e.target.value})}>
                  <option value="">Blood Type</option>
                  {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(b=> <option key={b} value={b}>{b}</option>)}
                </select>
                <input className="input" placeholder="State" value={profile?.state || ""} onChange={(e)=>setProfile({...profile, state:e.target.value})} />
                <input className="input" placeholder="City" value={profile?.city || ""} onChange={(e)=>setProfile({...profile, city:e.target.value})} />
                <input className="input" placeholder="Email (readonly)" value={user.email} disabled />
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="button" className="btn btn-outline" onClick={fetchProfile}>Refresh</button>
                  <button className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save profile"}</button>
                </div>
              </form>
              {msg && <div className="toast mt-2">{msg}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="logged-shell" style={{ paddingTop: 36 }}>
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <div className="app-header">
          <div>
            <div className="brand">LifeLink</div>
            <div className="text-muted">Donor Dashboard</div>
          </div>

          <div className="header-right">
            <div style={{ textAlign: "right", marginRight: 8 }}>
              <div style={{ fontWeight: 700 }}>{user.email}</div>
              <div className="text-muted">Donor</div>
            </div>
            <button className="btn btn-outline" onClick={onLogout}>Logout</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800 }}>Your Profile</div>
                <div className="hint">Update your info to receive matches</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <form onSubmit={saveProfile} className="grid-2">
                  <input className="input" placeholder="Full name" value={profile.name || ""} onChange={(e)=>setProfile({...profile, name:e.target.value})} />
                  <input className="input" placeholder="Phone" value={profile.phone || ""} onChange={(e)=>setProfile({...profile, phone:e.target.value})} />
                  <input className="input" placeholder="Age" value={profile.age || ""} onChange={(e)=>setProfile({...profile, age:e.target.value})} />
                  <select className="input" value={profile.gender || ""} onChange={(e)=>setProfile({...profile, gender:e.target.value})}>
                    <option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                  <select className="input" value={profile.bloodType || ""} onChange={(e)=>setProfile({...profile, bloodType:e.target.value})}>
                    <option value="">Blood Type</option>
                    {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(b=> <option key={b} value={b}>{b}</option>)}
                  </select>
                  <input className="input" placeholder="State" value={profile.state || ""} onChange={(e)=>setProfile({...profile, state:e.target.value})} />
                  <input className="input" placeholder="City" value={profile.city || ""} onChange={(e)=>setProfile({...profile, city:e.target.value})} />
                  <input className="input" placeholder="Email" value={user.email} disabled />
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button type="button" className="btn btn-outline" onClick={fetchProfile}>Refresh</button>
                    <button className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save profile"}</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Donation History</div>
              <div className="hint">Recent donations and eligibility</div>
              <div style={{ marginTop: 12 }}>
                <div className="list-item">No donations yet — you will appear here when you donate.</div>
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800 }}>Profile Summary</div>
                <div className="hint">Quick view</div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <div className="list-item"><strong>Name:</strong> {profile.name || "—"}</div>
                <div className="list-item"><strong>Email:</strong> {user.email}</div>
                <div className="list-item"><strong>Blood type:</strong> {profile.bloodType || "—"}</div>
                <div className="list-item"><strong>Last donation:</strong> —</div>
                <div className="list-item"><strong>Location:</strong> {profile.city ? `${profile.city}, ${profile.state}` : "—"}</div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 800 }}>Eligibility</div>
              <div className="hint" style={{ marginTop: 8 }}>Auto-calculated based on donation history (placeholder)</div>
              <div style={{ marginTop: 12 }}>
                <div className="list-item">You're eligible to donate.</div>
              </div>
            </div>
          </div>
        </div>

        {msg && <div className="toast" style={{ marginTop: 12 }}>{msg}</div>}
      </div>
    </div>
  );
}
