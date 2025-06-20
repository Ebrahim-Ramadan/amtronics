import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
const contentSid = process.env.TWILIO_CONTENT_SID

const client = twilio(accountSid, authToken)

export async function sendWhatsAppTemplate(to: string, contentVariables: { [key: string]: string }) {
  if (!accountSid || !authToken || !twilioPhoneNumber || !contentSid) {
    console.error("Twilio credentials or Content SID are not configured in environment variables.")
    return
  }

  try {
    const message = await client.messages.create({
      contentSid: contentSid,
      contentVariables: JSON.stringify(contentVariables),
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to.replace(/\s/g, "")}`,
    })
    console.log(`WhatsApp template sent successfully to ${to}. SID: ${message.sid}`)
  } catch (error) {
    console.error(`Failed to send WhatsApp template to ${to}:`, error)
  }
} 