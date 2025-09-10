"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/context"
import type { CustomerInfo, Order } from "@/lib/types"
import { useSavedAddresses } from "@/lib/saved-addresses-context"
import { ChevronLeft, PlusCircle, CheckCheck, XIcon, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LoadingDots } from "@/components/ui/loading-spinner"
import { GovernateswithRegions } from "@/lib/utils"
import type { Product } from "@/lib/types"
import Cookies from "js-cookie"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const router = useRouter()
  const { state: savedAddressesState, dispatch: savedAddressesDispatch } = useSavedAddresses()
  const [promoCode, setPromoCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [promoError, setPromoError] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [isPromoApplied, setIsPromoApplied] = useState(false) // New state to track if promo is applied
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    country: "Kuwait",
    city: "",
    area: "",
    block: "",
    street: "",
    house: "",
  })
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | "new">("new")
  const isArabic = state.language === "ar"
  const dir = isArabic ? "rtl" : "ltr"
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("")
  const [availableAreas, setAvailableAreas] = useState<{ english: string; arabic: string }[]>([])
  const [shippingFee] = useState(2)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "knet">("cod")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  // Hardcoded credentials (replace with env or secure storage in production)
  const AUTH_EMAIL = process.env.NEXT_PUBLIC_AUTH_EMAIL 
  const AUTH_PASSWORD = process.env.NEXT_PUBLIC_AUTH_PASSWORD 

  useEffect(() => {
    // Check cookie for authorization
    const cookieAuth = Cookies.get("amtronics_order_auth")
    setIsAuthorized(cookieAuth === "true")
  }, [])

  const handleAuthLogin = () => {
    setAuthError("")
    if (authEmail === AUTH_EMAIL && authPassword === AUTH_PASSWORD) {
      Cookies.set("amtronics_order_auth", "true", { expires: 1 })
      setIsAuthorized(true)
      setShowAuthDialog(false)
      setAuthEmail("")
      setAuthPassword("")
      setAuthError("")
      toast.success(isArabic ? "تم تسجيل الدخول بنجاح" : "Login successful")
    } else {
      setAuthError(isArabic ? "بيانات الدخول غير صحيحة" : "Invalid credentials")
    }
  }

  const handlePaymentMethodChange = (method: "cod" | "knet") => {
    if (method === "knet" && !isAuthorized) {
      setShowAuthDialog(true)
      return
    }
    setPaymentMethod(method)
  }

  useEffect(() => {
    if (selectedAddressIndex !== "new" && savedAddressesState.addresses[selectedAddressIndex]) {
      const addr = savedAddressesState.addresses[selectedAddressIndex]
      setCustomerInfo(addr)
      setPromoCode("")
      setDiscountAmount(0)
      setPromoError("")
      setIsApplyingPromo(false)
      setIsPromoApplied(false)
      setSelectedGovernorate(addr.city)
      const gov = GovernateswithRegions.governorates.find(g => g.english === addr.city || g.arabic === addr.city)
      setAvailableAreas(gov ? gov.regions : [])
    } else if (selectedAddressIndex === "new") {
      setCustomerInfo({
        name: "",
        phone: "",
        email: "",
        country: "Kuwait",
        city: "",
        area: "",
        block: "",
        street: "",
        house: "",
      })
      setPromoCode("")
      setDiscountAmount(0)
      setPromoError("")
      setIsApplyingPromo(false)
      setIsPromoApplied(false)
      setSelectedGovernorate("")
      setAvailableAreas([])
    }
  }, [selectedAddressIndex, savedAddressesState.addresses])

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    if (field === "phone") {
      // Only allow 8 digits
      const phone = value.replace(/\D/g, "").slice(0,8);
      setCustomerInfo((prev) => ({ ...prev, phone }));
    } else {
      setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    }
    if (selectedAddressIndex !== "new") {
      setSelectedAddressIndex("new");
    }
  }  

  const handleAddressSelect = (value: string) => {
    setSelectedAddressIndex(value === "new" ? "new" : parseInt(value, 10))
  }

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError(isArabic ? "الرجاء إدخال كود خصم" : "Please enter a promo code")
      return;
    }
    if (state.items.length === 0) {
      setPromoError(isArabic ? "السلة فارغة" : "Cart is empty")
      toast.error(isArabic ? "السلة فارغة" : "Cart is empty")
      return;
    }
    setIsApplyingPromo(true)
    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      })
// console.log('response',  await response.json());

      if (response.ok) {
        const promo = await response.json()
        console.log('promo', promo);
        
        const calculatedDiscountAmount = (state.total * promo.percentage) / 100;
        setDiscountAmount(calculatedDiscountAmount)
        setPromoError("")
        setIsPromoApplied(true) // Set promo applied status to true
        toast.info(isArabic ? "تم تطبيق الخصم" : "Discount Applied")
      } else {
        const error = await response.json()
        setPromoError(error.error)
        setDiscountAmount(0)
        setIsPromoApplied(false) // Reset promo applied status on failure
        toast.error(isArabic ? "كود خصم غير صالح أو منتهي الصلاحية" : "Invalid or expired promo code")
      }
    } catch (error) {
      console.error("Error validating promo code:", error)
      setPromoError(isArabic ? "حدث خطأ في التحقق من الكود" : "Error validating promo code")
      setDiscountAmount(0)
      setIsPromoApplied(false) // Reset promo applied status on error
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === "knet" && !isAuthorized) {
      toast.error(isArabic ? "يجب تسجيل الدخول كمستخدم مخول لدفع كي نت" : "You must login as an authorized user to pay with Knet")
      return
    }
    if (state.items.length === 0) {
      toast.error(isArabic ? "السلة فارغة" : "Cart is empty")
      return
    }

    // Validate required fields
    const requiredFields: (keyof CustomerInfo)[] = ["name", "phone", 
      "email",
      "country", "city", "area", "block", "street", "house"]
    for (const field of requiredFields) {
      if (!customerInfo[field].trim()) {
        toast.error(
          isArabic
            ? `يرجى ملء حقل ${
                field === "name"
                  ? "الاسم الكامل"
                  : field === "phone"
                    ? "رقم الهاتف"
                    : field === "email"
                      ? "البريد الإلكتروني"
                      : field === "country"
                        ? "الدولة"
                        : field === "city"
                          ? "المدينة"
                          : field === "area"
                            ? "المنطقة"
                            : field === "block"
                              ? "القطعة"
                              : field === "street"
                                ? "الشارع"
                                : field === "house"
                                  ? "رقم المنزل"
                                  : field
              }`
            : `Please fill in the ${
                field === "name"
                  ? "Full Name"
                  : field === "phone"
                    ? "Phone Number"
                  : field === "email"
                    ? "Email Address"
                  : field === "country"
                    ? "Country"
                  : field === "city"
                    ? "City"
                  : field === "area"
                    ? "Area"
                  : field === "block"
                    ? "Block"
                  : field === "street"
                    ? "Street"
                  : field === "house"
                    ? "House Number"
                  : field
              } field.`,
        )
        setLoading(false)
        return
      }
    }

    // Validate name (no numbers)
    if (/[0-9]/.test(customerInfo.name)) {
      toast.error(isArabic ? "الاسم لا يمكن أن يحتوي على أرقام" : "Name cannot contain numbers.")
      setLoading(false)
      return
    }

    // Validate phone (must be exactly 8 digits)
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      toast.error(
        isArabic
          ? "رقم الهاتف يجب أن يتكون من 8 أرقام بعد +965 (مثال: +96512345678)."
          : "Phone number must be exactly 8 digits after +965 (e.g., +96512345678).",
      );
      setLoading(false);
      return;
    }

    setLoading(true)
    setLoadingMessage(isArabic ? "جاري معالجة طلبك..." : "Processing your order...")

    try {
      // Add paymentMethod to orderData
      const orderData = {
        items: state.items,
        customerInfo: { ...customerInfo, phone: "+965" + customerInfo.phone },
        total: state.total,
        discount: discountAmount,
        promoCode: promoCode || "",
        shippingFee,
        paymentMethod,
      }
      
      setLoadingMessage(isArabic ? "جاري تقديم الطلب..." : "Placing order...")
      
      const response = await fetch( "/api/orders", {        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        setLoadingMessage(isArabic ? "تم تأكيد الطلب بنجاح!" : "Order confirmed successfully!")
        const orderResult = await response.json()
        const newOrderID = orderResult.newOrderID

        const newOrder: Order = {
          _id: newOrderID,
          items: state.items,
          customerInfo,
          total: state.total,
          status: "pending",
          createdAt: new Date(),
          discount: discountAmount,
          promoCode: promoCode || "",
          shippingFee,
        }

        // Get existing orders from localStorage
        let orders: { [key: string]: Order } = {}
        try {
          const storedOrders = localStorage.getItem("orders")
          if (storedOrders) {
            orders = JSON.parse(storedOrders)
          }
        } catch (error) {
          console.error("Error reading orders from localStorage:", error)
        }

        // Add new order
        orders[newOrderID] = newOrder

        // Store updated orders in localStorage
        try {
          localStorage.setItem("orders", JSON.stringify(orders))
        } catch (error) {
          console.error("Error saving orders to localStorage:", error)
          alert(isArabic ? "حدث خطأ في حفظ الطلب" : "Error saving order")
          setLoading(false)
          return
        }

        // Save new address if applicable
        if (selectedAddressIndex === "new" && customerInfo.phone && customerInfo.name) {
          savedAddressesDispatch({ type: "ADD_ADDRESS", payload: customerInfo })
        }

//         const orderDetails = `
// Order ID: ${newOrderID}
// Name: ${customerInfo.name}
// Phone: ${customerInfo.phone}
// Total: ${(state.total - discountAmount).toFixed(2)} KD
// Address: ${customerInfo.area}, Block ${customerInfo.block}, Street ${customerInfo.street}, House ${customerInfo.house}
// Items:
// ${state.items.map((item) => `- ${isArabic ? item.product.ar_name : item.product.en_name} (x${item.quantity})`).join("\n")}
// `
//         const whatsappUrl = `https://wa.me/${customerInfo.phone.replace(/\s/g, "")}?text=${encodeURIComponent(orderDetails)}`

//         // Open WhatsApp chat
//         window.open(whatsappUrl, "_blank")

        dispatch({ type: "CLEAR_CART" })
        setIsPromoApplied(false) // Reset promo applied status after order is placed
        setLoadingMessage(isArabic ? "جاري إعادة توجيهك..." : "Redirecting...")
        router.push("/myorders")
      } else {
        alert(isArabic ? "حدث خطأ في الطلب" : "Error placing order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert(isArabic ? "حدث خطأ في الطلب" : "Error placing order")
    } finally {
      // setLoading(false)
    }
  }

  const handleGovernorateChange = (value: string) => {
    setSelectedGovernorate(value)
    setCustomerInfo(prev => ({ ...prev, city: value, area: "" }))
    const gov = GovernateswithRegions.governorates.find(g => (isArabic ? g.arabic : g.english) === value)
    setAvailableAreas(gov ? gov.regions : [])
  }

  const handleAreaChange = (value: string) => {
    setCustomerInfo(prev => ({ ...prev, area: value }))
  }

  return (
    <div className="mx-auto md:px-16 py-4 md:py-6" dir={dir}>
      <a
        href="/cart"
        className="font-medium text-neutral-500 hover:text-[#00B8DB] text-xs md:text-sm flex justify-start items-center mb-2 text-center"
      >
        <ChevronLeft className="h-4 w-4" />
        {isArabic ? "العودة إلى السلة" : "Back to Cart"}
      </a>
      <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-center">{isArabic ? "إتمام الطلب" : "Checkout"}</h1>

      <div className="grid lg:grid-cols-2 gap-8 [&>*]:py-6">
        <Card className="gap-2 md:gap-4">
          <CardHeader>
            <CardTitle className="text-xl md:text-3xl">{isArabic ? "معلومات التوصيل" : "Delivery Information"}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            {savedAddressesState.addresses.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm md:text-base mb-2 md:mb-4 block">
                  {isArabic ? "اختيار عنوان محفوظ" : "Choose Shipping Address"}
                </Label>
                {savedAddressesState.addresses.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 md:p-4 mb-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddressSelect(index.toString())}
                  >
                    <div className="flex items-center">
                      <img
                        src="/checkoutAddressLatLngIndicator.gif"
                        className="w-10 h-10 -ml-2 md:ml-0"
                        alt="Checkout Address LatLng Indicator"
                      />
                      <div>
                        <div className="text-sm font-medium leading-4" dir={isArabic ? "rtl" : "ltr"}>
                          {isArabic ? address.name : address.name} - {address.street}, {address.block}, {address.area}, {address.city}, {address.country}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center space-x-1">
                          <span>+{address.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="address"
                        value={index.toString()}
                        checked={selectedAddressIndex === index}
                        onChange={() => handleAddressSelect(index.toString())}
                        className="w-4 h-4 text-[#00B8DB] border-[#00B8DB] focus:ring-[#00B8DB] bg-[#00B8DB]"
                      />
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={e => {
                          e.stopPropagation();
                          savedAddressesDispatch({ type: "REMOVE_ADDRESS", payload: address.phone })
                        }}
                        aria-label={isArabic ? "حذف العنوان" : "Delete address"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleAddressSelect("new")}
                >
                  <span dir={isArabic ? "rtl" : "ltr"} className="flex items-center gap-2 md:px-4 text-sm font-medium">
                    <PlusCircle size={16} color="#FFEE01" className="bg-[#3F4553] rounded-full" />
                    {isArabic ? "إضافة عنوان جديد" : "Add New Address"}
                  </span>
                  <input
                    type="radio"
                    name="address"
                    value="new"
                    checked={selectedAddressIndex === "new"}
                    onChange={() => handleAddressSelect("new")}
                    className="w-4 h-4 text-[#00B8DB] border-[#00B8DB] focus:ring-[#00B8DB]"
                  />
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="name">{isArabic ? "الاسم الكامل" : "Full Name"} <span className="text-red-600">*</span></Label>
                  <Input
                    id="name"
                    required
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    // Always editable
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="phone">{isArabic ? "رقم الهاتف" : "Phone Number"} <span className="text-red-600">*</span></Label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-2 border border-r-0 rounded-l-md bg-gray-100 text-gray-700 select-none text-sm">+965</span>
                    <input
                      id="phone"
                      type="tel"
                      required
                      className="flex-1 min-w-0 border border-gray-300 rounded-r-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B8DB] text-sm"
                      value={customerInfo.phone}
                      onChange={e => handleInputChange("phone", e.target.value.replace(/\D/g, "").slice(0,8))}
                      placeholder={isArabic ? "أدخل 8 أرقام" : "Enter 8 digits"}
                      // pattern="\\d{8}"
                        // pattern="^\\d{8}$"    
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
              <div>
  <Label className="mb-1" htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email Address"} <span className="text-red-600">*</span></Label>
  <Input
  required
    id="email"
    type="email"
    value={customerInfo.email}
    onChange={(e) => handleInputChange("email", e.target.value)}
    // Always editable
  />
  <p className="text-xs text-yellow-600 mt-1 italic">
    {isArabic ? "حفظ هذا البريد لتتبع الطلب وتحديثات المنتجات!" : "Save this email for order tracking and product updates!"}
  </p>
</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="country">{isArabic ? "الدولة" : "Country"} <span className="text-red-600">*</span></Label>
                  <select
                    id="country"
                    required
                    value={customerInfo.country}
                    onChange={e => setCustomerInfo(prev => ({ ...prev, country: e.target.value }))}
                    dir={isArabic ? "rtl" : "ltr"}
                    disabled
                    className="w-full border rounded px-2 py-2 bg-gray-100 cursor-not-allowed"
                  >
                    <option value="Kuwait">{isArabic ? "الكويت" : "Kuwait"}</option>
                  </select>
                </div>
                <div>
                  <Label className="mb-1" htmlFor="city">{isArabic ? "المحافظة" : "Governorate"} <span className="text-red-600">*</span></Label>
                  <select
                    id="city"
                    required
                    value={selectedGovernorate}
                    onChange={e => handleGovernorateChange(e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    // Always editable
                    className="w-full border rounded px-2 py-2"
                  >
                    <option value="">{isArabic ? "اختر المحافظة" : "Select Governorate"}</option>
                    {GovernateswithRegions.governorates.map(gov => (
                      <option key={isArabic ? gov.arabic : gov.english} value={isArabic ? gov.arabic : gov.english}>
                        {isArabic ? gov.arabic : gov.english}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="area">{isArabic ? "المنطقة" : "Area"} <span className="text-red-600">*</span></Label>
                  <select
                    id="area"
                    required
                    value={customerInfo.area}
                    onChange={e => handleAreaChange(e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    disabled={!selectedGovernorate}
                    className="w-full border rounded px-2 py-2"
                  >
                    <option value="">{isArabic ? "اختر المنطقة" : "Select Area"}</option>
                    {availableAreas.map(region => (
                      <option key={isArabic ? region.arabic : region.english} value={isArabic ? region.arabic : region.english}>
                        {isArabic ? region.arabic : region.english}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1" htmlFor="block">{isArabic ? "القطعة" : "Block"} <span className="text-red-600">*</span></Label>
                  <Input
                    id="block"
                    required
                    value={customerInfo.block}
                    onChange={(e) => handleInputChange("block", e.target.value)}
                    // Always editable
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="street">{isArabic ? "الشارع" : "Street"} <span className="text-red-600">*</span></Label>
                  <Input
                    id="street"
                    required
                    value={customerInfo.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    // Always editable
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="house">{isArabic ? "رقم المنزل" : "House Number"} <span className="text-red-600">*</span></Label>
                  <Input
                    id="house"
                    required
                    value={customerInfo.house}
                    onChange={(e) => handleInputChange("house", e.target.value)}
                    // Always editable
                  />
                </div>
              </div>
            {/* Payment Method Selection */}
<div className="mb-6">
  <label className="mb-2 block text-sm font-semibold text-neutral-800">
    {isArabic ? "طريقة الدفع" : "Payment Method"}
  </label>
  <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
    <label className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition-all hover:bg-neutral-100 focus-within:ring-2 focus-within:ring-[#00B8DB] cursor-pointer">
      <input
        type="radio"
        name="paymentMethod"
        value="cod"
        checked={paymentMethod === "cod"}
        onChange={() => handlePaymentMethodChange("cod")}
        className="h-5 w-5 text-[#00B8DB] focus:ring-[#00B8DB] cursor-pointer"
      />
      <span className="text-sm font-medium text-neutral-700">
        {isArabic ? "الدفع عند التسليم" : "Cash on Delivery"}
      </span>
    </label>
    <label className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition-all hover:bg-neutral-100 focus-within:ring-2 focus-within:ring-[#00B8DB] cursor-pointer">
      <input
        type="radio"
        name="paymentMethod"
        value="knet"
        checked={paymentMethod === "knet"}
        onChange={() => handlePaymentMethodChange("knet")}
        className="h-5 w-5 text-[#00B8DB] focus:ring-[#00B8DB] cursor-pointer"
      />
      <span className="text-sm font-medium text-neutral-700">
        {isArabic ? "كي نت - أونلاين" : "Knet - Online"}
      </span>
    </label>
  </div>
  {paymentMethod === "knet" && !isAuthorized && (
    <p className="mt-2 text-xs text-yellow-600 font-medium italic bg-yellow-50/50 p-2 rounded-md">
      {isArabic ? "يجب تسجيل الدخول كمستخدم مخول لدفع باستخدام كي نت" : "You must login as an authorized user to pay with Knet"}
    </p>
  )}
</div>
              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={loading || (paymentMethod === "knet" && !isAuthorized)}>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingDots />
                      <span>{loadingMessage}</span>
                    </div>
                  ) : isArabic ? (
                    paymentMethod === "knet" ? "تأكيد الطلب - دفع كي نت" : "تأكيد الطلب - دفع عند التسليم"
                  ) : (
                    paymentMethod === "knet" ? "Confirm Order - Pay with Knet" : "Confirm Order - Cash on Delivery"
                  )}
                </Button>
              </div>
            </form>
            {/* Auth Dialog for Knet using shadcn/ui Dialog */}
            <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-yellow-700">
                    {isArabic ? "تسجيل دخول المسؤول" : "Admin Login Required"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-2 pt-2">
                  <Input
                    type="email"
                    placeholder={isArabic ? "البريد الإلكتروني" : "Email"}
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    autoFocus
                  />
                  <Input
                    type="password"
                    placeholder={isArabic ? "كلمة المرور" : "Password"}
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                  />
                  {authError && <div className="text-red-600 text-sm">{authError}</div>}
                </div>
                <DialogFooter className="flex gap-2 pt-2">
                  <Button variant="default" onClick={handleAuthLogin}>
                    {isArabic ? "تسجيل الدخول" : "Login"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
                    {isArabic ? "إلغاء" : "Cancel"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#FEEE00]">
          <CardHeader>
            <CardTitle className="text-xl md:text-3xl">{isArabic ? "ملخص الطلب" : "Order Summary"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Promo Code */}
            <div>
              <div className="flex gap-2">
                <Input
                  placeholder={isArabic ? "كود الخصم" : "Promo Code"}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="h-10"
                  disabled={isApplyingPromo || isPromoApplied} // Disable input if promo is applied
                />
                <Button
                  onClick={applyPromoCode}
                  variant="outline"
                  className="h-10"
                  disabled={isApplyingPromo || isPromoApplied} // Disable button if promo is applied
                >
                  {isApplyingPromo ? (
                    <span className="animate-pulse">{isArabic ? "جارٍ التطبيق..." : "Applying..."}</span>
                  ) : (
                    <span>{isArabic ? "تطبيق" : "Apply"}</span>
                  )}
                </Button>
              </div>
              {promoError && (
                <p className="text-red-600 text-sm mt-2 animate-fade-in">{promoError}</p>
              )}
              {discountAmount > 0 && (
                <p className="text-green-600 text-sm mt-2 animate-fade-in flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCheck size={16} className="text-green-600" />
                    {isArabic ? `خصم مطبق: -${discountAmount.toFixed(2)} د.ك` : `Applied Discount: -${discountAmount.toFixed(2)} KD`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPromoCode("")
                      setDiscountAmount(0)
                      setPromoError("")
                      setIsPromoApplied(false)
                      toast.info(isArabic ? "تم إلغاء الخصم" : "Discount Canceled")
                    }}
                    className="h-auto p-1 text-red-600 hover:text-red-700"
                    aria-label={isArabic ? "إلغاء الخصم" : "Cancel Discount"}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </p>
              )}
            </div>

            {/* Item List in Order Summary */}
            {/* Cast to (CartItem | ProjectCartItem)[] for mixed cart support in summary */}
            <>
              {((state.items as Array<any>) as (import("@/lib/types").CartItem | import("@/lib/types").ProjectCartItem)[]).map((item) => {
                if ("type" in item && item.type === "project-bundle") {
                  // Project bundle summary
                  const engineerCount = (item.engineerNames || []).length;
                  // For bundles, we don't have explicit bundle objects, so use engineerNames.length as bundle count
                  const bundleCount = engineerCount; // If you have bundle info, adjust accordingly
                  const productCount = item.products.length;
                  return (
                    <div key={item.projectId} className="flex flex-col gap-2 border-b pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172B]">{isArabic ? "مشروع:" : "Project:"} {item.projectName}</span>
                        <span className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-xs font-medium border border-[#FEEE00]">{item.engineerNames.length} {isArabic ? "مهندس" : "Engineers"}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">{item.engineerNames.length} {isArabic ? "حزمة" : "Bundles"}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">{item.products.length} {isArabic ? "منتج" : "Products"}</span>
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        {isArabic ? "البريد الإلكتروني:" : "Engineer Email:"} {item.engineerEmails?.join(", ")}
                      </div>
                      <div className="grid grid-cols-1  gap-2 mt-2">
                        {item.products.map((prod: Product, idx: number) => (
                          <div key={prod._id + idx} className="flex items-center gap-2 shadow-xl rounded-xl p-2">
                            <div className="relative w-14 h-14 rounded-xl shadow-sm">
                              <img
                                src={prod.image?.split(",")[0] || "/placeholder.svg?height=64&width=64"}
                                alt={isArabic ? prod.ar_name : prod.en_name}
                                className="object-cover w-full h-full rounded-md"
                              />
                              <span className="z-10 absolute -top-2 -right-2 bg-[#00B8DB] text-white text-xs font-semibold flex items-center justify-center rounded-full min-w-[1rem] min-h-[1rem] px-1 py-0.5">
                                x{item.quantity}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 leading-tight">
                              <span className="font-semibold">{isArabic ? prod.ar_name : prod.en_name}</span>
                              <span>{prod.price} {isArabic ? "د.ك" : "KD"}</span>
                            </div>
                            <span className="font-semibold ml-auto">
                              {(prod.price * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-2">
                        <span className="font-bold text-base">{(item.products.reduce((sum: number, p: Product) => sum + p.price, 0) * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}</span>
                      </div>
                    </div>
                  );
                } else if ("product" in item) {
                  // Regular product summary
                  return (
                    <div key={item.product._id} className="flex md:items-start justify-between items-end md:gap-4 flex-col md:flex-row">
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative w-24 h-24 rounded-xl shadow-sm">
                          {item.product.image ? (
                            <img
                              src={item.product.image.split(",")[0]}
                              alt={isArabic ? item.product.ar_name : item.product.en_name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <span>{isArabic ? "لا صورة" : "No Image"}</span>
                            </div>
                          )}
                          <span className="z-10 absolute -top-2 -right-2 bg-[#00B8DB] text-white text-xs font-semibold flex items-center justify-center rounded-full min-w-[1rem] min-h-[1rem] px-1 py-0.5">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 leading-tight">
                          <span className="font-semibold">
                            {isArabic ? item.product.ar_name : item.product.en_name}
                          </span>
                          <span>
                            {item.product.price} {isArabic ? "د.ك" : "KD"}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold">
                        {(item.product.price * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </>
            {/* Totals */}
            <div className="border-t border-[#00B8DB] pt-4">
              <div className="flex justify-between text-base">
                <span>{isArabic ? "رسوم التوصيل" : "Shipping Fee"}</span>
                <span>{shippingFee.toFixed(2)} {isArabic ? "د.ك" : "KD"}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>{isArabic ? "المجموع" : "Total"}</span>
                <span>
                  {(state.total - discountAmount + shippingFee).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{isArabic ? "الخصم المطبق" : "Applied Discount"}</span>
                  <span>
                    -{discountAmount.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{isArabic ? "طريقة الدفع" : "Payment Method"}</h3>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {paymentMethod === "knet"
                    ? isArabic ? "كي نت" : "Knet"
                    : isArabic ? "الدفع عند التسليم - نقداً" : "Cash on Delivery"}
                </p>
                <img
                  src={paymentMethod === "knet" ? "/knet-logo.svg" : "/cash-on-delivery.svg"}
                  alt={paymentMethod === "knet" ? "Knet" : "Cash on Delivery"}
                  style={{ height: 32 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}