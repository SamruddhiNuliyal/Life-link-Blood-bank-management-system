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
  "Haryana": ["Gurugram","Faridabad","Panipat","Karnal","Hisar","Ambala","Rohtak","Yamunanagar","Sonipat","Jind"],
  "Himachal Pradesh": ["Shimla","Dharamshala","Mandi","Solan","Kangra","Una","Hamirpur","Bilaspur","Kullu","Chamba"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh","Giridih","Dumka","Chaibasa","Ramgarh"],
  "Karnataka": ["Bengaluru","Mysuru","Mangalore","Hubli","Belgaum","Ballari","Tumakuru","Davangere","Hassan","Udupi"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kannur","Kollam","Alappuzha","Palakkad","Malappuram","Pathanamthitta"],
  "Madhya Pradesh": ["Bhopal","Indore","Gwalior","Jabalpur","Ujjain","Sagar","Satna","Rewa","Ratlam","Dewas"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Thane","Navi Mumbai","Kolhapur","Solapur","Amravati"],
  "Manipur": ["Imphal","Thoubal","Churachandpur","Bishnupur","Kakching","Senapati","Tamenglong","Ukhrul","Chandel","Jiribam"],
  "Meghalaya": ["Shillong","Tura","Nongpoh","Jowai","Nongstoin","Mairang","Resubelpara","Mawkyrwat","Baghmara","Nongtalang"],
  "Mizoram": ["Aizawl","Lunglei","Champhai","Kolasib","Serchhip","Mamit","Saiha","Lawngtlai","Hnahthial","Bairabi"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunheboto","Phek","Mon","Longleng","Kiphire"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Puri","Balasore","Jharsuguda","Brahmapur","Kendrapara"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Hoshiarpur","Firozpur","Pathankot","Sangrur"],
  "Rajasthan": ["Jaipur","Jodhpur","Udaipur","Kota","Ajmer","Bikaner","Alwar","Bharatpur","Sikar","Tonk"],
  "Sikkim": ["Gangtok","Namchi","Gyalshing","Mangan","Singtam","Jorethang","Ravangla","Pakyong","Soreng","Rhenock"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Erode","Vellore","Tirunelveli","Thoothukudi","Nagercoil"],
  "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Mahbubnagar","Nalgonda","Suryapet","Adilabad","Ramagundam"],
  "Tripura": ["Agartala","Udaipur","Dharmanagar","Khowai","Dhaleswar","Dharmanagar (East)","Kamalpur","Belonia","Jirania","Sonamura"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Prayagraj","Varanasi","Agra","Noida","Ghaziabad","Meerut","Bareilly","Aligarh"],
  "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rishikesh","Nainital","Pithoragarh","Udham Singh Nagar","Kashipur","Mussoorie"],
  "West Bengal": ["Kolkata","Howrah","Durgapur","Siliguri","Asansol","Bardhaman","Kharagpur","Haldia","Berhampore","Malda","Jalpaiguri"]
};

// Name validation (letters, spaces, dot, apostrophe, hyphen) 2-100 chars
const NAME_REGEX = /^[A-Za-z.'\- ]{2,100}$/;

export default function HospitalAuth({ onSuccess, initialMode }) {
  const [mode, setMode] = useState(
    initialMode === "signup" ? "signup" : "login"
  );
  const [step, setStep] = useState("email"); // email → form → otp
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [signup, setSignup] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    state: "",
    city: "",
  });

  const [pendingSignup, setPendingSignup] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    phone: ""
  });

  useEffect(() => {
    if (initialMode === "signup") {
      setMode("signup");
      setStep("form");
    }
  }, [initialMode]);

  function updateSignup(key, val) {
    setSignup((old) => ({ ...old, [key]: val }));
    if (key === "state") {
      setSignup((old) => ({ ...old, city: "" }));
    }
    if (key === "name") setFieldErrors(fe => ({ ...fe, name: "" }));
    if (key === "phone") setFieldErrors(fe => ({ ...fe, phone: "" }));
  }

  // live-clean name for hospital (same rules)
  function onNameChange(raw) {
    const cleaned = raw.replace(/[^A-Za-z.'\- ]+/g, "");
    updateSignup("name", cleaned);
    if (cleaned && (cleaned.length < 2 || cleaned.length > 100)) {
      setFieldErrors(fe => ({ ...fe, name: "Name should be 2–100 characters" }));
    } else {
      setFieldErrors(fe => ({ ...fe, name: "" }));
    }
  }

  // live sanitize phone
  function onPhoneChange(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    updateSignup("phone", digits);
    if (digits && digits.length !== 10) {
      setFieldErrors(fe => ({ ...fe, phone: "Phone must be 10 digits" }));
    } else {
      setFieldErrors(fe => ({ ...fe, phone: "" }));
    }
  }

  // -------------------------
  // sendOtp (DEV-friendly: shows preview URL)
  // -------------------------
  async function sendOtp(emailToUse) {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/hospital/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const j = await res.json();

      if (!res.ok) {
        console.error("send-otp failed:", j);
        throw new Error(j.error || "failed to send OTP");
      }

      // If backend provided a Nodemailer preview URL, show it (dev).
      if (j.preview) {
        setMsg(`OTP sent — preview: ${j.preview}`);
        console.log("OTP preview URL:", j.preview);
      } else {
        setMsg("OTP sent — check email or server logs (dev).");
      }

      setStep("otp");
    } catch (e) {
      setMsg(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // verifyOtpAndLogin
  // -------------------------
  async function verifyOtpAndLogin(emailToUse, otpValue) {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/hospital/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse, otp: otpValue }),
      });

      const j = await res.json();
      console.log("verify-otp response:", res.status, j);

      if (!res.ok) throw new Error(j.error || "OTP verification failed");

      // store token (hospital token key)
      if (j.token) localStorage.setItem("hospital_token", j.token);

      return j;
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Login handlers
  // -------------------------
  async function handleLoginOtp(e) {
    e.preventDefault();
    if (!email) return setMsg("Enter email");
    await sendOtp(email);
  }

  async function handleVerifyLogin(e) {
    e.preventDefault();
    if (!otp) return setMsg("Enter OTP");

    try {
      const j = await verifyOtpAndLogin(email, otp);
      const userObj = j.hospital || j.user || { email };
      localStorage.setItem("user", JSON.stringify(userObj));
      if (onSuccess) onSuccess(j);
    } catch (e) {
      setMsg(e.message);
    }
  }

  // -------------------------
  // Signup handlers
  // -------------------------
  async function handleSignupStart(e) {
    e.preventDefault();
    if (!signup.name || !signup.email) {
      return setMsg("Hospital name and email required");
    }

    // name validation (submit-time still)
    if (!NAME_REGEX.test(signup.name.trim())) {
      setFieldErrors(fe => ({ ...fe, name: "Invalid hospital name — use letters, spaces, . ' - only" }));
      return setMsg("please enter a valid hospital name");
    }

    // phone validation: exactly 10 digits
    if (!signup.phone || !/^[0-9]{10}$/.test(signup.phone)) {
      setFieldErrors(fe => ({ ...fe, phone: "Phone must be exactly 10 digits" }));
      return setMsg("enter a valid 10-digit phone number");
    }

    await sendOtp(signup.email);
    setPendingSignup({ ...signup });
  }

  async function handleSignupOtp(e) {
    e.preventDefault();
    if (!otp) return setMsg("Enter OTP");

    if (!pendingSignup) {
      return setMsg("No pending signup session");
    }

    try {
      // verify & login, get token
      const j = await verifyOtpAndLogin(pendingSignup.email, otp);
      const token = j.token;

      // IMPORTANT: use PUT /hospital/profile to update the profile (protected)
      const res = await fetch(`${API_BASE}/hospital/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pendingSignup.name,
          phone: pendingSignup.phone,
          address: pendingSignup.address,
          state: pendingSignup.state,
          city: pendingSignup.city,
        }),
      });

      const body = await res.json();
      console.log("PUT /hospital/profile ->", res.status, body);

      if (!res.ok) throw new Error(body.error || "Failed to save hospital profile");

      const hospitalObj = body.hospital || j.hospital || { email: pendingSignup.email };

      localStorage.setItem("user", JSON.stringify(hospitalObj));
      if (onSuccess) onSuccess({ token, user: hospitalObj, hospital: hospitalObj });
    } catch (e) {
      setMsg(e.message);
    }
  }

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* LOGIN MODE */}
      {mode === "login" && step === "email" && (
        <form onSubmit={handleLoginOtp} className="space-y-3">
          <label>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@hospital.org"
          />

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <p className="hint">
            Or{" "}
            <button
              type="button"
              className="text-red-600 underline"
              onClick={() => {
                setMode("signup");
                setStep("form");
                setMsg("");
              }}
            >
              Create account
            </button>
          </p>

          {msg && <p className="hint break-words">{msg}</p>}
        </form>
      )}

      {/* LOGIN OTP */}
      {mode === "login" && step === "otp" && (
        <form onSubmit={handleVerifyLogin} className="space-y-3">
          <label>Enter OTP</label>
          <input
            className="input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
          />

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>

          {msg && <p className="hint">{msg}</p>}
        </form>
      )}

      {/* SIGNUP FORM */}
      {mode === "signup" && step === "form" && (
        <form onSubmit={handleSignupStart} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label>Hospital Name</label>
              <input
                className="input"
                value={signup.name}
                onChange={(e) => onNameChange(e.target.value)}
              />
              {fieldErrors.name && <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div>}
            </div>

            <div>
              <label>Phone</label>
              <input
                className="input"
                value={signup.phone}
                onChange={(e) => onPhoneChange(e.target.value)}
              />
              {fieldErrors.phone && <div className="text-xs text-red-600 mt-1">{fieldErrors.phone}</div>}
            </div>

            <div>
              <label>State</label>
              <select
                className="input"
                value={signup.state}
                onChange={(e) => updateSignup("state", e.target.value)}
              >
                <option value="">Select State</option>
                {Object.keys(STATE_CITY).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label>City</label>
              <select
                className="input"
                value={signup.city}
                onChange={(e) => updateSignup("city", e.target.value)}
                disabled={!signup.state}
              >
                <option value="">Select City</option>
                {signup.state &&
                  STATE_CITY[signup.state].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label>Address</label>
              <input
                className="input"
                value={signup.address}
                onChange={(e) => updateSignup("address", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label>Email (for OTP)</label>
              <input
                className="input"
                value={signup.email}
                onChange={(e) => updateSignup("email", e.target.value)}
                placeholder="admin@hospital.org"
              />
            </div>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Sending OTP..." : "Create Account"}
          </button>

          {msg && <p className="hint break-words">{msg}</p>}
        </form>
      )}

      {/* SIGNUP OTP */}
      {mode === "signup" && step === "otp" && pendingSignup && (
        <form onSubmit={handleSignupOtp} className="space-y-3">
          <label>Enter OTP sent to {pendingSignup.email}</label>
          <input
            className="input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
          />

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Verifying..." : "Complete Signup"}
          </button>

          {msg && <p className="hint break-words">{msg}</p>}
        </form>
      )}
    </div>
  );
}
