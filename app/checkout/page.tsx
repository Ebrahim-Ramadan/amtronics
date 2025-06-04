"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/context"
import type { CustomerInfo } from "@/lib/types"
import { useSavedAddresses } from "@/lib/saved-addresses-context"
import {  ChevronLeft, PlusCircle } from "lucide-react"
import Image from "next/image"
import { EmptyCart } from "@/components/empty-cart"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  console.log('state.items', state.items)
  
  const router = useRouter()
  const { state: savedAddressesState, dispatch: savedAddressesDispatch } = useSavedAddresses()
  const [loading, setLoading] = useState(false)
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

  // Load selected address if available
  useEffect(() => {
    if (selectedAddressIndex !== "new" && savedAddressesState.addresses[selectedAddressIndex]) {
      setCustomerInfo(savedAddressesState.addresses[selectedAddressIndex])
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
    }
  }, [selectedAddressIndex, savedAddressesState.addresses])

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
    if (selectedAddressIndex !== "new") {
      setSelectedAddressIndex("new")
    }
  }

  const handleAddressSelect = (value: string) => {
    setSelectedAddressIndex(value === "new" ? "new" : parseInt(value, 10))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        items: state.items,
        customerInfo,
        total: state.total,
        discount: 0,
        promoCode: "",
      }
      console.log('orderData', orderData)
      

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        if (selectedAddressIndex === "new" && customerInfo.phone && customerInfo.name) {
          savedAddressesDispatch({ type: "ADD_ADDRESS", payload: customerInfo })
        }
        const orderResult = await response.json();
        console.log('orderResult', orderResult);
        
        // Get existing order IDs from local storage
        const existingOrderIds = JSON.parse(localStorage.getItem('orderIds') || '[]') as string[];

        // Add the new order ID
        const updatedOrderIds = [...existingOrderIds, orderResult.newORderID];

        // Store updated list back in local storage
        localStorage.setItem('orderIds', JSON.stringify(updatedOrderIds));

        dispatch({ type: "CLEAR_CART" })
        router.push("/myorders") // Redirect to the new /myorders route
      } else {
        alert(isArabic ? "حدث خطأ في الطلب" : "Error placing order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert(isArabic ? "حدث خطأ في الطلب" : "Error placing order")
    } finally {
      setLoading(false)
    }
  }

// Redirect to cart only once when the component mounts and the cart is empty
if(state.items.length === 0){
  return (
  <EmptyCart isArabic={isArabic} />
)
}

  return (
    <div className="mx-auto md:px-20 py-4 md:py-6" dir={dir}>
      <a href="/cart" className="font-medium text-neutral-500 hover:text-[#00B8DB] text-xs md:text-sm flex justify-start items-center mb-2 text-center ">
      <ChevronLeft className="h-4 w-4 " />
      Back to Cart
      </a>
      <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-center">{isArabic ? "إتمام الطلب" : "Checkout"}</h1>

      <div className="grid lg:grid-cols-2 gap-8 [&>*]:py-6">
        {/* Customer Information Form */}
        <Card className="gap-2 md:gap-4">
          <CardHeader>
            <CardTitle className="text-xl md:text-3xl">{isArabic ? "معلومات التوصيل" : "Delivery Information"}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
          {savedAddressesState.addresses.length > 0 && (
    <div className="mb-6 ">
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
            <Image
            src="/checkoutAddressLatLngIndicator.gif"
            width={50}
            height={50}
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
          <input
            type="radio"
            name="address"
            value={index.toString()}
            checked={selectedAddressIndex === index}
            onChange={() => handleAddressSelect(index.toString())}
            className="w-4 h-4 text-[#00B8DB] border-[#00B8DB] focus:ring-[#00B8DB] bg-[#00B8DB]"
          />
        </div>
      ))}
      <div
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
        onClick={() => handleAddressSelect("new")}
      >
        <span dir={isArabic ? "rtl" : "ltr"} className="flex items-center gap-2 px-4 text-sm font-medium">
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
                  <Label className="mb-1" htmlFor="name">{isArabic ? "الاسم الكامل" : "Full Name"} *</Label>
                  <Input
                    id="name"
                    required
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    disabled={selectedAddressIndex !== "new"}
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="phone">{isArabic ? "رقم الهاتف" : "Phone Number"} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={selectedAddressIndex !== "new"}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1" htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email Address"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={selectedAddressIndex !== "new"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="country">{isArabic ? "الدولة" : "Country"} *</Label>
                  <Input
                    id="country"
                    required
                    value={customerInfo.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    disabled={selectedAddressIndex !== "new"}
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="city">{isArabic ? "المدينة" : "City"} *</Label>
                  <Input
                    id="city"
                    required
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    disabled={selectedAddressIndex !== "new"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="area">{isArabic ? "المنطقة" : "Area"} *</Label>
                  <Input
                    id="area"
                    required
                    value={customerInfo.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    disabled={selectedAddressIndex !== "new"}
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="block">{isArabic ? "القطعة" : "Block"} *</Label>
                  <Input
                    id="block"
                    required
                    value={customerInfo.block}
                    onChange={(e) => handleInputChange("block", e.target.value)}
                    disabled={selectedAddressIndex !== "new"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="street">{isArabic ? "الشارع" : "Street"} *</Label>
                  <Input
                    id="street"
                    required
                    value={customerInfo.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                    disabled={selectedAddressIndex !== "new"}
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="house">{isArabic ? "رقم المنزل" : "House Number"} *</Label>
                  <Input
                    id="house"
                    required
                    value={customerInfo.house}
                    onChange={(e) => handleInputChange("house", e.target.value)}
                    disabled={selectedAddressIndex !== "new"}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading
                    ? isArabic
                      ? "جاري إتمام الطلب..."
                      : "Processing Order..."
                    : isArabic
                      ? "تأكيد الطلب - دفع عند التسليم"
                      : "Confirm Order - Cash on Delivery"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>


        <Card className="border-2 border-[#FEEE00]">
  <CardHeader>
    <CardTitle className="text-xl md:text-3xl">{isArabic ? "ملخص الطلب" : "Order Summary"}</CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {state.items.map((item) => (
      <div key={item.product._id} className="flex md:items-start justify-between items-end md:gap-4 flex-col md:flex-row">
        <div className="flex items-center gap-3 w-full">
          <div className="relative w-24 h-24  rounded-xl shadow-sm">
            {item.product.image ? (
              <img
                src={item.product.image.split(',')[0]}
                alt={isArabic ? item.product.ar_name : item.product.en_name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                {/* Placeholder if no image */}
                <span>{isArabic ? "لا صورة" : "No Image"}</span>
              </div>
            )}
         <span className="z-10 absolute -top-2 -right-2 bg-[#00B8DB] text-white text-xs font-semibold flex items-center justify-center rounded-full min-w-[1rem] min-h-[1rem] px-1 py-0.5">
  x{item.quantity}
</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold">
              {isArabic ? item.product.ar_name : item.product.en_name}
            </span>
            {/* You might want to add other product details here if available */}
          </div>
        </div>
        <span className="font-semibold ">
          {(item.product.price * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}
        </span>
      </div>
    ))}

    <div className="border-t border-[#00B8DB] pt-4">
      <div className="flex justify-between text-lg font-bold">
        <span>{isArabic ? "المجموع" : "Total"}</span>
        <span>
          {state.total.toFixed(2)} {isArabic ? "د.ك" : "KD"}
        </span>
      </div>
    </div>

    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">{isArabic ? "طريقة الدفع" : "Payment Method"}</h3>
      <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">{isArabic ? "الدفع عند التسليم - نقداً" : "Cash on Delivery"}</p>
      <Image
      src='/cash-on-delivery.svg'
      width={40}
      height={40}
      alt="Cash on Delivery"
      />
      </div>
    </div>
  </CardContent>
</Card>

      </div>
    </div>
  )
}