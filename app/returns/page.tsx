"use client"

import React from 'react'
import { useCart } from "@/lib/context"

const returnPolicyEn = [
  "1. Time frame should not exceed 14 days from the date of receipt.",
  "2. The original invoice/receipt is required for all returns and exchanges; a valid ID with photo is also preferable.",
  "3. Product should not be opened and should be in its original condition.",
  "4. Returned product must be as new condition, in original packing and with warranty cards, manuals and accessories.",
  "5. When a promotional item is returned (in case of the promotion duration is passed), the value of the promotional item will be deducted from the refund amount.",
  "6. Free items that were given with purchased items must also be returned, and if those free of charge items were not as new, there might be additional charges.",
  "7. Any discrepancies could result in a delay or partial forfeiture of the refund.",
  "8. Some customers will be warned that subsequent returns will not be eligible for returns or exchange.",
  "9. AM Tronics reserves the right to deny any return or exchange.",
  "10. Non-returnable Consumable items just like batteries, microphones, chargers and similar products.",
  "11. Items that are damaged and abused. Items that has missing accessories such as remote controls, cords and cables.",
  "",
  "Return process:",
  "1. Pack your return in the original shipping package, if possible.",
  "2. Include all original packing materials, manuals and accessories.",
  "3. The original invoice/receipt should be available.",
  "4. Visit AM Tronics Service Center.",
  "5. Indicate the reason of the return.",
]

const returnPolicyAr = [
  "1. يجب ألا يتجاوز الإطار الزمني 14 يومًا من تاريخ الاستلام.",
  "2. الفاتورة الأصلية/الإيصال الأصلي مطلوب لجميع عمليات الإسترجاع والاستبدال؛ ويفضل أيضًا تقديم بطاقة هوية صالحة تحتوي على صورة.",
  "3. يجب ألا يتم فتح المنتج وأن يكون بحالته الأصلية.",
  "4. يجب أن تكون المنتجات المرتجعة بحالتها الجديدة، وفي عبوتها الأصلية ومعها بطاقات الضمان والأدلة والملحقات.",
  "5. عند إرجاع منتج ترويجي (في حالة انقضاء مدة العرض الترويجي)، سيتم خصم قيمة العنصر الترويجي من المبلغ المسترد.",
  "6. يجب أيضًا إرجاع العناصر المجانية التي تم تقديمها مع العناصر المشتراة، وإذا لم تكن تلك العناصر المجانية جديدة، فقد تكون هناك رسوم إضافية.",
  "7. قد تؤدي أي اختلافات إلى تأخير أو مصادرة جزء من المبلغ المسترد.",
  "8. سيتم تحذير العملاء من أن بعض عمليات الإرجاع اللاحقة لن تكون مؤهلة للإرجاع أو الاستبدال.",
  "9. تحتفظ شركة AM Tronics بالحق في رفض أي إرجاع أو استبدال للعناصر الغير القابلة للإرجاع.",
  "10. أي نوع من العناصر الاستهلاكية تمامًا مثل البطاريات والميكروفونات وأجهزة الشحن والمنتجات المماثلة.",
  "11. العناصر التالفة والمسيئة العناصر التي تفتقد الملحقات مثل أجهزة التحكم عن بعد والأسلاك والكابلات.",
  "",
  "إجراءات الاسترجاع:",
  "1. قم بتعبئة المنتج المسترجع في عبوة الشحن الأصلية، إن أمكن.",
  "2. تشمل كافة مواد التغليف الأصلية والأدلة والملحقات.",
  "3. يجب أن تكون الفاتورة الأصلية/الإيصال الأصلي متوفرة.",
  "4. زيارة مركز الخدمة .AM Troincs",
  "5. قم بتوضيح سبب الإرجاع .",
]

export default function ReturnsPage() {
  const { state } = useCart()
  const isArabic = state.language === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  return (
    <div dir={dir} className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {isArabic ? "سياسة العائدات" : "Return Policy"}
      </h1>
      <div className="space-y-2 text-base leading-relaxed">
        {(isArabic ? returnPolicyAr : returnPolicyEn).map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  )
}
