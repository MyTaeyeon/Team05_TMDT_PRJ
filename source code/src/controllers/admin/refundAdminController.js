const general = require('../../models/general.model');
const order   = require('../../models/customer/order.model'); // reuse your model

// [GET] /admin/refunds
exports.list = async (req, res) => {
  const admin = req.admin;
  const formatFunction = await general.formatFunction();
  order.getRefundRequests((err, requests) => {
    if (err) return res.status(500).send("DB error");
    res.render("admin/pages/refund_requests", {
      admin,
      requests,
      formatFunction,
    });
  });
};

// [POST] /admin/refunds/process
exports.process = (req, res) => {
  const { order_id, action } = req.body;
  // action: 'approve' → status 2, 'deny' → status 3
  const status = action === "approve" ? 2 : 3;
  order.updateRefundStatus(order_id, status, (err) => {
    if (err) return res.status(500).json({ status: "error" });
    res.status(200).json({ status: "success" });
  });
};
