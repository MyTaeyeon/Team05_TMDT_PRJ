const { promisify } = require("util")
const index = require("../../models/customer/index.model")
const order = require("../../models/customer/order.model")
const general = require("../../models/general.model")
const account = require("../../models/customer/account.model")

// Define the controller as an object to attach methods
const orderController = {}

// [POST] /order/addCart
orderController.addCart = async (req, res) => {
    let customer_id = 0
    if (req.user) {
        customer_id = req.user.customer_id
    } else {
        return res.status(401).json({ status: "NotAuth" })
    }
    const { product_variant_id, cart_quantity } = req.body
    const result = await order.addCart(customer_id, product_variant_id, cart_quantity)
    return res.json({ status: result ? "success" : "error" })
}

// [GET] /order/cart
orderController.cart = async (req, res) => {
    const customer_id = req.user.customer_id
    const header_user = await index.header_user(req)
    const header = await index.header(req)
    const detailCart = await order.getDetailCart(customer_id)
    const formatFunction = await general.formatFunction()
    res.render("./pages/order/cart", { header, user: header_user, detailCart, formatFunction })
}

// [POST] /order/cart/delete
orderController.deleteCart = async (req, res) => {
    const customer_id = req.user.customer_id
    const productsCartDelete = req.body
    order.deleteCart(customer_id, productsCartDelete, (err, success) => {
        return res.status(success ? 200 : 404).json({ status: success ? "success" : "error" })
    })
}

// [POST] /order/cart/update
orderController.updateCart = async (req, res) => {
    const customer_id = req.user.customer_id
    const { productsCartUpdate, productsCartUpdateOld } = req.body
    await order.deleteCart(customer_id, productsCartUpdate, () => {})
    await order.deleteCart(customer_id, productsCartUpdateOld, () => {})
    order.updateCart(customer_id, productsCartUpdate, (err, success) => {
        return res.status(success ? 200 : 404).json({ status: success ? "success" : "error" })
    })
}

// [GET] /order/information
orderController.information = async (req, res) => {
    const header_user = await index.header_user(req)
    const header = await index.header(req)
    const formatFunction = await general.formatFunction()
    res.render("./pages/order/information", { header, user: header_user, formatFunction })
}

// [POST] /order/information
orderController.informationPost = async (req, res) => {
    const customer_id = req.user.customer_id
    const { orderInfo, orderDetails } = req.body
    order.insertOrder(customer_id, orderInfo, orderDetails, (err, success, order_id) => {
        if (err || !success) {
            return res.status(404).json({ status: "error" })
        }
        order.deleteCart(customer_id, orderDetails, () => {})
        return res.status(200).json({ status: "success", order_id, paying_method_id: orderInfo.paying_method_id })
    })
}

// [GET] /order/payment?paying_method_id=x&order_id=y
orderController.payment = async (req, res) => {
    const { paying_method_id, order_id } = req.query
    const customer_id = req.user.customer_id
    const header_user = await index.header_user(req)
    const header = await index.header(req)
    const formatFunction = await general.formatFunction()
    const purchaseArr = await account.getPurchaseHistory(customer_id, 0, order_id)
    const purchase = purchaseArr[0]
    if (paying_method_id == 1) {
        return res.render("./pages/order/momo", { header, user: header_user, formatFunction, purchase })
    }
    if (paying_method_id == 2) {
        return res.render("./pages/order/atm",  { header, user: header_user, formatFunction, purchase })
    }
    if (paying_method_id == 3) {
        return res.render("./pages/order/credit", { header, user: header_user, formatFunction, purchase })
    }
}

// [POST] /order/cancel
orderController.cancelOrder = async (req, res) => {
    const { order_id } = req.body
    order.updateCancelOrder(order_id, (err, success) => {
        return res.status(success ? 200 : 404).json({ status: success ? "success" : "error" })
    })
}

// [GET] /order/refund
orderController.refundPage = async (req, res) => {
    const order_id = req.query.order_id
    const customer_id = req.user ? req.user.customer_id : null
    if (!customer_id) return res.redirect('/auth/login')
    const header_user = await index.header_user(req)
    const header = await index.header(req)
    const formatFunction = await general.formatFunction()
    const purchaseArr = await account.getPurchaseHistory(customer_id, 0, order_id)
    const purchase = purchaseArr[0]
    res.render("./pages/order/refund", { header, user: header_user, formatFunction, purchase })
}

// [POST] /order/refund
orderController.refundRequest = (req, res) => {
    const { order_id, reason } = req.body
    order.requestRefund(order_id, reason, (err) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ status: "error" })
        }
        res.status(200).json({ status: "success" })
    })
}

module.exports = orderController
