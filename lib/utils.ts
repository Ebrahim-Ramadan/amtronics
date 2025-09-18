import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const  categories = [
  "Arduino",
  "Raspberry Pi",
  "Keyestudio",
  "Bread Board & PCB",
  "Kits",
  "Filament & 3D Print",
  "Modules",
  "Sparkfun",
  "Transistor & Regulator",
  "Accessories",
  "Switch",
  "Resistor & Potentiometer",
  "Sensor",
  "DFRobot",
  "Led & Diode",
  "IC",
  "Capacitors",
  "Batteries & Power Supply",
  "Tools",
  "Motor & Pump", //"Servo & Stepper Motor",
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


export const GovernateswithRegions = {
  "governorates": [
    {
      "english": "Capital",
      "arabic": "العاصمة",
      "regions": [
        { "english": "Sharq", "arabic": "شرق", "shipping": 3 },
        { "english": "Al-Shuwaikh", "arabic": "الشويخ", "shipping": 3 },
        { "english": "Al-Qibla", "arabic": "القبلة", "shipping": 3 },
        { "english": "Dasman", "arabic": "دسمان", "shipping": 3 },
        { "english": "Al-Mirqab", "arabic": "المرقاب", "shipping": 3 },
        { "english": "Bneid Al-Gar", "arabic": "بنيد القار", "shipping": 3 },
        { "english": "Abdullah Al-Salem", "arabic": "عبدالله السالم", "shipping": 3 },
        { "english": "Kaifan", "arabic": "كيفان", "shipping": 3 },
        { "english": "Al-Khaldiya", "arabic": "الخالدية", "shipping": 3 },
        { "english": "Qurtuba", "arabic": "قرطبة", "shipping": 3 },
        { "english": "Al-Yarmouk", "arabic": "اليرموك", "shipping": 3 },
        { "english": "Jaber Al-Ahamd", "arabic": "جابر الأحمد", "shipping": 3 },
        { "english": "Al-Nahdha", "arabic": "النهضة", "shipping": 3 },
        { "english": "Granada", "arabic": "غرناطة", "shipping": 3 },
        { "english": "Al-Qairawan", "arabic": "القيروان", "shipping": 3 },
        { "english": "Al-Sulaibikhat", "arabic": "الصليبخات", "shipping": 3 },
        { "english": "Nourth West Sulaibikhat", "arabic": "شمال غرب الصليبخات", "shipping": 3 },
        { "english": "Al-Daiya", "arabic": "الدعية", "shipping": 3 },
        { "english": "Al-Mansouria", "arabic": "المنصورية", "shipping": 3 },
        { "english": "Al-Shuwaikh Residential", "arabic": "الشويخ السكنية", "shipping": 3 },
        { "english": "Al-Adailiya", "arabic": "العديلية", "shipping": 3 },
        { "english": "Al-Nuzha", "arabic": "النزهة", "shipping": 3 },
        { "english": "Al-Faiha", "arabic": "الفيحاء", "shipping": 3 },
        { "english": "Al-Shamiya", "arabic": "الشامية", "shipping": 3 },
        { "english": "Al-Qadsia", "arabic": "القادسية", "shipping": 3 },
        { "english": "Al-Dasma", "arabic": "الدسمة", "shipping": 3 },
        { "english": "Al-Rawda", "arabic": "الروضة", "shipping": 3 }
      ]
    },
    {
      "english": "Hawalli",
      "arabic": "حولي",
      "regions": [
        { "english": "Hawalli", "arabic": "حولي", "shipping": 3 },
        { "english": "Al-Salmiya", "arabic": "السالمية", "shipping": 3 },
        { "english": "Rass Al-Salmiya", "arabic": "رأس السالمية", "shipping": 3 },
        { "english": "Al-Jabriya", "arabic": "الجابرية", "shipping": 3 },
        { "english": "Bayan", "arabic": "بيان", "shipping": 3 },
        { "english": "Mishref", "arabic": "مشرف", "shipping": 3 },
        { "english": "Salwa", "arabic": "سلوى", "shipping": 3 },
        { "english": "Al-Rumaithiya", "arabic": "الرميثية", "shipping": 3 },
        { "english": "Al-Shaab", "arabic": "الشعب", "shipping": 3 },
        { "english": "Hateen", "arabic": "حطين", "shipping": 3 },
        { "english": "Zahra", "arabic": "الزهراء", "shipping": 3 },
        { "english": "Maidan Hawalli", "arabic": "ميدان حولي", "shipping": 3 },
        { "english": "Al-Bidea", "arabic": "البدع", "shipping": 3 },
        { "english": "Al-Salam", "arabic": "السلام", "shipping": 3 },
        { "english": "Al-Shuhada", "arabic": "الشهداء", "shipping": 3 },
        { "english": "Mubarak Al-Abdullah", "arabic": "مبارك العبدالله", "shipping": 3 },
        { "english": "Al-Siddeeq", "arabic": "الصديق", "shipping": 3 }
      ]
    },
    {
      "english": "Farwaniya",
      "arabic": "الفروانية",
      "regions": [
        { "english": "Al-Farwaniya", "arabic": "الفروانية", "shipping": 3 },
        { "english": "Khaitan", "arabic": "خيطان", "shipping": 3 },
        { "english": "Al-Omariya", "arabic": "العمرية", "shipping": 3 },
        { "english": "Al-Riggae", "arabic": "الرقعي", "shipping": 3 },
        { "english": "Dajeej", "arabic": "ضجيج", "shipping": 3 },
        { "english": "Abdullah Al-Mubarak", "arabic": "عبدالله المبارك", "shipping": 3 },
        { "english": "Jleeb Al-Shuyoukh", "arabic": "جليب الشيوخ", "shipping": 3 },
        { "english": "Al-Rabiya", "arabic": "الربية", "shipping": 3 },
        { "english": "Al-Ardiya", "arabic": "العارضية", "shipping": 3 },
        { "english": "Sabah Al-Naser", "arabic": "صباح الناصر", "shipping": 3 },
        { "english": "Ishbiliya", "arabic": "اشبيلية", "shipping": 3 },
        { "english": "Al-Andalous", "arabic": "الأندلس", "shipping": 3 },
        { "english": "Al-Rehab", "arabic": "الرحاب", "shipping": 3 },
        { "english": "South Khaitan", "arabic": "جنوب خيطان", "shipping": 3 },
        { "english": "South Abdullah Al-Mubarak", "arabic": "جنوب عبدالله المبارك", "shipping": 3 },
        { "english": "Al-Shadadiya", "arabic": "الشدادية", "shipping": 3 },
        { "english": "Al-Rai", "arabic": "الري", "shipping": 3 },
        { "english": "West Abdullah Al-Mubarak", "arabic": "غرب عبدالله المبارك", "shipping": 3 },
        { "english": "Umm Al-Hayman", "arabic": "ام الهيمان", "shipping": 4.5 }
      ]
    },
    {
      "english": "Ahmadi",
      "arabic": "الأحمدي",
      "regions": [
        { "english": "Al-Fahaheel", "arabic": "الفحيحيل", "shipping": 3 },
        { "english": "Al-Mangaf", "arabic": "المنقف", "shipping": 3 },
        { "english": "Abu Halifa", "arabic": "أبو حليفة", "shipping": 3 },
        { "english": "Al-Mahboula", "arabic": "المهبولة", "shipping": 3 },
        { "english": "Sabah Al-Ahmad", "arabic": "صباح الأحمد", "shipping": 5.5 },
        { "english": "Al-Wafra", "arabic": "الوفرة", "shipping": 5.5 },
        { "english": "Ali Sabah Al-Salem", "arabic": "علي صباح السالم", "shipping": 3 },
        { "english": "Al-Egaila", "arabic": "العقيلة", "shipping": 3 },
        { "english": "Al-Riqqa", "arabic": "الرقة", "shipping": 3 },
        { "english": "Hadiya", "arabic": "هدية", "shipping": 3 },
        { "english": "Al-Daher", "arabic": "الظهر", "shipping": 3 },
        { "english": "Al-Fintas", "arabic": "الفنطاس", "shipping": 3 },
        { "english": "Fahad Al-Ahmad", "arabic": "فهد الأحمد", "shipping": 3 },
        { "english": "Al-Khiran", "arabic": "الخيران", "shipping": 3 },
        { "english": "Jaber Al-Ali", "arabic": "جابر العلي", "shipping": 3 },
        { "english": "Al-Subahiya", "arabic": "الصباحية", "shipping": 3 },
        { "english": "Al-Ahmadi", "arabic": "الأحمدي", "shipping": 3 }
      ]
    },
    {
      "english": "Jahra",
      "arabic": "الجهراء",
      "regions": [
        { "english": "Al-Jahra", "arabic": "الجهراء", "shipping": 3 },
        { "english": "Al-Sulaibiya", "arabic": "الصليبية", "shipping": 3 },
        { "english": "Al-Abdali", "arabic": "العبدلي", "shipping": 3 },
        { "english": "Saad Al-Abdullah", "arabic": "سعد العبدالله", "shipping": 3 },
        { "english": "Al-Naeem", "arabic": "النعيم", "shipping": 3 },
        { "english": "Al-Oyoun", "arabic": "العيون", "shipping": 3 },
        { "english": "Al-Qasr", "arabic": "القصر", "shipping": 3 },
        { "english": "Amghara", "arabic": "أمغرة", "shipping": 3 },
        { "english": "Taima", "arabic": "تيماء", "shipping": 3 },
        { "english": "Kabd", "arabic": "كبد", "shipping": 3 },
        { "english": "Al-Naseem", "arabic": "النسيم", "shipping": 3 },
        { "english": "Al-Waha", "arabic": "الواحة", "shipping": 3 },
        { "english": "Al-Mutla", "arabic": "المطلاع", "shipping": 3 }
      ]
    },
    {
      "english": "Mubarak Al-Kabeer",
      "arabic": "مبارك الكبير",
      "regions": [
        { "english": "Abu Fatira", "arabic": "أبو فطيرة", "shipping": 3 },
        { "english": "Abu Al Hasaniya", "arabic": "أبو الحصانية", "shipping": 3 },
        { "english": "Adan", "arabic": "عدان", "shipping": 3 },
        { "english": "Al-Qusoor", "arabic": "القصور", "shipping": 3 },
        { "english": "Mubarak Al-Kabeer", "arabic": "مبارك الكبير", "shipping": 3 },
        { "english": "Al-Fintas", "arabic": "الفنطاس", "shipping": 3 },
        { "english": "Sabah Al-Salem", "arabic": "صباح السالم", "shipping": 3 },
        { "english": "Al-Messila", "arabic": "المسيلة", "shipping": 3 },
        { "english": "Al-Masayel", "arabic": "المسايل", "shipping": 3 },
        { "english": "Al-Funaitees", "arabic": "الفنيطيس", "shipping": 3 },
        { "english": "Abu Futaira", "arabic": "غرب أبو فطيرة", "shipping": 3 }
      ]
    }
  ]
}