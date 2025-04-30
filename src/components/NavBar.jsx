import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white font-monda text-xl border-b border-gray-300 px-6 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex justify-center">
              <img
                src="src/assets/carzy1.png"
                alt="CarZy Logo"
                className="h-11"
              />
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={handleLogout}
              className="border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition-colors"
            >
              LogOut
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col space-y-4">
            <button
              onClick={handleLogout}
              className="border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition-colors"
            >
              LogOut
            </button>
          </div>
        )}
      </nav>
    </>
  );
}