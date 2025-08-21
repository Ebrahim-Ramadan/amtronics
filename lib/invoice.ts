// Use standalone build to avoid filesystem font lookups in bundled environments
// eslint-disable-next-line @typescript-eslint/no-var-requires
import PDFDocument from "pdfkit/js/pdfkit.standalone.js"
import path from "path"
import fs from "fs"
import { Order } from "./types"

function formatKWD(value: number): string {
	return `${value.toFixed(3)} KD`
}

function getItemsTotal(order: Order): number {
	return order.items.reduce((sum, item: any) => {
		if (item.type === "project-bundle" && Array.isArray(item.products)) {
			const bundleSum = item.products.reduce((pSum: number, p: any) => {
				const price = Number(p.price) || 0
				return pSum + price * (item.quantity || 1)
			}, 0)
			return sum + bundleSum
		}
		const price = Number(item?.product?.price) || 0
		return sum + price * (item.quantity || 1)
	}, 0)
}

function getCalculatedTotal(order: Order): number {
	const shipping = Number(order.shippingFee || 0)
	const discount = Number(order.discount || 0)
	return getItemsTotal(order) + shipping - discount
}

export async function generateInvoicePdf(order: Order & { _id: string }): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ size: "A4", margin: 40 })
		const buffers: Buffer[] = []
		doc.on("data", (chunk: Buffer) => buffers.push(chunk))
		doc.on("end", () => resolve(Buffer.concat(buffers)))
		doc.on("error", reject)

		// Header/logo
		const topLogoPathCandidates = [
			path.join(process.cwd(), "public", "amtronics-logo.webp"),
			path.join(process.cwd(), "public", "amtronics-logo.png"),
			path.join(process.cwd(), "public", "amtronics-logo.jpg"),
		]
		const topLogoPath = topLogoPathCandidates.find((p) => fs.existsSync(p))
		if (topLogoPath) {
			try { doc.image(topLogoPath, (doc.page.width - 80) / 2, doc.y, { width: 80 }); } catch {}
		}
		doc.moveDown(0.5)
		doc.fontSize(20).font("Helvetica-Bold").text("AM TRONICS", { align: "center" })
		doc.moveDown(0.2)
		doc.fontSize(11).font("Helvetica").text("+96555501387", { align: "center" })
		doc.moveDown(0.6)

		// Order line and badges
		doc.fontSize(12).font("Helvetica-Bold").text(`Order #${order._id.slice(-8).toUpperCase()}`, { align: "center" })
		doc.moveDown(0.4)

		const badgesY = doc.y
		const centerX = doc.page.width / 2
		doc.fontSize(10).font("Helvetica")

		function drawBadge(text: string, x: number, y: number) {
			const paddingX = 6
			const paddingY = 3
			const w = doc.widthOfString(text) + paddingX * 2
			const h = doc.currentLineHeight() + paddingY * 2
			doc.roundedRect(x, y, w, h, 4).strokeColor("#888").lineWidth(1).stroke()
			doc.fillColor("#444").text(text, x + paddingX, y + paddingY)
			doc.fillColor("#000")
			return { w, h }
		}

		const statusText = order.status === "completed" ? "Paid" : "Unpaid"
		const unpaidSize = drawBadge(statusText, centerX - 70, badgesY)
		drawBadge("Pickup", centerX - 70 + unpaidSize.w + 12, badgesY)
		doc.moveDown(1.2)

		// Customer and date
		doc.dash(3, { space: 3 }).strokeColor("#cccccc").moveTo(40, doc.y).lineTo(555, doc.y).stroke().undash()
		doc.moveDown(0.6)
		doc.fontSize(10)
		doc.text(`Customer: ${order.customerInfo?.name || "-"}`)
		const created = order.createdAt ? new Date(order.createdAt) : new Date()
		const dateStr = `${created.getFullYear()}-${String(created.getMonth()+1).padStart(2,"0")}-${String(created.getDate()).padStart(2,"0")} ${String(created.getHours()).padStart(2,"0")}:${String(created.getMinutes()).padStart(2,"0")}`
		doc.text(`Date : ${dateStr}`)
		doc.moveDown(0.6)
		doc.dash(3, { space: 3 }).strokeColor("#cccccc").moveTo(40, doc.y).lineTo(555, doc.y).stroke().undash()
		doc.moveDown(0.6)

		// Items header
		doc.font("Helvetica-Bold").text("Item", 40, doc.y)
		doc.text("Qty x Price", 300, doc.y)
		doc.text("Total", 460, doc.y, { align: "left" })
		doc.moveDown(0.5)
		doc.font("Helvetica")

		for (const item of order.items as any[]) {
			if (item.type === "project-bundle" && Array.isArray(item.products)) {
				doc.font("Helvetica-Bold").text(item.projectName || "Project Bundle")
				for (const p of item.products) {
					const price = Number(p.price) || 0
					const qty = item.quantity || 1
					doc.font("Helvetica").text(`${p.en_name}` , 40, doc.y)
					doc.text(`${qty} x ${formatKWD(price)}`, 300, doc.y)
					doc.text(`${formatKWD(qty * price)}`, 460, doc.y)
				}
				doc.moveDown(0.3)
			} else {
				const name = item?.product?.en_name || "Unnamed product"
				const price = Number(item?.product?.price) || 0
				const qty = item.quantity || 1
				doc.text(name, 40, doc.y)
				doc.text(`${qty} x ${formatKWD(price)}`, 300, doc.y)
				doc.text(`${formatKWD(qty * price)}`, 460, doc.y)
			}
		}

		doc.moveDown(0.6)
		doc.dash(3, { space: 3 }).strokeColor("#cccccc").moveTo(40, doc.y).lineTo(555, doc.y).stroke().undash()
		doc.moveDown(0.6)

		// Totals
		const subtotal = getItemsTotal(order)
		const shipping = Number(order.shippingFee || 0)
		const discount = Number(order.discount || 0)
		const total = getCalculatedTotal(order)

		doc.text(`Subtotal`, 340, doc.y)
		doc.text(formatKWD(subtotal), 460, doc.y)
		doc.text(`Total`, 340, doc.y + 14)
		doc.font("Helvetica-Bold").text(formatKWD(total), 460, doc.y + 14)
		doc.font("Helvetica")
		const remaining = order.status === "completed" ? 0 : total
		doc.text(`Remaining`, 340, doc.y + 28)
		doc.text(formatKWD(remaining), 460, doc.y + 28)
		doc.font("Helvetica").fontSize(10)
		doc.moveDown(0.6)
		doc.dash(3, { space: 3 }).strokeColor("#cccccc").moveTo(40, doc.y).lineTo(555, doc.y).stroke().undash()
		doc.moveDown(0.6)

		// Footer text
		doc.fontSize(11).text("Thank you for shopping", { align: "center" })
		doc.text("with us You're the best", { align: "center" })
		doc.text("Engineer", { align: "center" })
		doc.moveDown(0.4)
		// doc.fontSize(10).text("You can shop online via the", { align: "center" })
		// doc.text("link", { align: "center" })
		// doc.moveDown(0.4)

		// QR image (static). Tries common filenames under public.
		const qrCandidates = [
			path.join(process.cwd(), "public", "invoice-amtronics-logo-at-the-end.jpg"),
		]
		const qrPath = qrCandidates.find((p) => fs.existsSync(p))
		if (qrPath) {
			try {
				const w = 120
				doc.image(qrPath, (doc.page.width - w) / 2, doc.y, { width: w })
				doc.moveDown(0.6)
			} catch {}
		}

		// Bottom logo image
		const bottomLogoCandidates = [
			path.join(process.cwd(), "public", "invoice-amtronics-logo-at-the-end.jpg"),
		]
		const bottomLogoPath = bottomLogoCandidates.find((p) => fs.existsSync(p))
		if (bottomLogoPath) {
			try {
				const w = 120
				doc.image(bottomLogoPath, (doc.page.width - w) / 2, doc.y, { width: w })
			} catch {}
		}

		doc.end()
	})
}


