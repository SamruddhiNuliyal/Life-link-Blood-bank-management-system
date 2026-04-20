// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import LifeLinkLanding from "./components/LifeLinkLanding";
import DonorDashboard from "./components/DonorDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import BackgroundCanvas from "./components/BackgroundCanvas";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(()=> {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.email || parsed.id)) setUser(parsed);
      } catch {}
    }
  }, []);

  function onLogout(){
    localStorage.removeItem("donor_token");
    localStorage.removeItem("hospital_token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  }

  function handleAuthSuccess(payload, type) {
    try {
      const maybeUser = payload?.user || payload?.hospital || null;
      if (maybeUser) {
        localStorage.setItem("user", JSON.stringify(maybeUser));
        setUser(maybeUser);
      }
      if (payload?.token) {
        if (type === "donor") localStorage.setItem("donor_token", payload.token);
        if (type === "hospital") localStorage.setItem("hospital_token", payload.token);
      }
    } catch (e) {
      console.warn("auth success handler failed", e);
    }
  }

  if (!user) {
    return (
      <div>
        <div className="bg-canvas-wrap"><BackgroundCanvas /></div>

        {/* Render the new LifeLinkLanding and forward the auth success callbacks */}
        <LifeLinkLanding
          onDonorSuccess={(payload) => handleAuthSuccess(payload, "donor")}
          onHospitalSuccess={(payload) => handleAuthSuccess(payload, "hospital")}
          initialTab="donor"
        />
      </div>
    );
  }

  const isHospital = !!localStorage.getItem("hospital_token");
  const isDonor = !!localStorage.getItem("donor_token");

  if (isHospital) {
    return <HospitalDashboard user={user} onLogout={onLogout} />;
  }

  if (isDonor) {
    return <DonorDashboard user={user} onLogout={onLogout} />;
  }

  return (
    <div style={{minHeight:'100vh', padding:'2.25rem'}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
          <div>
            <div style={{fontWeight:800, fontSize:20, color:'#b91c1c'}}>LifeLink</div>
            <div style={{color:'#6b7280', fontSize:13}}>Welcome back</div>
          </div>
          <div>
            <button className="btn btn-outline" onClick={onLogout}>Logout</button>
          </div>
        </div>

        <div className="card">
          <div style={{fontWeight:700}}>You are logged in</div>
          <div className="hint" style={{marginTop:8}}>Dashboard selection couldn't be determined, but you're authenticated.</div>
        </div>
      </div>
    </div>
  );
}
