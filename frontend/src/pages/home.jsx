import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-red-50">
      <section className="max-w-6xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Donate blood. Save lives.
          </h1>
          <p className="mt-6 text-gray-600 max-w-xl">
            Connect donors and recipients quickly. Find nearby donation drives
            and request help whenever it’s needed.
          </p>
          <div className="mt-8 flex gap-4">
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700">
              Find Donor
            </button>
            <button className="px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-100">
              Request Blood
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="w-full h-80 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">Hero / illustration here</div>
          </div>
        </div>
      </section>
    </main>
  );
}
