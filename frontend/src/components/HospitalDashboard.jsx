import React, { useEffect, useState } from "react";
import DonorList from "./DonorList";

// Environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// Full STATE_CITY map — 28 states / UTs with up to 15 major cities each
const STATE_CITY = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Tirupati","Kadapa","Rajahmundry","Eluru","Ongole","Anantapur","Chittoor","Proddatur","Machilipatnam","Srikakulam"],
  "Arunachal Pradesh": ["Itanagar","Tawang","Pasighat","Ziro","Bomdila","Naharlagun","Roing","Tezu","Along","Namsai","Khonsa","Changlang","Seppa","Yingkiong","Daporijo"],
  "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Tezpur","Nagaon","Tinsukia","Bongaigaon","Karimganj","Goalpara","Diphu","Sivasagar","Lakhimpur","Hailakandi","Barpeta"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Begusarai","Bihar Sharif","Katihar","Munger","Arrah","Chhapra","Hajipur","Siwan","Motihari"],
  "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Korba","Durg","Rajnandgaon","Jagdalpur","Ambikapur","Raigarh","Dhamtari","Mahasamund","Kanker","Kawardha","Jashpur","Surajpur"],
  "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim","Curchorem","Valpoi","Sanquelim","Canacona","Quepem","Mormugao","Cuncolim","Majorda","Arambol"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Gandhinagar","Anand","Vapi","Navsari","Mehsana","Bharuch","Morbi","Porbandar","Palanpur"],
  "Haryana": ["Gurugram","Faridabad","Panipat","Karnal","Hisar","Ambala","Rohtak","Yamunanagar","Sirsa","Rewari","Bahadurgarh","Jind","Sonipat","Kaithal","Palwal"],
  "Himachal Pradesh": ["Shimla","Mandi","Solan","Kangra","Dharamshala","Hamirpur","Una","Bilaspur","Chamba","Kullu","Palampur","Nurpur","Nahan","Paonta Sahib","Sundernagar"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Hazaribagh","Deoghar","Giridih","Ramgarh","Chaibasa","Phusro","Chirkunda","Jharia","Sahebganj","Latehar","Khunti"],
  "Karnataka": ["Bengaluru","Mysuru","Mangalore","Hubli","Belgaum","Ballari","Tumkur","Shivamogga","Davangere","Bidar","Hassan","Raichur","Udupi","Chitradurga","Bagalkot"],
  "Kerala": ["Kochi","Thiruvananthapuram","Kozhikode","Kannur","Thrissur","Kollam","Palakkad","Alappuzha","Malappuram","Pathanamthitta","Kottayam","Idukki","Wayanad","Ernakulam","Kasargod"],
  "Madhya Pradesh": ["Bhopal","Indore","Gwalior","Jabalpur","Ujjain","Sagar","Rewa","Satna","Ratlam","Dewas","Katni","Chhindwara","Shivpuri","Bhind","Sehore"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Kolhapur","Thane","Navi Mumbai","Amravati","Jalgaon","Akola","Latur","Sangli","Ratnagiri"],
  "Manipur": ["Imphal","Thoubal","Churachandpur","Bishnupur","Kakching","Ukhrul","Senapati","Tamenglong","Moreh","Jiribam","Moirang","Tengnoupal","Noney","Pherzawl","Sadbhavna"],
  "Meghalaya": ["Shillong","Tura","Nongpoh","Jowai","Baghmara","Mairang","Resubelpara","Mawkyrwat","Nongstoin","Raliang","Amlarem","Mendipathar","Umroi","Pynursla","Ranikor"],
  "Mizoram": ["Aizawl","Lunglei","Champhai","Kolasib","Serchhip","Saiha","Mamit","Lawngtlai","Hnahthial","Biate","Vairengte","North Vanlaiphai","Reiek","Bairabi","Bungtlang"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunheboto","Phek","Mon","Kiphire","Longleng","Chumukedima","Tseminyu","Medziphema","Pfutsero","Chozuba"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Balasore","Baripada","Jharsuguda","Kendrapara","Puri","Angul","Jajpur","Bhadrak","Khurda","Rayagada"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Hoshiarpur","Firozpur","Pathankot","Barnala","Moga","Malerkotla","Phagwara","Rajpura","Sangrur"],
  "Rajasthan": ["Jaipur","Udaipur","Jodhpur","Kota","Ajmer","Bikaner","Alwar","Bharatpur","Sikar","Pali","Sri Ganganagar","Tonk","Chittorgarh","Barmer","Jhunjhunu"],
  "Sikkim": ["Gangtok","Namchi","Geyzing","Mangan","Jorethang","Singtam","Rangpo","Ravangla","Soreng","Pelling","Dentam","Bermiok","Tsongmo","Yuksom","Zaluk"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Erode","Vellore","Tirunelveli","Thoothukudi","Nagercoil","Karur","Cuddalore","Dharmapuri","Ambur","Dindigul"],
  "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Mahbubnagar","Ramagundam","Adilabad","Suryapet","Nalgonda","Miryalaguda","Jagtial","Sangareddy","Zahirabad","Bodhan"],
  "Tripura": ["Agartala","Udaipur","Dharmanagar","Kailashahar","Ambassa","Belonia","Kamalpur","Jirania","Khowai","Lankamura","Sabroom","Melaghar","Sonamura","Teliamura","Airapata"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Varanasi","Agra","Prayagraj","Ghaziabad","Noida","Meerut","Bareilly","Mathura","Aligarh","Gorakhpur","Jhansi","Moradabad","Shahjahanpur"],
  "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Kashipur","Rishikesh","Rudrapur","Pithoragarh","Almora","Tehri","Nainital","Mussoorie","Bageshwar","Chamoli","Uttarkashi"],
  "West Bengal": ["Kolkata","Howrah","Durgapur","Siliguri","Asansol","Kharagpur","Haldia","Bardhaman","Malda","Jalpaiguri","Berhampore","Serampore","Balurghat","Raiganj","Cooch Behar"]
};

const BLOOD_TYPES = ["O+","O-","A+","A-","B+","B-","AB+","AB-"];

async function fetchJson(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    let text;
    try { text = await res.text(); } catch (e) { text = null; }
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
    if (!res.ok) {
      const err = (body && body.error) || (typeof body === 'string' ? body : `HTTP ${res.status}`);
      throw new Error(err);
    }
    return body;
  } catch (e) {
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
      throw new Error('Network error or blocked by CORS (Failed to fetch). Is the backend running and reachable at ' + API_BASE + '?');
    }
    throw e;
  }
}

export default function HospitalDashboard({ user, onLogout }) {
  const token = localStorage.getItem("hospital_token");

  const DEFAULT_PROFILE = {
    email: user?.email || "",
    phone: "",
    name: "",
    address: "",
    city: "",
    state: ""
  };

  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [msg, setMsg] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [form, setForm] = useState({ bloodType: "O+", state: "", city: "", message: "" });
  const [posting, setPosting] = useState(false);

  const [donors, setDonors] = useState([]);
  const [showDonors, setShowDonors] = useState(false);
  const [donorSearchMeta, setDonorSearchMeta] = useState({ bloodType:"", state:"", city:"" });
  const [currentRequestId, setCurrentRequestId] = useState(null);

  useEffect(() => {
    console.log("[useEffect] token:", token ? "present" : "absent");
    if (token) {
      console.log("[useEffect] calling fetchProfile and fetchRequests");
      fetchProfile();
      fetchRequests();
    } else {
      console.log("[useEffect] no token available");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchProfile() {
    if (!token) return;
    setLoadingProfile(true);
    try {
      const j = await fetchJson(`${API_BASE}/hospital/profile`, { headers: { Authorization: `Bearer ${token}` } });
      console.log("[fetchProfile] raw response:", j);

      let backend = j?.hospital || j || {};
      console.log("[fetchProfile] extracted backend:", backend);

      setProfile(prev => {
        const final = {
          email: (backend?.email || user?.email || prev.email || "") + "",
          name: (backend?.name || prev.name || "") + "",
          phone: (backend?.phone || prev.phone || "") + "",
          address: (backend?.address || prev.address || "") + "",
          city: (backend?.city || prev.city || "") + "",
          state: (backend?.state || prev.state || "") + ""
        };
        console.log("[fetchProfile] final profile:", final);
        try { localStorage.setItem("hospital_profile", JSON.stringify(final)); } catch (e) {}
        return final;
      });
    } catch (e) {
      console.error("fetchProfile error:", e);
      try {
        const cached = localStorage.getItem("hospital_profile");
        if (cached) {
          const cachedProfile = JSON.parse(cached);
          console.log("[fetchProfile] restored from cache:", cachedProfile);
          setProfile(prev => ({ ...prev, ...cachedProfile }));
        } else {
          setMsg("Could not load profile. " + (e.message || String(e)));
        }
      } catch (err) {
        console.error("[fetchProfile] localStorage fallback failed:", err);
        setMsg("Could not load profile. " + (e.message || String(e)));
      }
    } finally {
      setLoadingProfile(false);
    }
  }

  async function saveProfile(e) {
    e && e.preventDefault();
    if (!token) return setMsg("not authenticated");

    const phone = (profile.phone || "").trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      return setMsg("Phone number must be 10 digits (numbers only).");
    }

    setLoadingProfile(true);
    try {
      const body = {
        name: profile.name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || ""
      };

      const j = await fetchJson(`${API_BASE}/hospital/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log("[saveProfile] response:", j);

      const responseData = j?.hospital || j || {};
      const newProfile = {
        email: responseData?.email || body.email || user?.email || "",
        name: responseData?.name || body.name || "",
        phone: responseData?.phone || body.phone || "",
        address: responseData?.address || body.address || "",
        city: responseData?.city || body.city || "",
        state: responseData?.state || body.state || ""
      };

      console.log("[saveProfile] final profile:", newProfile);
      setProfile(newProfile);
      try { localStorage.setItem("hospital_profile", JSON.stringify(newProfile)); } catch (e) {}

      setEditing(false);
      setMsg("Profile saved");
      setTimeout(() => setMsg(""), 1800);

      setTimeout(() => {
        console.log("[saveProfile] refreshing profile from backend...");
        fetchProfile();
      }, 300);
    } catch (e) {
      console.error("saveProfile error:", e);
      setMsg(e.message || String(e));
    } finally {
      setLoadingProfile(false);
    }
  }

  async function fetchRequests() {
    if (!token) return;
    setLoadingRequests(true);
    try {
      const j = await fetchJson(`${API_BASE}/hospital/requests`, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(j.requests || []);
    } catch (e) {
      console.error('fetchRequests error', e);
      setMsg(e.message || String(e));
    } finally {
      setLoadingRequests(false);
    }
  }

  async function postRequest(e) {
    e && e.preventDefault();
    if (!form.state || !form.city || !form.bloodType) {
      return setMsg("blood type, state and city are required");
    }
    setPosting(true);
    try {
      const payload = {
        requesterEmail: profile?.email || user?.email,
        bloodType: form.bloodType,
        city: form.city,
        state: form.state,
        message: form.message || "",
      };
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      await fetchJson(`${API_BASE}/requests`, { method: "POST", headers, body: JSON.stringify(payload) });
      await fetchRequests();
      setForm({ bloodType: "O+", state: "", city: "", message: "" });
      setMsg("Request posted");
      setTimeout(()=>setMsg(""), 1600);
    } catch (e) {
      console.error('postRequest error', e);
      setMsg(e.message || String(e));
    } finally {
      setPosting(false);
    }
  }

  async function deleteRequest(id) {
    if (!token) return setMsg("not authenticated");
    try {
      await fetchJson(`${API_BASE}/hospital/requests/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setRequests(prev => prev.filter(r => (r.id || r._id) !== id));
    } catch (e) {
      console.error('deleteRequest error', e);
      setMsg(e.message || String(e));
    }
  }

  async function handleFindDonors(req) {
  if (!token) return setMsg("not authenticated");

  setDonors([]);
  setCurrentRequestId(req.id || req._id || null);
  setDonorSearchMeta({ bloodType: req.bloodType, state: req.state, city: req.city });
  
  try {
    const j = await fetchJson(`${API_BASE}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        bloodType: req.bloodType,
        state: req.state,
        city: req.city
      }),
    });

    console.log("MATCH RESPONSE:", j);  // <-- VERY IMPORTANT
    
    setDonors(j.donors || []);
    setShowDonors(true);

    // store mode for UI message
    setDonorSearchMeta(prev => ({ ...prev, mode: j.mode || "unknown" }));

  } catch (e) {
    console.error("handleFindDonors error", e);
    setMsg(e.message || String(e));
  }
}

  const citiesForState = form.state ? (STATE_CITY[form.state] || []) : [];
  const profileCitiesForState = profile?.state ? (STATE_CITY[profile.state] || []) : [];

  function onFormStateChange(s) { setForm({ ...form, state: s, city: "" }); }
  function onProfileStateChange(s) { setProfile({ ...profile, state: s, city: "" }); }

  return (
    <div className="logged-shell" style={{ paddingTop: 36, background: "#fffaf9", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto", paddingBottom: 40 }}>
        <div className="app-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div className="brand" style={{ fontSize: 22, fontWeight: 900, color: "#c62828" }}>LifeLink</div>
            <div className="text-muted" style={{ fontSize: 13 }}>Hospital Dashboard</div>
          </div>

          <div className="header-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right", marginRight: 8 }}>
              <div style={{ fontWeight: 700 }}>{user?.email}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>Hospital</div>
            </div>
            <button className="btn btn-outline" onClick={onLogout}>Logout</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 18, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Create Blood Request</div>
                <div className="hint">Help patients get donors fast</div>
              </div>

              <form onSubmit={postRequest} style={{ marginTop: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <select className="input" value={form.state} onChange={(e)=> onFormStateChange(e.target.value)} required style={{ padding: 10 }}>
                    <option value="">State / UT</option>
                    {Object.keys(STATE_CITY).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <select className="input" value={form.city} onChange={(e)=>setForm({...form, city: e.target.value})} disabled={!form.state} required style={{ padding: 10 }}>
                    <option value="">{form.state ? "Select City" : "Select State first"}</option>
                    {citiesForState.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select className="input" value={form.bloodType} onChange={(e)=>setForm({...form, bloodType: e.target.value})} style={{ padding: 10 }}>
                    {BLOOD_TYPES.map(b=> <option key={b} value={b}>{b}</option>)}
                  </select>

                  <input className="input" placeholder="Message (Optional)" value={form.message} onChange={(e)=>setForm({...form, message: e.target.value})} style={{ padding: 10 }} />
                </div>

                <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-start" }}>
                  <button className="btn btn-primary" disabled={posting} style={{ padding: "10px 18px", boxShadow: "0 6px 12px rgba(198,40,40,0.18)" }}>
                    {posting ? "Posting..." : "Post Request"}
                  </button>
                </div>

                {msg && <div className="toast mt-2" style={{ marginTop: 12 }}>{msg} <button className="link" onClick={()=>{ setMsg(''); }}>{' '}Dismiss</button></div>}
              </form>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800 }}>Your Requests</div>
                <div className="hint">Manage or find matching donors</div>
              </div>

              <div style={{ marginTop: 12 }}>
                {loadingRequests ? <div className="hint">Loading...</div> : (
                  (requests.length === 0) ? <div className="hint">No requests yet</div> : (
                    <div style={{ display: "grid", gap:12 }}>
                      {requests.map(r => {
                        const rid = r.id || r._id;
                        return (
                          <div key={rid} className="list-item" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: 10, borderRadius: 8, background: "#fff" }}>
                            <div style={{ maxWidth: "72%" }}>
                              <div style={{ fontWeight:700 }}>{r.bloodType} — {r.city || '—'}, {r.state || '—'}</div>
                              <div className="hint" style={{ marginTop:6 }}>{r.message}</div>
                              <div className="text-muted" style={{ marginTop:8, fontSize:13 }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</div>
                            </div>

                            <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'flex-end' }}>
                              <button className="btn btn-primary" onClick={()=>handleFindDonors(r)}>Find donors</button>
                              <button className="btn btn-outline" onClick={()=>deleteRequest(rid)}>Delete</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 18, padding: 18 }}>
              <div style={{ display: "flex", justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontWeight: 800 }}>Hospital Profile</div>
                <div>
                  {editing ? (
                    <button className="btn btn-outline" onClick={()=>{ setEditing(false); fetchProfile(); }}>Cancel</button>
                  ) : (
                    <button className="btn btn-outline" onClick={()=>setEditing(true)}>Edit</button>
                  )}
                </div>
              </div>

              <div style={{ marginTop:12 }}>
                {loadingProfile ? <div className="hint">Loading...</div> : (
                  editing ? (
                    <form onSubmit={saveProfile} className="space-y-2" style={{ display: "grid", gap: 10 }}>
                      <div>
                        <label className="text-muted">Name</label>
                        <input className="input" value={profile?.name || ""} onChange={e=>setProfile({...profile, name: e.target.value})} placeholder="Hospital / Clinic name" />
                      </div>

                      <div>
                        <label className="text-muted">Email</label>
                        <input className="input" value={profile?.email || user?.email || ""} disabled />
                      </div>

                      <div>
                        <label className="text-muted">Phone</label>
                        <input
                          className="input"
                          type="tel"
                          value={profile?.phone || ""}
                          onChange={e=>setProfile({...profile, phone: e.target.value.replace(/[^\d]/g,'')})}
                          placeholder="10 digit phone (numbers only)"
                          maxLength={10}
                        />
                        <div className="hint" style={{ fontSize: 12 }}>Enter 10 digit mobile number</div>
                      </div>

                      <div>
                        <label className="text-muted">State / UT</label>
                        <select className="input" value={profile?.state || ""} onChange={e=>onProfileStateChange(e.target.value)}>
                          <option value="">Select State / UT</option>
                          {Object.keys(STATE_CITY).map(s=> <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-muted">City</label>
                        <select className="input" value={profile?.city || ""} onChange={e=>setProfile({...profile, city: e.target.value})} disabled={!profile?.state}>
                          <option value="">Select City</option>
                          {profileCitiesForState.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-muted">Address</label>
                        <input className="input" value={profile?.address || ""} onChange={e=>setProfile({...profile, address: e.target.value})} placeholder="Street, building, area" />
                      </div>

                      <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
                        <button className="btn btn-primary" disabled={loadingProfile}>{loadingProfile? 'Saving...':'Save'}</button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display:'grid', gap:10 }}>

                      <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 80 }}>Name:</div>
                        <div style={{ flex: 1, textAlign: 'right', wordBreak: 'break-word' }}>
                          <strong style={{ display: 'inline-block' }}>{profile?.name || "No name set — click Edit"}</strong>
                        </div>
                      </div>

                      <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 80 }}>Email:</div>
                        <div style={{ flex: 1, textAlign: 'right', wordBreak: 'break-word' }}>
                          <strong style={{ display: 'inline-block' }}>{profile?.email || user?.email || "—"}</strong>
                        </div>
                      </div>

                      <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 80 }}>Phone:</div>
                        <div style={{ flex: 1, textAlign: 'right', wordBreak: 'break-word' }}>
                          <strong style={{ display: 'inline-block' }}>{profile?.phone ? profile.phone : <span style={{color:'#b03636'}}>No phone set — click Edit</span>}</strong>
                        </div>
                      </div>

                      <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 80 }}>Address:</div>
                        <div style={{ flex: 1, textAlign: 'right', wordBreak: 'break-word' }}>
                          <strong style={{ display: 'inline-block', maxWidth: 260 }}>{profile?.address || "No address set — click Edit"}</strong>
                        </div>
                      </div>

                      <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 80 }}>Location:</div>
                        <div style={{ flex: 1, textAlign: 'right', wordBreak: 'break-word' }}>
                          <strong style={{ display: 'inline-block' }}>{profile?.city ? `${profile.city}, ${profile.state}` : "No location set — click Edit"}</strong>
                        </div>
                      </div>

                    </div>
                  )
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight:800 }}>Quick Actions</div>
              <div className="hint" style={{ marginTop:8 }}>Utilities for hospital</div>
              <div style={{ marginTop:12, display:'flex', gap:10 }}>
                <button className="btn btn-outline" onClick={fetchProfile}>Refresh Profile</button>
                <button className="btn btn-outline" onClick={fetchRequests}>Reload Requests</button>
              </div>
            </div>
          </div>
        </div>

        {showDonors && (
          <div style={{
            position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:40, padding:20, background: 'rgba(0,0,0,0.3)'
          }}>
            <div style={{ width:'min(1100px,96%)', maxHeight:'86vh', overflow:'auto' }}>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontWeight:800 }}>Matching Donors for Request ID: {currentRequestId}</div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button className="btn btn-outline" onClick={()=>{ setShowDonors(false); setDonors([]); setCurrentRequestId(null); setDonorSearchMeta({ bloodType:'', state:'', city:'' }); }}>Close</button>
                  </div>
                </div>

                <div style={{ marginTop:12 }}>
                  <DonorList initial={donors} meta={donorSearchMeta} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
