// controllers/customer/searchController.js
const recommendation = require('../../models/customer/recommendation.model')  // <<< add

searchController.detail = async (req, res) => {
  const product_variant_id = req.params.product_variant_id
  const header     = await index.header(req)
  const header_user= await index.header_user(req)
  const formatFn   = await general.formatFunction()

  const productInfo    = await product.getProductInfo(product_variant_id)
  // … other fetches …
  const notCateProducts= await general.getNotCateProducts(req, product_variant_id, 12)

 // fetch 6 co-purchased items
const coPurchased = await recommendation.getCoPurchased(product_variant_id, 6)

  res.status(200).render('./pages/search/detail', {
    user: header_user,
    header,
    product_variant_id,
    productInfo,
    productImgs,
    variantProducts,
    productDetails,
    productFeedbacks,
    cateProducts,
    notCateProducts,
   coPurchased,
    formatFunction: formatFn,
  })
}
