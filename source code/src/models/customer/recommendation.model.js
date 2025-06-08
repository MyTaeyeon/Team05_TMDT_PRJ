// models/customer/recommendation.model.js
const db = require('../../config/db/connect')
const util = require('util')
const query = util.promisify(db.query).bind(db)

/**
 * Given a product_variant_id, finds other variants frequently
 * purchased in the same orders, ordered by frequency desc.
 */
async function getCoPurchased(product_variant_id, limit = 6) {
  const sql = `
    SELECT od2.product_variant_id, COUNT(*) AS freq
    FROM order_details od1
    JOIN order_details od2
      ON od1.order_id = od2.order_id
    WHERE od1.product_variant_id = ?
      AND od2.product_variant_id != ?
    GROUP BY od2.product_variant_id
    ORDER BY freq DESC
    LIMIT ?
  `
  return await query(sql, [product_variant_id, product_variant_id, limit])
}

async function getForUser(customer_id, limit = 6) {
  const sql = `
    SELECT od.product_variant_id, COUNT(*) AS cnt
    FROM orders o
    JOIN order_details od ON o.order_id = od.order_id
    WHERE o.customer_id = ?
    GROUP BY od.product_variant_id
    ORDER BY cnt DESC
    LIMIT ?
  `
  return await query(sql, [customer_id, limit])
}

module.exports = { getCoPurchased, getForUser }
