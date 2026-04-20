import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const STATE_CITY = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Tirupati","Nellore","Kurnool","Anantapur","Rajahmundry","Kakinada","Eluru"],
  "Arunachal Pradesh": ["Itanagar","Tawang","Pasighat","Ziro","Bombdila","Naharlagun","Tezu","Roing","Khonsa","Aalo"],
  "Assam": ["Guwahati","Jorhat","Dibrugarh","Silchar","Nagaon","Tezpur","Tinsukia","Bongaigaon","Diphu","Sivasagar"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Begusarai","Ara","Madhubani","Katihar"],
  "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Durg","Korba","Jagdalpur","Rajnandgaon","Raigarh","Ambikapur","Dhamtari"],
  "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim","Curchorem","Canacona","Quepem","Mormugao"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Gandhinagar","Anand","Navsari","Porbandar"],
  "Haryana": ["Gurugram","Faridabad","Panipat","Karnal","Hisar","Ambala","Rohtak","Yamunanagar","Sonepat","Jind"],
  "Himachal Pradesh": ["Shimla","Dharamshala","Mandi","Solan","Kangra","Una","Hamirpur","Bilaspur","Kullu","Chamba"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh","Giridih","Ranchi Cantonment","Bundu","Chaibasa"],
  "Karnataka": ["Bengaluru","Mysuru","Mangalore","Hubli-Dharwad","Belgaum","Ballari","Tumakuru","Mysore (Periyapatna)","Davangere","Hassan"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kannur","Kollam","Alappuzha","Palakkad","Malappuram","Pathanamthitta"],
  "Madhya Pradesh": ["Bhopal","Indore","Gwalior","Jabalpur","Ujjain","Sagar","Satna","Rewa","Ratlam","Dewas"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Thane","Navi Mumbai","Kolhapur","Solapur","Amravati"],
  "Manipur": ["Imphal","Thoubal","Churachandpur","Bishnupur","Kakching","Senapati","Tamenglong","Ukhrul","Chandel","Jiribam"],
  "Meghalaya": ["Shillong","Tura","Nongpoh","Jowai","Nongstoin","Williamnagar","Mawkyrwat","Resubelpara","Baghmara","Nongpoh (repeat omitted)"],
  "Mizoram": ["Aizawl","Lunglei","Champhai","Kolasib","Serchhip","Mamit","Saiha","Lawngtlai","Saitual","Kawnpui"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunheboto","Phek","Mon","Longleng","Kiphire"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Puri","Balasore","Jharsuguda","Bokaro (note: Bokaro is in Jharkhand)","Paradip"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Hoshiarpur","Pathankot","Kapurthala","Sangrur"],
  "Rajasthan": ["Jaipur","Jodhpur","Udaipur","Kota","Ajmer","Bikaner","Alwar","Bharatpur","Sikar","Tonk"],
  "Sikkim": ["Gangtok","Namchi","Gyalshing","Mangan","Singtam","Jorethang","Rhenock","Soreng","Pakyong","Geyzing"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Erode","Vellore","Tirunelveli","Thoothukudi","Nagercoil"],
  "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Mahbubnagar","Nalgonda","Suryapet","Adilabad","Ramagundam"],
  "Tripura": ["Agartala","Udaipur","Dharmanagar","Khowai","Bishalgarh","Jolaibari","Kamalpur","Kishoreganj","Sonamura","Amarpur"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Prayagraj","Varanasi","Agra","Noida","Ghaziabad","Meerut","Bareilly","Aligarh"],
  "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rishikesh","Nainital","Haldwani (repeat omitted)","Udham Singh Nagar","Pithoragarh","Kashipur"],
  "West Bengal": ["Kolkata","Howrah","Durgapur","Siliguri","Asansol","Bardhaman","Kharagpur","Haldia","Berhampore","Malda"]
};

const BLOOD_TYPES = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

// Name validation (letters, spaces, dot, apostrophe, hyphen) 2-100 chars
const NAME_REGEX = /^[A-Za-z.'\- ]{2,100}$/;

export default function DonorAuth({ onSuccess, initialMode }) {
  const [mode, setMode] = useState(initialMode === "signup" ? "signup" : "login");
  const [step, setStep] = useState("email"); // "email" | "form" | "otp"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // login
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // signup
  const [signup, setSignup] = useState({
    email: "",
    name: "",
    phone: "",
    age: "",
    gender: "",
    bloodType: "",
    state: "",
    city: ""
  });
  const [pendingSignup, setPendingSignup] = useState(null);

  // UI validation hints (live)
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    phone: "",
    age: ""
  });

  useEffect(() => {
    if (initialMode === "signup") {
      setMode("signup");
      setStep("form");
    }
  }, [initialMode]);

  function updateSignup(k, v) {
    setSignup(prev => ({ ...prev, [k]: v }));
    // reset field-specific error if user edits
    if (k === "name") setFieldErrors(fe => ({ ...fe, name: "" }));
    if (k === "phone") setFieldErrors(fe => ({ ...fe, phone: "" }));
    if (k === "age") setFieldErrors(fe => ({ ...fe, age: "" }));
    if (k === "state") setSignup(prev => ({ ...prev, city: "" }));
  }

  // live-clean name: allow only letters, spaces, dot, apostrophe, hyphen
  function onNameChange(raw) {
    const cleaned = raw.replace(/[^A-Za-z.'\- ]+/g, "");
    updateSignup("name", cleaned);
    // live hint: too short (only show if user typed something invalid length)
    if (cleaned && (cleaned.length < 2 || cleaned.length > 100)) {
      setFieldErrors(fe => ({ ...fe, name: "Name should be 2–100 characters" }));
    } else {
      setFieldErrors(fe => ({ ...fe, name: "" }));
    }
  }

  // sanitize phone: keep only digits while typing
  function onPhoneChange(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 10); // cap to 10 for UX
    updateSignup("phone", digits);
    if (digits && digits.length !== 10) {
      setFieldErrors(fe => ({ ...fe, phone: "Phone must be 10 digits" }));
    } else {
      setFieldErrors(fe => ({ ...fe, phone: "" }));
    }
  }

  // sanitize age: keep only digits while typing
  function onAgeChange(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 2); // reasonable cap
    updateSignup("age", digits);
    const ageNum = Number(digits);
    if (digits && (isNaN(ageNum) || ageNum < 18 || ageNum > 65)) {
      setFieldErrors(fe => ({ ...fe, age: "Age must be 18–65" }));
    } else {
      setFieldErrors(fe => ({ ...fe, age: "" }));
    }
  }

  async function sendOtp(emailToUse) {
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "failed to send otp");
      setStep("otp");
      setMsg("OTP sent — check mail/logs (dev).");
    } catch (err) {
      setMsg(err.message || "error");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpAndLogin(emailToUse, otpCode) {
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse, otp: otpCode })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "verify failed");
      // store token for donor
      if (j.token) localStorage.setItem("donor_token", j.token);
      return j;
    } finally {
      setLoading(false);
    }
  }

  // Login handlers
  async function handleSendOtpLogin(e) {
    e && e.preventDefault();
    if (!email) { setMsg("enter email"); return; }
    await sendOtp(email);
  }

  async function handleVerifyLogin(e) {
    e && e.preventDefault();
    if (!otp) { setMsg("enter otp"); return; }
    try {
      const j = await verifyOtpAndLogin(email, otp);
      const userObj = j.user || j.donor || { email };
      if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
      if (onSuccess) onSuccess(j);
    } catch (err) {
      setMsg(err.message || "verify failed");
    }
  }

  // Signup flow
  async function handleCreateAccount(e) {
    e && e.preventDefault();

    // required fields check
    if (!signup.name || !signup.bloodType) {
      setMsg("name and blood type required");
      return;
    }

    // name validation (submit-time)
    if (!NAME_REGEX.test(signup.name.trim())) {
      setFieldErrors(fe => ({ ...fe, name: "Invalid name — use letters, spaces, . ' - only" }));
      setMsg("please enter a valid name");
      return;
    }

    // phone validation: exactly 10 digits
    if (!signup.phone || !/^[0-9]{10}$/.test(signup.phone)) {
      setFieldErrors(fe => ({ ...fe, phone: "Phone must be exactly 10 digits" }));
      setMsg("enter a valid 10-digit phone number");
      return;
    }

    // age validation: integer between 18 and 65
    const ageNum = Number(signup.age);
    if (!signup.age || isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      setFieldErrors(fe => ({ ...fe, age: "Age must be a number between 18 and 65" }));
      setMsg("age must be a number between 18 and 65");
      return;
    }

    // email must be provided as last field, ensure it's present before sending OTP
    if (!signup.email) {
      setMsg("please provide email (last field)");
      return;
    }
    try {
      await sendOtp(signup.email);
      setPendingSignup({ ...signup });
      setStep("otp");
      setMode("signup");
    } catch (err) {
      // message set in sendOtp
    }
  }

  // After OTP verify, create donor profile
  async function handleVerifySignupOtp(e) {
    e && e.preventDefault();
    if (!otp) { setMsg("enter otp"); return; }
    if (!pendingSignup) { setMsg("no signup in progress"); return; }

    try {
      const j = await verifyOtpAndLogin(pendingSignup.email, otp);
      const token = j.token;

      // create donor profile
      const res = await fetch(`${API_BASE}/donors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: pendingSignup.name,
          phone: pendingSignup.phone,
          age: pendingSignup.age,
          gender: pendingSignup.gender,
          bloodType: pendingSignup.bloodType,
          state: pendingSignup.state,
          city: pendingSignup.city
        })
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "create profile failed");

      const donorObj = body.donor || j.user || { email: pendingSignup.email, name: pendingSignup.name };

      // persist token + user
      if (token) localStorage.setItem("donor_token", token);
      localStorage.setItem("user", JSON.stringify(donorObj));

      setPendingSignup(null);
      setMsg("Account created and logged in.");

      if (onSuccess) onSuccess({ token, user: donorObj });
    } catch (err) {
      setMsg(err.message || "signup failed");
    }
  }

  return (
    <div>
      {/* LOGIN */}
      {mode === "login" ? (
        step === "email" ? (
          <form onSubmit={handleSendOtpLogin} className="space-y-3">
            <label className="block text-sm font-medium">Email</label>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="hint">Or <button type="button" className="text-red-600 underline" onClick={() => { setMode("signup"); setStep("form"); setMsg(""); }}>Create account</button></div>
              <button className="btn btn-primary" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
            </div>
            {msg && <div className="hint mt-2">{msg}</div>}
          </form>
        ) : (
          <form onSubmit={handleVerifyLogin} className="space-y-3">
            <label className="block text-sm font-medium">Enter OTP</label>
            <input className="input" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" onClick={() => { setStep("email"); setMsg(""); }} className="btn btn-outline">Change email</button>
              <button className="btn btn-primary" disabled={loading}>{loading ? "Verifying..." : "Verify"}</button>
            </div>
            {msg && <div className="hint mt-2">{msg}</div>}
          </form>
        )
      ) : (
        /* SIGNUP */
        <>
          {step === "form" && (
            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Full name</label>
                  <input
                    className="input"
                    value={signup.name}
                    onChange={e => onNameChange(e.target.value)}
                    placeholder="Your full name"
                  />
                  {fieldErrors.name && <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    className="input"
                    value={signup.phone}
                    onChange={e => onPhoneChange(e.target.value)}
                    placeholder="10 digits"
                  />
                  {fieldErrors.phone && <div className="text-xs text-red-600 mt-1">{fieldErrors.phone}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium">Age</label>
                  <input
                    className="input"
                    value={signup.age}
                    onChange={e => onAgeChange(e.target.value)}
                    placeholder="18 - 65"
                  />
                  {fieldErrors.age && <div className="text-xs text-red-600 mt-1">{fieldErrors.age}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium">Gender</label>
                  <select className="input" value={signup.gender} onChange={e => updateSignup("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Blood Group</label>
                  <select className="input" value={signup.bloodType} onChange={e => updateSignup("bloodType", e.target.value)}>
                    <option value="">Select</option>
                    {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">State</label>
                  <select className="input" value={signup.state} onChange={e => updateSignup("state", e.target.value)}>
                    <option value="">Select State</option>
                    {Object.keys(STATE_CITY).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">City</label>
                  <select className="input" value={signup.city} onChange={e => updateSignup("city", e.target.value)} disabled={!signup.state}>
                    <option value="">{signup.state ? "Select" : "Pick state first"}</option>
                    {signup.state && STATE_CITY[signup.state].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Email LAST */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Email (for OTP)</label>
                  <input className="input" value={signup.email} onChange={e => updateSignup("email", e.target.value)} placeholder="user@example.com" />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => { setMode("login"); setStep("email"); setMsg(""); }} className="btn btn-outline">Cancel</button>
                <button className="btn btn-primary" disabled={loading}>{loading ? "Sending OTP..." : "Create account"}</button>
              </div>
            </form>
          )}

          {step === "otp" && pendingSignup && (
            <form onSubmit={handleVerifySignupOtp} className="space-y-3 mt-3">
              <label className="block text-sm font-medium">Enter OTP for {pendingSignup.email}</label>
              <input className="input" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => { setPendingSignup(null); setStep("form"); setMsg(""); }} className="btn btn-outline">Cancel</button>
                <button className="btn btn-primary" disabled={loading}>{loading ? "Verifying..." : "Complete signup"}</button>
              </div>
            </form>
          )}
        </>
      )}

      {msg && <div className="hint mt-2">{msg}</div>}
    </div>
  );
}
