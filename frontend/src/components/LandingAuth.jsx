// src/LandingAuth.jsx
import React, { useState, useEffect } from "react";
import DonorAuth from "./components/DonorAuth";
import HospitalAuth from "./components/HospitalAuth";
import "./index.css";

/**
 * LandingAuth
 * - Shows centered brand and strapline
 * - Shows two toggles side-by-side ("Donor registration", "Hospital registration")
 * - Only the selected form component is rendered (DonorAuth or HospitalAuth)
 * - Forwards onSuccess(payload, type) where type is 'donor' or 'hospital'
 *
 * This file intentionally contains only UI changes — no changes to the child component behavior.
 */
export default function LandingAuth({ onSuccess, initialTab = null }) {
  // initialTab can be 'donor' | 'hospital' or null (no preselect)
  const [active, setActive] = useState(initialTab === "hospital" ? "hospital" : (initialTab === "donor" ? "donor" : null));

  // If the app wants to auto-open donor/hospital, we respect initialTab if provided via props.
  useEffect(() => {
    if (initialTab === "donor") setActive("donor");
    if (initialTab === "hospital") setActive("hospital");
  }, [initialTab]);

  // wrapper to forward onSuccess with type label
  function handleSuccessDonor(payload) {
    if (onSuccess) onSuccess(payload, "donor");
  }
  function handleSuccessHospital(payload) {
    if (onSuccess) onSuccess(payload, "hospital");
  }

  return (
    <div className="landing-wrap" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="landing-card" style={{ width: "min(1150px, 96%)", maxWidth: 1150 }}>
        {/* header: centered brand + small logo placeholder */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {/* simple logo circle - replace with image if desired */}
            <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg,#f43f5e,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(244,63,94,0.12)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 2C10.343 2 9 3.343 9 5C9 7.5 12 11 12 11C12 11 15 7.5 15 5C15 3.343 13.657 2 12 2Z" fill="white"/>
                <path d="M6 12C4.343 12 3 13.343 3 15C3 18.866 7 22 12 22C17 22 21 18.866 21 15C21 13.343 19.657 12 18 12H6Z" fill="white"/>
              </svg>
            </div>

            <div style={{ fontSize: 28, fontWeight: 900, color: "#b91c1c", lineHeight: 1, marginTop: 6 }}>
              LifeLink
            </div>

            <div style={{ color: "#6b7280", fontSize: 14 }}>
              Connect donors and hospitals — fast.
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>Get started</div>
            <div className="hint">Choose whichever applies to you</div>
          </div>

          {/* Toggle row centered */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ display: "inline-flex", gap: 12, background: "transparent", padding: 6, borderRadius: 12 }}>
              <button
                type="button"
                onClick={() => setActive("donor")}
                className={`btn-toggle ${active === "donor" ? "active" : ""}`}
                style={{
                  minWidth: 180,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: active === "donor" ? "1px solid rgba(185,28,28,0.12)" : "1px solid #eee",
                  background: active === "donor" ? "linear-gradient(180deg, rgba(185,28,28,0.08), rgba(185,28,28,0.02))" : "#fff",
                  fontWeight: 700,
                  color: active === "donor" ? "#b91c1c" : "#111827",
                  cursor: "pointer"
                }}
              >
                Donor registration
              </button>

              <button
                type="button"
                onClick={() => setActive("hospital")}
                className={`btn-toggle ${active === "hospital" ? "active" : ""}`}
                style={{
                  minWidth: 180,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: active === "hospital" ? "1px solid rgba(185,28,28,0.12)" : "1px solid #eee",
                  background: active === "hospital" ? "linear-gradient(180deg, rgba(185,28,28,0.08), rgba(185,28,28,0.02))" : "#fff",
                  fontWeight: 700,
                  color: active === "hospital" ? "#b91c1c" : "#111827",
                  cursor: "pointer"
                }}
              >
                Hospital registration
              </button>
            </div>
          </div>

          {/* center area: show only the selected form. Keep original two-panel layout when a form is visible. */}
          <div style={{ marginTop: 6 }}>
            {active === null && (
              <div style={{ textAlign: "center", padding: "24px 12px", color: "#6b7280" }}>
                Click a toggle above to open the registration form.
              </div>
            )}

            {active === "donor" && (
              <div className="register-grid" style={{ marginTop: 6 }}>
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="panel-title">Donor</div>
                  <DonorAuth initialMode="signup" onSuccess={(payload) => handleWrapped(payload, "donor")} />
                </div>
              </div>
            )}

            {active === "hospital" && (
              <div className="register-grid" style={{ marginTop: 6 }}>
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="panel-title">Hospital</div>
                  <HospitalAuth initialMode="signup" onSuccess={(payload) => handleWrapped(payload, "hospital")} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <div className="hint">Tip: after OTP and profile creation you will be signed in automatically.</div>
          </div>
        </div>
      </div>
    </div>
  );

  // helper inside so JXS above remains concise
  function handleWrapped(payload, type) {
    if (type === "donor") handleSuccessDonor(payload);
    if (type === "hospital") handleSuccessHospital(payload);
  }
}
