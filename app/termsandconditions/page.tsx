"use client"
import React from "react"
import { useCart } from "@/lib/context"
import { InfoIcon } from "lucide-react"

// JSON structure for terms
const termsEnJson = [
  {
    text: "GENERAL TERMS & CONDITIONS",
    subPoints: [
      "By placing an Order through our online store, Customers agree to be bound by this Agreement. It is highly recommended and solely the Customer’s responsibility to read the Agreement carefully before placing an Order. AM Tronics reserves the right to modify the terms of this Agreement at any time, with such changes taking effect upon being posted on the website.",
      "Customers must create an Account on the online store to place an Order. Detailed information on account creation is available in the Site Terms of Use. AM Tronics reserves the right to cancel any Order and close any Account that breaches the Account creation terms specified in the Site Terms of Use."
    ]
  },
  {
    text: "PRICES & ORDERS",
    subPoints: [
      "Customers agree to pay the full price for the Product as listed in the Product Description at the time of Order, along with any applicable installation and shipping fees. While AM Tronics strives to ensure all Product prices are accurate, errors may occur. If a pricing error is identified, AM Tronics will, at its discretion, either (1) inform the Customer and offer the option to confirm the Order at the correct price or cancel the Order, or (2) cancel the Order and issue a refund if payment has already been made. The Customer acknowledges this as the sole remedy in the event of a pricing error.",
      "All prices are displayed in Kuwaiti Dinar and exclude taxes (if applicable), shipping, and installation charges unless explicitly stated otherwise in the Agreement.",
      "Upon successfully placing and accepting an Order, the Customer will receive an Order confirmation email detailing the Order. AM Tronics may not retain all Order details, so it is advisable for Customers to keep a record of their Order details and email confirmation.",
      "The risk of loss or damage to the Products passes to the Customer upon the first delivery attempt to the address specified in the Order. Ownership of the Products remains with AM Tronics until full payment is received. AM Tronics reserves the right to cancel any Order before dispatching the Products.",
      "AM Tronics reserves the right to refuse any Order placed with us. At our sole discretion, we may limit or cancel quantities purchased per person, per household, or per Order. These restrictions may include Orders placed by or under the same Customer account, the same credit card, and/or Orders using the same billing and/or shipping address. In the event of changes to or cancellation of an Order, we may attempt to notify the Customer by contacting the email address, billing address, or phone number provided at the time of the Order. Additionally, we reserve the right to limit or prohibit Orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors."
    ]
  },
  {
    text: "PAYMENT",
    subPoints: [
      "The online store offers several payment options, including KNET, VISA, Mastercard, and Apple Pay, which may vary at AM Tronics discretion. The applicable payment method will be shown at the final stage before Order submission.",
      "For card payments, whether at the time of Order or upon delivery, by placing an Order, the Customer authorizes AM Tronics or its third-party payment processor to process and validate the card details for the Order amount. To ensure the card is not used without the Customer’s consent, we direct the Customer to the payment gateway page to enter card details as required by the payment gateway operator. The payment gateway operator may validate the card details along with other information against their databases.",
      "The responsibility for validating the Customer and their card information and authorizing the transaction lies with the respective payment gateway operator and/or the card issuer, according to their terms and conditions. AM Tronics is not liable for any losses or damages resulting from fraudulent transactions due to attacks or breaches on any payment gateway operator, issuer banks, or due to the Customer’s card details being acquired by persons with malicious intent."
    ]
  },
  {
    text: "PRE-ORDERS",
    subPoints: [
      "We may allow pre-orders for new Products before their launch. Payment for pre-ordered Products must be made in full at the time of pre-ordering.",
      "Pre-orders may be subject to additional terms, which will take precedence over these Customer Terms in case of any inconsistency, unless otherwise decided by AM Tronics.",
      "The official launch date for the pre-ordered Product will be displayed in the Product Description. Standard delivery timelines will commence once the pre-ordered Product is available.",
      "Online discount promotions running prior to the release date of a pre-order are not applicable to pre-ordered Products. Discounts will not apply to pre-orders if their release date does not coincide with the promotion period.",
      "AM Tronics reserves the right to change the release date without any liability to Customers. Additionally, we reserve the right to cancel all pre-orders without liability, except for refunding the payment according to our refund terms."
    ]
  },
  {
    text: "DISCOUNT COUPONS AND GENERAL PROMOTIONS",
    subPoints: [
      "As part of our promotional activities, AM Tronics may issue discount coupons to Account holders or offer discounts or promotional sales for certain Products. These promotions may have additional terms, which will take precedence over these Customer Terms in case of any inconsistency, unless otherwise decided by AM Tronics.",
      "Unless otherwise stated in writing, discount coupons are redeemable only for Products sold by AM Tronics and are valid only during the promotional period indicated in their terms.",
      "Discount coupons cannot be partially used, used twice, or exchanged for shopping credit. Only one discount coupon can be used per transaction.",
      "AM Tronics reserves the right to suspend, stop, or exclude the use of discount coupons on special promotions without advance notice."
    ]
  },
  {
    text: "DELIVERY",
    subPoints: [
      "We will make reasonable efforts to contact the Customer prior to delivery to schedule it. The Customer must present proof of identity when requested by our delivery partner.",
      "If the Customer is not present at the delivery address, the Order will be returned to our warehouse. The Customer must contact customer care to reschedule delivery within a reasonable time. Failure to do so will result in the Order being canceled.",
      "Accurate delivery depends on the delivery address details provided by the Customer. AM Tronics will deliver purchased Products as soon as possible after Order confirmation.",
      "The Customer can review, update, or add delivery address details for each Order.",
      "While we aim to deliver Orders within the estimated timeframe, AM Tronics is not liable for delays or failures to deliver within the estimated or preferred time.",
      "Delivery timelines and charges may vary based on the delivery area, season, Products, and delivery option. Indicative terms include:",
      [
        "Large appliances and items requiring installation can only be delivered during the day shift up to 4 PM.",
        "Express delivery within 3 hours.",
        "Express delivery cannot be rescheduled. To reschedule, contact our call center and the order will follow the regular delivery schedule.",
        "Express delivery may not be available for certain areas."
      ],
      "Orders can only be delivered within Kuwait and must be signed upon delivery by the Account owner or an adult representative aged 18 years or over. The Customer must provide a correct delivery address to ensure prompt delivery.",
      "For changes to the delivery address or schedule after Order confirmation, contact AM Tronics customer service.",
      "The Customer will be informed of the delivery status and time. AM Tronics will try to contact the Customer before scheduling delivery to provide timing information. While we aim to accommodate preferred delivery timings, actual delivery times may vary due to uncontrollable delays.",
      "In the absence of the Customer, delivery is considered complete if a family member or home cleaner signs the invoice/delivery note. Products are considered delivered in good condition upon acceptance of the delivery note.",
      "Purchased Products not requested for delivery or undelivered due to the Customer's absence will be sold after one (1) month from the purchase date, and AM Tronics will refund the invoice value minus a 20% deduction."
    ]
  },
  {
    text: "DISCLAIMER, INDEMNITY, AND LIABILITY",
    subPoints: [
      "To the fullest extent permitted by law, AM Tronics disclaim all warranties and representations, express, implied, or statutory, regarding Products and services, including warranties of merchantability, fitness for a particular purpose, and non-infringement. Customers use the online store and purchase Products at their own risk.",
      "Customers shall defend, indemnify, and hold harmless AM Tronics, its service providers and their officers, employees, and agents from any liabilities, costs, damages, injuries, claims, suits, judgments, causes of action, and expenses arising from the Customer’s misuse of the platform or Account.",
      "AM Tronics is not liable for incidental, indirect, consequential, punitive, or special damages, loss of revenue, or profits. AM Tronics’s aggregate liability under the Agreement shall not exceed the Product value."
    ]
  }
]

const termsArJson = [
 
  {
    text: "الاتفاقية والبائعون",
    subPoints: [
      "من خلال تقديم طلب عبر متجرنا الإلكتروني، يوافق العملاء على الالتزام بهذه الاتفاقية. ويقع على عاتق العميل وحده مسؤولية قراءة الاتفاقية بعناية قبل تقديم الطلب. تحتفظ AM Tronics بالحق في تعديل شروط هذه الاتفاقية في أي وقت، وتدخل هذه التغييرات حيز التنفيذ عند نشرها على الموقع الإلكتروني.",
      "يجب على العملاء إنشاء حساب على المتجر الإلكتروني لتقديم طلب. تتوفر معلومات مفصلة عن إنشاء الحساب في شروط استخدام الموقع. تحتفظ AM Tronics بالحق في إلغاء أي طلب وإغلاق أي حساب يخالف شروط إنشاء الحساب المحددة في شروط استخدام الموقع."
    ]
  },
  {
    text: "الأسعار والطلبات",
    subPoints: [
      "يوافق العملاء على دفع السعر الكامل للمنتج كما هو مذكور في وصف المنتج وقت الطلب، بالإضافة إلى أي رسوم تركيب وشحن مطبقة. بينما تسعى AM Tronics لضمان دقة جميع أسعار المنتجات، قد تحدث أخطاء. في حالة اكتشاف خطأ في التسعير، ستقوم AM Tronics ، وفقًا لتقديرها، إما (1) بإعلام العميل وتقديم الخيار لتأكيد الطلب بالسعر الصحيح أو إلغاء الطلب، أو (2) إلغاء الطلب واسترداد المبلغ إذا تم الدفع بالفعل. يقر العميل بأن هذا هو الحل الوحيد في حالة حدوث خطأ في التسعير.",
      "يتم عرض جميع الأسعار بالدينار الكويتي وتستثني الضرائب (إن وجدت)، ورسوم الشحن والتركيب ما لم يُذكر خلاف ذلك في الاتفاقية.",
      "عند تقديم الطلب وقبوله بنجاح، سيتلقى العميل بريدًا إلكترونيًا لتأكيد الطلب يتضمن تفاصيل الطلب. قد لا تحتفظ AM Tronics بجميع تفاصيل الطلب، لذا يُنصح العملاء بالاحتفاظ بسجل تفاصيل الطلب وتأكيد البريد الإلكتروني.",
      "ينتقل خطر الفقد أو الضرر للمنتجات إلى العميل عند المحاولة الأولى للتسليم إلى العنوان المحدد في الطلب. تظل ملكية المنتجات مع AM Tronics حتى يتم استلام الدفع بالكامل. تحتفظ AM Tronics بالحق في إلغاء أي طلب قبل شحن المنتجات.",
      "تحتفظ AM Tronics بالحق في رفض أي طلب يتم تقديمه لنا. وفقًا لتقديرنا، قد نحدد أو نلغي الكميات المشتراة لكل شخص أو لكل منزل أو لكل طلب. قد تشمل هذه القيود الطلبات المقدمة من أو تحت نفس حساب العميل، أو نفس بطاقة الائتمان، و/ أو الطلبات التي تستخدم نفس عنوان الفواتير و/ أو الشحن. في حالة إجراء تغييرات على أو إلغاء طلب، قد نحاول إخطار العميل من خلال الاتصال بعنوان البريد الإلكتروني أو عنوان الفواتير أو رقم الهاتف المقدم في وقت الطلب. بالإضافة إلى ذلك، نحتفظ بالحق في تحديد أو منع الطلبات التي نراها، وفقًا لتقديرنا الوحيد، مقدمة من قبل تجار أو موزعين أو وكلاء."
    ]
  },
  {
    text: "الدفع",
    subPoints: [
      "يقدم المتجر الإلكتروني عدة خيارات للدفعVisa / Muster Card / Knet  وسيتم عرض طريقة الدفع المطبقة في المرحلة النهائية.",
      "بالنسبة لمدفوعات البطاقات، سواء عند تقديم الطلب أو عند التسليم، من خلال تقديم الطلب، يفوض العميل AM Tronics أو معالج الدفع التابع لجهة خارجية بمعالجة والتحقق من تفاصيل البطاقة لمبلغ الطلب. لضمان عدم استخدام البطاقة دون موافقة العميل، يوجه العميل إلى صفحة بوابة الدفع لإدخال تفاصيل البطاقة حسب المتطلبات.",
      "تكون مسؤولية التحقق من العميل وتفاصيل بطاقته وتفويض المعاملة على عاتق مشغل بوابة الدفع و/ أو مصدر البطاقة، وفقًا لشروطهم وأحكامهم. لا تتحمل AM Tronics أي مسؤولية عن أي خسائر أو أضرار ناتجة عن معاملات احتيالية بسبب الهجمات أو الاختراقات على أي مشغل بوابة دفع أو بنوك الإصدار أو بسبب الحصول على تفاصيل البطاقة الخاصة بالعميل من قبل أشخاص ذوي نوايا خبيثة."
    ]
  },
  {
    text: "الطلبات المسبقة",
    subPoints: [
      "قد نسمح بالطلبات المسبقة للمنتجات الجديدة قبل إطلاقها. يجب دفع مبلغ المنتجات المسبقة بالكامل عند تقديم الطلب المسبق.",
      "قد تخضع الطلبات المسبقة لشروط إضافية وتأخذ الأولوية على شروط العميل هذه في حالة وجود أي تناقض، ما لم تقرر AM Tronics خلاف ذلك.",
      "سيتم عرض تاريخ الإطلاق الرسمي للمنتج المسبق في وصف المنتج. ستبدأ مواعيد التسليم العادية بمجرد توفر المنتج المسبق.",
      "العروض الترويجية على الإنترنت التي تجري قبل تاريخ إصدار الطلب المسبق لا تنطبق على المنتجات المسبقة. لن تنطبق الخصومات على الطلبات المسبقة إذا لم يتزامن تاريخ إصدارها مع فترة العرض الترويجي.",
      "تحتفظ AM Tronics بالحق في تغيير تاريخ الإصدار دون أي مسؤولية تجاه العملاء. بالإضافة إلى ذلك، نحتفظ بالحق في إلغاء جميع الطلبات المسبقة دون مسؤولية، باستثناء استرداد المبلغ وفقًا لشروط الاسترداد لدينا."
    ]
  },
  {
    text: "قسائم الخصم والعروض العامة",
    subPoints: [
      "كجزء من أنشطتنا الترويجية، قد تصدر AM Tronics قسائم خصم لحاملي الحسابات أو تقدم خصومات أو مبيعات ترويجية لمنتجات معينة. قد تكون لهذه العروض شروط إضافية تأخذ الأولوية على شروط العميل هذه في حالة وجود أي تناقض، ما لم تقرر AM Tronics خلاف ذلك.",
      "ما لم يُذكر خلاف ذلك كتابيًا، يمكن استرداد قسائم الخصم فقط للمنتجات المباعة من قبل AM Tronics وتكون صالحة فقط خلال الفترة الترويجية المحددة في شروطها.",
      "لا يمكن استخدام قسائم الخصم جزئيًا أو استخدامها مرتين أو استبدالها برصيد تسوق. يمكن استخدام قسيمة خصم واحدة فقط لكل معاملة.",
      "تحتفظ AM Tronics بالحق في تعليق أو إيقاف أو استبعاد استخدام قسائم الخصم في العروض الترويجية الخاصة دون إشعار مسبق."
    ]
  },
  {
    text: "التوصيل",
    subPoints: [
      "سنبذل جهودًا معقولة للاتصال بالعميل قبل التسليم لتحديد موعده. يجب على العميل تقديم إثبات الهوية عند الطلب من قبل شريك التوصيل لدينا.",
      "إذا لم يكن العميل حاضرًا في عنوان التوصيل، سيتم إعادة الطلب إلى مستودعنا. يجب على العميل الاتصال بخدمة العملاء لإعادة جدولة التوصيل في وقت معقول. الفشل في القيام بذلك سيؤدي إلى إلغاء الطلب.",
      "تعتمد دقة التوصيل على تفاصيل عنوان التوصيل المقدمة من العميل. ستقوم AM Tronics بتوصيل المنتجات المشتراة في أقرب وقت ممكن بعد تأكيد الطلب.",
      "يمكن للعميل مراجعة وتحديث أو إضافة تفاصيل عنوان التوصيل لكل طلب.",
      "بينما نسعى لتوصيل الطلبات ضمن الإطار الزمني المقدر، لا تتحمل AM Tronics المسؤولية عن التأخيرات أو الفشل في التوصيل ضمن الوقت المقدر أو المفضل.",
      "قد تختلف أوقات ورسوم التوصيل بناءً على منطقة التوصيل، الموسم، المنتجات، وخيار التوصيل. تشمل الشروط الاستدلالية :",
      [
        "يمكن توصيل الأجهزة الكبيرة والعناصر التي تتطلب التركيب فقط خلال الفترة النهارية حتى الساعة 4 مساءً.",
        "توصيل سريع لمدة 3 ساعات.",
        "لا يمكن إعادة جدولة التوصيل السريع. لإعادة الجدولة، اتصل بمركز الاتصال لدينا وسيتبع الطلب جدول التوصيل العادي.",
        "توصيل سريع لمدة 3 ساعات غير متاح لمناطق معينة."
      ],
      "يمكن توصيل الطلبات فقط داخل الكويت ويجب التوقيع عليها عند التسليم من قبل صاحب الحساب أو ممثل بالغ يبلغ 18 عامًا أو أكثر. يجب على العميل تقديم عنوان توصيل صحيح لضمان التوصيل الفوري.",
      "للتغييرات في عنوان التوصيل أو الجدول الزمني بعد تأكيد الطلب، اتصل بخدمة عملاء AM Tronics.",
      "سيتم إعلام العميل بحالة ووقت التوصيل. ستحاول AM Tronics الاتصال بالعميل قبل تحديد موعد التوصيل لتقديم معلومات الوقت. بينما نسعى لتلبية تفضيلات وقت التوصيل، قد تختلف أوقات التوصيل الفعلية بسبب التأخيرات غير القابلة للتحكم.",
      "في غياب العميل، يعتبر التوصيل مكتملًا إذا وقع أحد أفراد الأسرة أو العامل المنزلي على فاتورة/مذكرة التوصيل. تعتبر المنتجات مسلمة في حالة جيدة عند قبول مذكرة التوصيل.",
      "تعتبر المنتجات المشتراة التي لم يتم طلب توصيلها أو لم يتم توصيلها بسبب غياب العميل قد بيعت بعد شهر واحد من تاريخ الشراء، وستقوم AM Tronics برد قيمة الفاتورة مطروحًا منها خصم 20 بالمائة."
    ]
  },
  {
    text: "إخلاء المسؤولية والتعويض والمسؤولية",
    subPoints: [
      "إلى أقصى حد يسمح به القانون، تخلي AM Tronics مسؤوليتها عن جميع الضمانات والتمثيلات، سواء كانت صريحة أو ضمنية أو قانونية، بشأن المنتجات والخدمات، بما في ذلك الضمانات الضمنية للتسويق والملاءمة لغرض معين وعدم الانتهاك. يستخدم العملاء المتجر الإلكتروني ويشترون المنتجات على مسؤوليتهم الخاصة.",
      "يجب على العملاء الدفاع والتعويض عن AM Tronics ومقدمي خدماتها وموظفيهم ووكلائهم من أي مسؤوليات أو تكاليف أو أضرار أو إصابات أو مطالبات أو دعاوى أو أحكام أو أسباب دعوى أو نفقات ناتجة عن سوء استخدام العميل للمنصة أو الحساب.",
      "لا تتحمل AM Tronics المسؤولية عن الأضرار العرضية أو غير المباشرة أو التبعية أو العقابية أو الخاصة أو فقدان الإيرادات أو الأرباح. لا تتجاوز المسؤولية الإجمالية لبست اليوسفي بموجب الاتفاقية قيمة المنتج."
    ]
  }
]

export function TermsAndConditionsPage() {
  const { state } = useCart()
  const isArabic = state.language === "ar"
  const dir = isArabic ? "rtl" : "ltr"
  const terms = isArabic ? termsArJson : termsEnJson

  return (
    <div dir={dir} className="max-w-4xl mx-auto py-12 px-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
        {isArabic ? "شروط العميل" : "Customer Terms"}
      </h1>
      <div className="space-y-6">
        <div className="font-medium bg-[#FEEE18]/50 px-2 py-4 text-xs flex justify-start flex-row items-start">
        <InfoIcon color="white" className="w-32" />
        {isArabic ? "مرحبًا بكم في AM Tronics. توضح هذه المعلومات الشروط والأحكام لشراء المنتجات من خلال متجرنا الإلكتروني الذي تديره AM Tronics. إلى جانب شروط استخدام الموقع، وإشعار الخصوصية، وإشعار ملفات تعريف الارتباط، وأي شروط إضافية تحددها AM Tronics ويتم تحديثها بشكل دوري. تشكل شروط العميل هذه الاتفاقية التي تحكم البيع للعملاء." : "Welcome to AM Tronics. These Customer Terms outline the terms and conditions for purchasing Products through our online store, which is managed by AM Tronics. Together with our Site Terms of Use, Privacy Notice, and Cookie Notice, as well as any additional terms set by AM Tronics and updated periodically, these Customer Terms form the Agreement governing the sale to Customers."}

          
        </div>
        {terms.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {section.text}
            </h2>
            {section.subPoints.length > 0 && (
              <ul className="list-disc pl-6 space-y-3">
                {section.subPoints.map((point, subIndex) => (
                  <li key={subIndex} className="text-gray-700 leading-relaxed">
                    {Array.isArray(point) ? (
                      <ul className="list-[circle] pl-5 mt-2 space-y-2">
                        {point.map((subPoint, subSubIndex) => (
                          <li key={subSubIndex} className="text-gray-600">
                            {subPoint}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      point
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TermsAndConditionsPage