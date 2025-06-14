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

const productSuggestions = [
  "Arduino Uno", "Arduino Nano", "Arduino Mega", "NodeMCU", "ESP32", "ESP8266", "Raspberry Pi", "Raspberry Pi Pico",
  "Breadboard", "Jumper Wires", "LED", "RGB LED", "Resistor", "Capacitor", "Inductor", "Diode", "Zener Diode",
  "Transistor", "MOSFET", "Potentiometer", "Rotary Encoder", "Push Button", "Switch", "Toggle Switch", "Slide Switch",
  "Rocker Switch", "Relay", "Buzzer", "Speaker", "Microphone", "Sensor", "Ultrasonic Sensor", "Temperature Sensor",
  "Humidity Sensor", "Soil Moisture Sensor", "Water Level Sensor", "PIR Motion Sensor", "IR Sensor", "Light Sensor",
  "LDR", "Gas Sensor", "Accelerometer", "Gyroscope", "Magnetometer", "IMU", "Hall Effect Sensor", "Load Cell",
  "Force Sensor", "Fingerprint Sensor", "Camera Module", "Bluetooth Module", "Wi-Fi Module", "GPS Module",
  "RFID Module", "NFC Module", "RF Transmitter Receiver", "Ethernet Module", "Display", "LCD Display", "OLED Display",
  "7-Segment Display", "Dot Matrix Display", "Keypad", "Joystick Module", "Motor", "DC Motor", "Servo Motor",
  "Stepper Motor", "Motor Driver", "L298N", "TB6612FNG", "Battery", "Battery Holder", "Charger", "Li-ion Charger",
  "Power Supply", "Adapter", "Voltage Regulator", "DC-DC Converter", "AC-DC Converter", "Boost Converter",
  "Buck Converter", "USB Cable", "USB to Serial Converter", "FTDI Module", "CH340", "Development Board", "Shield",
  "Breakout Board", "PCB", "Prototyping Board", "Soldering Iron", "Solder", "Desoldering Pump", "Flux",
  "Heat Shrink Tube", "Heat Shrink Gun", "Wire", "Male to Male Jumper", "Female to Female Jumper", "Alligator Clips",
  "Terminal Block", "Screw Terminal", "Connector", "Dupont Connector", "Header Pin", "Standoff", "Nut", "Screw",
  "Fan", "Heatsink", "Multimeter", "Oscilloscope", "Logic Analyzer", "Test Clip", "Third Hand Tool", "Wire Stripper",
  "Crimping Tool", "Magnifying Glass", "Magnifying Lamp", "ESD Wrist Strap", "ESD Mat", "Component Organizer",
  "Storage Box", "Tool Kit", "Starter Kit", "Robotics Kit", "Smart Home Kit", "IoT Kit", "Wearable Kit",
  "Educational Kit", "DIY Kit", "Development Kit", "Module", "Sensor Module", "Power Module", "Audio Module",
  "Amplifier Module", "Sound Sensor", "Vibration Sensor", "Tilt Sensor", "Rain Sensor", "Flame Sensor",
  "Current Sensor", "Voltage Sensor", "RTC Module", "DS3231", "Memory", "EEPROM", "Flash Memory", "SD Card",
  "Crystal Oscillator", "IC", "555 Timer", "Op-Amp", "Logic IC", "Driver IC", "Charger IC", "Optocoupler",
  "Photodiode", "Phototransistor", "Reference Book", "Data Sheet", "Tutorial", "Project", "DIY Electronics",
  "Fiber Optic Cable", "RF Cable", "Antenna", "Converter", "Audio Jack", "Video Jack", "HDMI Cable", "Ethernet Cable",
  "Gloves", "Lab Coat", "Safety Glasses", "Arduino", "Atmel", "STMicroelectronics", "Texas Instruments", "Energizer",
  "Duracell", "Panasonic", "Samsung", "Sony", "Toshiba", "Nexperia", "ON Semiconductor", "Broadcom", "Microchip",
  "Kingston", "SanDisk", "Adafruit", "SparkFun", "Elegoo", "DFRobot", "Waveshare", "Seeed Studio", "HiLetgo",
  "RobotDyn", "Pololu", "Maxim Integrated", "Bosch", "BME280", "AMS", "InvenSense", "Smart Home", "Home Automation",
  "IoT", "Wearable Tech", "Health Monitoring", "Fitness Tracker", "Environmental Monitoring", "Security System",
  "Surveillance", "Voice Control", "Remote Control", "Gesture Control", "Line Follower", "Obstacle Avoidance",
  "RFID Access Control", "Weather Station", "Greenhouse Monitoring", "Soil Moisture Monitoring",
  "Water Tank Automation", "Gas Leak Detection", "Fire Alarm System", "Smart Door Lock", "Wireless Communication",
  "Bluetooth Speaker", "Wi-Fi Camera", "Smart Light", "Smart Fan", "Drone", "Robotic Arm", "Automation",
  "Educational Project", "Science Fair Project", "Final Year Project", "Industrial Monitoring", "Vehicle Tracking",
  "Smart Agriculture", "Smart Metering", "Voice Assistant", "Gesture Based System", "Remote Weather Logger",
  "IoT Dashboard", "Data Logging", "Energy Monitoring", "AI Vision", "Edge Computing", "AIoT", "Self-Balancing Robot",
  "Home Energy Saver", "Wireless Sensor Network"
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
            <Link href="/" prefetch={false} className="text-2xl font-bold text-gray-800">
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
              <Link href="/wishlist" prefetch={false}>
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

              <Link href="/cart" prefetch={false}>
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
              <Link href="/myorders" prefetch={false}
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
                  prefetch={false}
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