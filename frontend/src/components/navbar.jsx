import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full bg-white/60 backdrop-blur-md shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">BD</div>
          <div className="text-lg font-semibold">BloodDonate</div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <a className="text-gray-700 hover:text-red-600" href="#">Home</a>
          <a className="text-gray-700 hover:text-red-600" href="#">Donors</a>
          <a className="text-gray-700 hover:text-red-600" href="#">Requests</a>
          <button className="ml-4 px-4 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">Get Started</button>
        </div>

        <div className="md:hidden">
          <button className="p-2 rounded-md bg-gray-100">Menu</button>
        </div>
      </div>
    </nav>
  );
}
