// frontend/src/components/LifeLinkLanding.jsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DonorAuth from "./DonorAuth";
import HospitalAuth from "./HospitalAuth";

/**
 * Enhanced LifeLinkLanding (visual-only)
 * - Strictly no functional changes to DonorAuth / HospitalAuth
 * - ABOUT_PARAGRAPHS contains the About Us text you requested
 */

const pillSpring = { type: "spring", stiffness: 420, damping: 30 };

// === About Us content (replaceable) ===
const ABOUT_PARAGRAPHS = [
  "Our mission — To connect voluntary blood donors with patients in need, ensuring a sustainable supply of safe blood throughout India.",
  "Our vision — To create a community where every patient has access to adequate blood supply, supported by a network of committed donors and partners.",
  "About us — We are committed to saving lives through blood donation. Every donation counts in our mission to ensure timely access to safe blood for patients in need across India."
];

export default function LifeLinkLanding({
  onDonorSuccess = () => {},
  onHospitalSuccess = () => {},
  initialTab = "donor",
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [authModePreference, setAuthModePreference] = useState("signup");
  const [openFaq, setOpenFaq] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const confettiRef = useRef(null);

  // visual celebration (purely decorative)
  function showCelebrate() {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2200);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-rose-50 flex flex-col items-center justify-start py-12 px-4 overflow-x-hidden relative">
      {/* Parallax + rotating blobs */}
      <motion.div
        aria-hidden
        initial={{ rotate: 0, scale: 0.96, opacity: 0 }}
        animate={{ rotate: 6, scale: 1, opacity: 0.12 }}
        transition={{ duration: 12, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute left-[-8%] top-[-10%] w-[560px] h-[560px] rounded-full bg-gradient-to-br from-pink-300 to-indigo-300 blur-3xl -z-10"
      />
      <motion.div
        aria-hidden
        initial={{ rotate: 0, scale: 0.96, opacity: 0 }}
        animate={{ rotate: -8, scale: 1, opacity: 0.08 }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute right-[-6%] bottom-[-12%] w-[460px] h-[460px] rounded-full bg-gradient-to-br from-amber-200 to-emerald-200 blur-3xl -z-10"
      />

      {/* floating accents */}
      <motion.div
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 2, opacity: 0.12 }}
        transition={{ yoyo: Infinity, duration: 6 }}
        className="absolute left-[6%] top-[22%] -z-10"
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="url(#gradAccent)" /></svg>
      </motion.div>

      {/* Top UI (taskbar) */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="text-xl font-extrabold tracking-tight text-slate-800">LifeLink</div>
          <div className="text-xs text-slate-500">Beta</div>
        </div>

        <nav className="flex items-center gap-3">
          <motion.button whileHover={{ y: -3, scale: 1.02 }} onClick={() => { setActiveTab("donor"); window.scrollTo({ top: 140, behavior: "smooth" }); }} className={`px-4 py-2 rounded-full text-sm font-medium transition shadow-sm ${activeTab === "donor" ? "bg-white/95 text-slate-900" : "bg-white/40 text-slate-600 hover:bg-white/70"}`}>Donor</motion.button>
          <motion.button whileHover={{ y: -3, scale: 1.02 }} onClick={() => { setActiveTab("hospital"); window.scrollTo({ top: 140, behavior: "smooth" }); }} className={`px-4 py-2 rounded-full text-sm font-medium transition shadow-sm ${activeTab === "hospital" ? "bg-white/95 text-slate-900" : "bg-white/40 text-slate-600 hover:bg-white/70"}`}>Hospital</motion.button>
          <motion.button whileHover={{ y: -3, scale: 1.02 }} onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })} className="px-4 py-2 rounded-full text-sm font-medium bg-white/40 hover:bg-white/70 transition">About Us</motion.button>

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setAuthModePreference("login"); setActiveTab("donor"); window.scrollTo({ top: 140, behavior: "smooth" }); }} className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg">Login</motion.button>
        </nav>
      </header>

      <main className="w-full max-w-4xl">
        {/* Decorative gradient border + card */}
        <motion.section initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }} className="relative rounded-3xl p-1">
          <div className="rounded-3xl p-[2px] bg-gradient-to-r from-indigo-300 via-pink-300 to-amber-200 shadow-2xl">
            <div className="bg-white/85 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/30 relative overflow-hidden">
              {/* shimmering title */}
              <div className="flex flex-col items-center text-center">
                <motion.div initial={{ scale: 0.92, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ background: "linear-gradient(90deg,#FF8A80,#7C4DFF)" }} />
                    <div className="relative p-3 rounded-full bg-white shadow-md inline-block">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF6B6B"/><stop offset="100%" stopColor="#845EF7"/></linearGradient></defs>
                        <path d="M12 20s-7-4.35-9.07-7.06C0.87 9.84 3.22 6 6.5 6c1.79 0 3.12.9 3.5 2.06C10.88 6.9 12.21 6 14 6c3.28 0 5.63 3.84 3.57 6.94C19 15.65 12 20 12 20z" fill="url(#g2)" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-slate-800" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}>
                  <span style={{ background: "linear-gradient(90deg,#7C4DFF,#FF6B6B)", WebkitBackgroundClip: "text", color: "transparent" }}>LifeLink</span>
                </motion.h1>

                <motion.p className="mt-2 text-sm text-slate-600 max-w-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
                  Connecting donors and hospitals — fast, safe, and beautifully simple.
                </motion.p>
              </div>

              {/* pill toggles with animated glow */}
              <div className="mt-8 flex justify-center">
                <div className="relative inline-flex bg-slate-100 rounded-full p-1 shadow-sm">
                  <div className="relative flex items-center">
                    <motion.div className="absolute -inset-1 rounded-full pointer-events-none" animate={{ opacity: activeTab === "donor" ? 0.06 : 0.02 }} transition={{ duration: 0.35 }} style={{ filter: "blur(28px)" }} />
                    <motion.div className="absolute top-1 bottom-1 bg-white rounded-full shadow-md" layout transition={pillSpring} style={{ width: 220, left: activeTab === "donor" ? 6 : 230 }} />
                    <motion.button onClick={() => { setActiveTab("donor"); setAuthModePreference("signup"); }} whileHover={{ scale: 1.01 }} className={`relative z-10 px-7 py-2 text-sm font-semibold rounded-full w-[220px] ${activeTab === "donor" ? "text-slate-800" : "text-slate-500"}`}>Donor Registration</motion.button>
                    <motion.button onClick={() => { setActiveTab("hospital"); setAuthModePreference("signup"); }} whileHover={{ scale: 1.01 }} className={`relative z-10 px-7 py-2 text-sm font-semibold rounded-full w-[220px] ${activeTab === "hospital" ? "text-slate-800" : "text-slate-500"}`}>Hospital Registration</motion.button>
                  </div>
                </div>
              </div>

              {/* auth area: mounts your components (no change to their code) */}
              <div className="mt-10">
                <AnimatePresence exitBeforeEnter>
                  {activeTab === "donor" ? (
                    <motion.div key="donor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.28 }}>
                      <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.18 }} className="p-2 rounded-lg">
                        <DonorAuth onSuccess={onDonorSuccess} initialMode={authModePreference} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div key="hospital" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.28 }}>
                      <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.18 }} className="p-2 rounded-lg">
                        <HospitalAuth onSuccess={onHospitalSuccess} initialMode={authModePreference} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* inline CTA + small badge */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="text-xs text-slate-500">Secure · Verified · Fast</span>
                <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Community</span>
              </div>

              {/* celebration layer (purely decorative) */}
              {celebrate && (
                <div ref={confettiRef} className="pointer-events-none absolute inset-0 z-20">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                    <svg className="absolute left-10 top-6 w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M4 4h2v2H4z" fill="#FF8A80"/></svg>
                    <svg className="absolute right-14 top-20 w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6" fill="#7C4DFF"/></svg>
                    <svg className="absolute left-24 bottom-10 w-4 h-4" viewBox="0 0 24 24" fill="none"><rect width="8" height="8" rx="2" fill="#FFD54F"/></svg>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* About Us & FAQ with your paragraphs */}
        <section className="mt-8">
          <motion.div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">About LifeLink</h3>
                <div className="text-sm text-slate-600 space-y-3">
                  {ABOUT_PARAGRAPHS.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              <div className="hidden sm:block text-xs text-slate-500">
                <div>Version 1.0</div>
                <div>Built for communities</div>
              </div>
            </div>

            {/* FAQ quick list */}
            <div className="mt-4 space-y-2">
              {[
                { q: "How does OTP authentication work?", a: "A one-time code is sent to the provided email; after verification the account is created and a token is stored locally." },
                { q: "Are donor details public?", a: "No — details are shared with hospitals only when necessary and with consent." },
                { q: "Can hospitals update requests?", a: "Yes — hospitals can manage requests via their dashboard after authentication." },
              ].map((item, idx) => (
                <div key={idx} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-50">
                    <span className="font-medium">{item.q}</span>
                    <span className="text-xs text-slate-500">{openFaq === idx ? "−" : "+"}</span>
                  </button>

                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
                        <div className="p-3 pt-0 text-sm text-slate-600 border-t border-slate-100">{item.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* footer */}
        <footer className="mt-8 text-sm text-slate-600">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/30 shadow flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
            <div>
              <div className="font-semibold">Need help?</div>
              <div className="text-xs text-slate-500">Email: lifelink@gmail.com</div>
              <div className="text-xs text-slate-500">Phone: +91 85904 88695</div>
            </div>

            <div className="text-xs text-slate-500">© {new Date().getFullYear()} LifeLink — Built for communities</div>
          </div>

          <div className="flex justify-center mt-6">
            <motion.a whileHover={{ y: -6 }} animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 6 }} className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-xl" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h8a2 2 0 012 2v3h-2V5H4v10h6v2H4a2 2 0 01-2-2V5z"/><path d="M17 9h-4v2h2v4h2v-6z"/></svg>
              Learn how LifeLink works
            </motion.a>
          </div>
        </footer>
      </main>
    </div>
  );
}
