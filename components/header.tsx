"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Globe, Menu, ChevronLeft, ChevronRight, Heart, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/context";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { categories } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist-context";
import Fuse from "fuse.js";

// Placeholder for robotics/maker electronics suggestions
const productSuggestions = [
  "Arduino",
  "Capacitor",
  "Resistor",
  "Inductor",
  "Diode",
  "Transistor",
  "Potentiometer",
  "LED",
  "Motor",
  "Servo Motor",
  "Stepper Motor",
  "Microcontroller",
  "Sensor",
  "Relay",
  "Jumper Wires",
  "Power Supply",
  "Voltage Regulator",
  "Integrated Circuit (IC)",
  "Development Board",
  "Shield",
  "Breakout Board",
  "Oscilloscope",
  "Multimeter",
  "Soldering Iron",
  "Wire",
  "Connector",
  "Fuse",
  "Breadboard",
  "Raspberry Pi",
  "PCB", // Printed Circuit Board
  "Solder",
  "Heat Shrink Tubing",
  "Alligator Clips",
  "Cables",
  "Switches",
  "Buttons",
  "Buzzers",
  "Displays (LCD, OLED)",
  "Enclosures",
  "Batteries",
  "Battery Holders",
  "Chargers",
  "Fans",
  "Heatsinks",
  "Screws",
  "Nuts",
  "Standoffs",
  "Tools (Pliers, Wire Strippers)",
  "Magnifying Lamp",
  "Desoldering Pump",
  "Flux",
  "Anti-static Wrist Strap",
  "Breadboard Power Supply",
  "USB to Serial Converter",
  "Prototyping Board",
  "Test Clips",
  "Terminal Blocks",
  "RF Module",
  "Antenna",
  "GPS Module",
  "Bluetooth Module",
  "Wi-Fi Module",
  "Ethernet Module",
  "Camera Module",
  "Microphone",
  "Speaker",
  "RFID Reader",
  "NFC Reader",
  "Barcode Scanner",
  "Driver (Motor Driver, LED Driver)",
  "Amplifier",
  "Converter (DC-DC, AC-DC)",
  "Charger IC",
  "Memory (EEPROM, Flash)",
  "Crystal Oscillator",
  "RTC (Real-Time Clock)",
  "ESD Protection",
  "Optocoupler",
  "Photodiode",
  "Phototransistor",
  "Hall Effect Sensor",
  "Pressure Sensor",
  "Temperature Sensor",
  "Humidity Sensor",
  "Gas Sensor",
  "PIR Sensor",
  "Ultrasonic Sensor",
  "Force Sensor",
  "Load Cell",
  "Accelerometer",
  "Gyroscope",
  "Magnetometer",
  "IMU (Inertial Measurement Unit)",
  "Fingerprint Sensor",
  "Water Level Sensor",
  "Soil Moisture Sensor",
  "Rain Sensor",
  "LDR (Light Dependent Resistor)",
  "RGB LED",
  "Dot Matrix Display",
  "7-Segment Display",
  "Keypad",
  "Joystick",
  "Push Button",
  "Toggle Switch",
  "Rocker Switch",
  "Slide Switch",
  "Rotary Encoder",
  "Potentiometer Knob",
  "Heat Shrink Gun",
  "Wire Strippers",
  "Crimping Tool",
  "PCB Drill",
  "Circuit Tester",
  "Magnifying Glass",
  "ESD Mat",
  "Soldering Tip Cleaner",
  "Third Hand Tool",
  "Component Organizer",
  "SMD Components", // Surface Mount Device
  "Through-Hole Components",
  "Development Kit",
  "Starter Kit",
  "Educational Kit",
  "Robotics Kit",
  "Drone Components",
  "IoT Devices",
  "Smart Home Components",
  "Wearable Electronics",
  "Automotive Electronics",
  "Medical Electronics",
  "Industrial Electronics",
  "Audio Components",
  "Video Components",
  "Fiber Optics",
  "RF Cables",
  "Adapters",
  "Converters",
  "Tools Kits",
  "Storage Bins",
  "Organizers",
  "Safety Glasses",
  "Lab Coat",
  "Gloves",
  "Reference Books",
  "Data Sheets",
  "Tutorials",
  "Project Kits",
  "DIY Electronics",
];

export default function Header() {
  const { state, dispatch } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1); // -1 means no suggestion selected
  const [badgeAnimate, setBadgeAnimate] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const navRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { state: wishlistState } = useWishlist();

  // Sync searchQuery with URL's q parameter
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // Animate cart badge when items change
  useEffect(() => {
    if (state.items.length > 0) {
      setBadgeAnimate(true);
      const timeout = setTimeout(() => setBadgeAnimate(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [state.items.reduce((sum, item) => sum + item.quantity, 0)]);

  // Update scroll buttons for navigation
  const updateScrollButtons = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener("scroll", updateScrollButtons);
      return () => navElement.removeEventListener("scroll", updateScrollButtons);
    }
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
      // If a suggestion is selected, use it
      router.push(`/search?q=${encodeURIComponent(suggestions[selectedSuggestionIndex])}`);
      setSearchQuery(suggestions[selectedSuggestionIndex]);
    } else if (searchQuery.trim()) {
      // Otherwise, use the input value
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Handle input change and generate suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedSuggestionIndex(-1); // Reset selected suggestion on input change
    if (value) {
      const fuse = new Fuse(productSuggestions, { threshold: 0.6 });
      const results = fuse.search(value).map((result) => result.item);
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle arrow key navigation and Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery) {
      const fuse = new Fuse(productSuggestions, { threshold: 0.6 });
      const results = fuse.search(searchQuery).map((result) => result.item);
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 100);
  };

  // Scroll navigation
  const scrollLeft = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    dispatch({ type: "SET_LANGUAGE", payload: state.language === "en" ? "ar" : "en" });
  };

  const isArabic = state.language === "ar";
  const wishlistCount = wishlistState.items?.length || 0;

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar - Yellow */}
      <div className="bg-[#FEEE00]/90 backdrop-blur-lg py-1 md:py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-800">
              <Image
              priority={true}
              quality={50}
                src="/amtronics-logo.webp"
                width={200}
                className="w-12 md:w-20"
                height={200}
                alt="Amtronics Logo"
              />
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder={isArabic ? "البحث عن المنتجات..." : "What are you looking for?"}
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="pr-12 rounded-full border-0 shadow-md h-11 bg-white"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1 h-9 w-9 p-0 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-md rounded-md mt-1 z-50">
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={suggestion}
                          className={`flex flex-row items-center px-4 py-2 font-medium text-neutral-800 hover:bg-neutral-100 cursor-pointer ${
                            index === selectedSuggestionIndex ? "bg-neutral-100" : ""
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <SearchIcon size={16} className="mr-2 text-neutral-400" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>

            {/* Right side icons */}
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="items-center flex p-0 text-gray-800">
                <Globe size={20} />
                {isArabic ? "English" : "العربية"}
              </Button>

              <div className="flex items-center gap-2 md:gap-4">
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="relative text-gray-800 z-10">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge
                      className={`absolute -top-1 md:-top-2 -right-1 md:-right-2  h-4 md:h-5 w-4 md:w-5  rounded-full p-0 text-xs bg-red-500 text-white transition-transform duration-300 cart-badge-animate`}
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative text-gray-800 z-0">
                  <ShoppingCart className="h-5 w-5" />
                  {state.items?.length > 0 && (
                    <Badge
                      className={`font-medium absolute -top-1 md:-top-2 -right-1 md:-right-2  h-4 md:h-5 w-4 md:w-5 rounded-full p-0 text-xs bg-[#00B8DB] transition-transform duration-300 ${
                        badgeAnimate ? "cart-badge-animate" : ""
                      }`}
                    >
                      {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/myorders" 
              className="hover:bg-white p-2 rounded-md"
              > 
              <Image
              src='/orders_menu_icon.svg'
              width={20}
              height={20}
              alt="Orders"
              />
              </Link>
              </div>
              
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden mt-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder={isArabic ? "البحث عن المنتجات..." : "What are you looking for?"}
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="pr-10 rounded-full border-0 shadow-md bg-white"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-md rounded-md mt-1 z-20">
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={suggestion}
                          className={`px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer ${
                            index === selectedSuggestionIndex ? "bg-gray-100" : ""
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation - Teal */}
      <div className="bg-[#091638]/90 backdrop-blur-lg text-white relative -z-40">
        <div className="mx-auto md:px-4">
          <div className="relative flex items-center">
            {/* Left Arrow */}
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollLeft}
              className={`absolute left-0 h-8 w-8 p-0 rounded-full bg-[#091638] text-white ${
                !canScrollLeft ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Scrollable Nav */}
            <nav ref={navRef} className="block overflow-x-auto whitespace-nowrap scrollbar-hidden flex-1 mx-10">
              <div className="flex gap-4 md:gap-8 py-1">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className={`py-1 hover:text-[#FEEE00] border-b-2 transition-all duration-300 font-medium inline-block ${
                      searchParams.get("category") === category ? "border-[#FEEE00] text-[#FEEE00]" : "border-transparent"
                    }`}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Right Arrow */}
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollRight}
              className={`absolute right-0 h-8 w-8 p-0 rounded-full bg-[#091638] text-white ${
                !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}