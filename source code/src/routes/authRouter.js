const express = require('express')
const router = express.Router()

// import controller
const authController = require('../controllers/customer/authController.js')

// import middleware
const middleware = require('../middleware/authMiddleware')

const redirectIfLoggedIn = (req, res, next) => {
    console.log(`redirectIfLoggedIn: ${req.cookies.userSave}`);
    if (req.cookies.userSave) {
        // Trong trường hợp này, bạn có thể muốn xác thực JWT trước khi chuyển hướng
        // để đảm bảo token còn hợp lệ.
        try {
            jwt.verify(req.cookies.userSave, process.env.JWT_SECRET || "your_secret_key");
            return res.redirect('/'); // Chuyển hướng nếu JWT hợp lệ
        } catch (error) {
            // JWT không hợp lệ, xóa cookie và cho phép tiếp tục
            res.clearCookie('userSave');
            return next();
        }
    } else {
        return next(); // Không có cookie, tiếp tục
    }
};

router.post('/findUser', authController.findUser)
router.get('/register', redirectIfLoggedIn, authController.register)
router.post('/register', redirectIfLoggedIn, authController.submitRegister)
router.get('/login', middleware.checkAuth, authController.login)
router.post('/login', middleware.checkAuth, authController.submitLogin)
router.get('/logout', middleware.checkUnAuth, authController.logout)
router.get('/forgot', authController.forgotPassword)
router.post('/forgot', authController.forgotPasswordPost)
router.post('/reset', authController.resetPassword)
// router.get('/resetAuth', authController.resetPasswordAuth)

router.post('/changePass', middleware.isLoggedIn, authController.changePassPost);

module.exports = router