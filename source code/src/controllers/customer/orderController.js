
const { promisify } = require("util");
const index = require("../../models/customer/index.model");
const order = require("../../models/customer/order.model");
const general = require("../../models/general.model");
const account = require("../../models/customer/account.model");
require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");

const orderController = () => {};

orderController.addCart = async (req, res) => {
	let customer_id = req.user ? req.user.customer_id : 0;
	if (!customer_id) {
		return res.status(401).json({ status: "NotAuth" });
	}

	let { product_variant_id, cart_quantity } = req.body;
	let result = await order.addCart(customer_id, product_variant_id, cart_quantity);

	res.json({ status: result ? "success" : "error" });
};

orderController.cart = async (req, res) => {
	let customer_id = req.user.customer_id;
	let header_user = await index.header_user(req);
	let header = await index.header(req);
	let detailCart = await order.getDetailCart(customer_id);
	let formatFunction = await general.formatFunction();

	res.render("./pages/order/cart", { header, user: header_user, detailCart, formatFunction });
};

orderController.deleteCart = async (req, res) => {
	let customer_id = req.user.customer_id;
	let productsCartDelete = req.body;

	order.deleteCart(customer_id, productsCartDelete, (err, success) => {
		res.status(success ? 200 : 404).json({ status: success ? "success" : "error" });
	});
};

orderController.updateCart = async (req, res) => {
	let customer_id = req.user.customer_id;
	let { productsCartUpdate, productsCartUpdateOld } = req.body;

	await order.deleteCart(customer_id, productsCartUpdate, () => {});
	await order.deleteCart(customer_id, productsCartUpdateOld, () => {});
	await order.updateCart(customer_id, productsCartUpdate, (err, success) => {
		res.status(success ? 200 : 404).json({ status: success ? "success" : "error" });
	});
};

orderController.information = async (req, res) => {
	let header_user = await index.header_user(req);
	let header = await index.header(req);
	let formatFunction = await general.formatFunction();

	res.render("./pages/order/information", { header, user: header_user, formatFunction });
};

orderController.informationPost = async (req, res) => {
	let customer_id = req.user.customer_id;
	let { orderInfo, orderDetails } = req.body;

	order.insertOrder(customer_id, orderInfo, orderDetails, (err, success, order_id) => {
		if (success) {
			order.deleteCart(customer_id, orderDetails, () => {});
			res.status(200).json({ status: "success", order_id, paying_method_id: orderInfo.paying_method_id });
		} else {
			res.status(404).json({ status: "error" });
		}
	});
};

orderController.payment = async (req, res) => {
	let { paying_method_id, order_id } = req.query;
	let customer_id = req.user.customer_id;

	let header_user = await index.header_user(req);
	let header = await index.header(req);
	let formatFunction = await general.formatFunction();
	let purchase = await account.getPurchaseHistory(customer_id, 0, order_id);

	if (paying_method_id == 1) {
		const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
		const partnerCode = process.env.MOMO_PARTNER_CODE;
		const accessKey = process.env.MOMO_ACCESS_KEY;
		const secretKey = process.env.MOMO_SECRET_KEY;
		const redirectUrl = process.env.MOMO_REDIRECT_URL;
		const ipnUrl = process.env.MOMO_IPN_URL;

		if (!partnerCode || !accessKey || !secretKey || !redirectUrl || !ipnUrl) {
			console.error("❌ Missing MoMo configuration");
			return res.status(500).send("Thiếu cấu hình MoMo");
		}

		const requestId = `${partnerCode}_${Date.now()}`;
		const amount = purchase[0].order_details.reduce((total, item) => total + item.order_detail_price_after, 0);
		const orderInfo = `Thanh toán đơn hàng #${purchase[0].order_id}`;
		const orderId = `DH00${purchase[0].order_id}_${Date.now()}`;
		const requestType = "captureWallet";
		const extraData = Buffer.from(JSON.stringify({ orderFrom: "website" })).toString("base64");

		const rawSignature = 
			`accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
			`&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
			`&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
		const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

		const momoRequest = {
			partnerCode, accessKey, requestId, amount, orderId, orderInfo,
			redirectUrl, ipnUrl, extraData, requestType, signature,
			lang: "vi", autoCapture: true
		};

		console.log("➡️ MoMo API request:", JSON.stringify(momoRequest, null, 2));
		let qrCodeUrl = "";

		try {
			const momoResponse = await axios.post(endpoint, momoRequest);
			console.log("✅ MoMo API response:", JSON.stringify(momoResponse.data, null, 2));
			if (momoResponse.data.resultCode === 0) {
				qrCodeUrl = momoResponse.data.qrCodeUrl;
			} else {
				console.error("❌ MoMo business error:", momoResponse.data);
			}
		} catch (error) {
			if (error.response?.data) {
				console.error("❌ MoMo HTTP error:", JSON.stringify(error.response.data, null, 2));
			} else {
				console.error("❌ MoMo network error:", error.message);
			}
		}

		res.render("./pages/order/momo", {
			header, user: header_user, formatFunction,
			purchase: purchase[0], qrCodeUrl
		});
	} else if (paying_method_id == 2) {
		res.render("./pages/order/atm", { header, user: header_user, formatFunction, purchase: purchase[0] });
	} else if (paying_method_id == 3) {
		res.render("./pages/order/credit", { header, user: header_user, formatFunction, purchase: purchase[0] });
	}
};

orderController.cancelOrder = async (req, res) => {
	let order_id = req.body.order_id;
	await order.updateCancelOrder(order_id, (err, success) => {
		res.status(success ? 200 : 404).json({ status: success ? "success" : "error" });
	});
};

module.exports = orderController;
