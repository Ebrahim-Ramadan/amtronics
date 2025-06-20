import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const  categories = [
  "Kits",
  "Resistor",
  "Modules",
  "Sparkfun",
  "Transistor & Regulator",
  "Power Supply",
  "Accessories",
  "Switch",
  "Resistor & Potentiometer",
  "Diode",
  "Sensor",
  "DFRobot",
  "Keyestudio",
  "Servo & Stepper Motor",
  "Led & Diode",
  "Battery",
  "Transistor",
  "IC",
  "3D Print",
  "Capacitors",
  "Batteries & Power Supply",
  "Tools",
  "DC Motor & Pump",
  "Motor",
  "Arduino",
  "Filament",
  "Potentiometer",
  "Raspberry Pi",
  "Bread Board & PCB"
]


export const copyToClipboard = (text : string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
  } else {
    // Fallback method for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Could not copy text: ', err);
    }
    document.body.removeChild(textarea);
  }
};