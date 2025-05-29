# Team05_TMDT_PRJ
docs: update README with system design and database structure

Link báo cáo: https://docs.google.com/document/d/1ca8PorXvpwHU_I-mHi5hvbbSxZzXld9ADQT6MGZ2ipc/edit?usp=sharing 

## Mục tiêu dự án
- Khuyến nghị và tìm kiếm sản phẩm.
- Quản giỏ hàng
- Quản đơn hàng
- Thanh toán
- Đổi trả/ hoàn tiền.

---

## Công nghệ sử dụng
| Thành phần | Công nghệ |
|------------|-----------|
| Backend    | Node.js, Express |
| Database   | MySQL (XAMPP – `ie104_group2`) |
| Frontend   | EJS Template |
| Session    | express-session |
| Môi trường | `.env` file cấu hình |

---

## Cấu trúc thư mục chính

    src/
    ├── config/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── views/
    ├── public/
    ├── middleware/
    index.js
    .env

---

## Database: ie104_group2

### Các bảng sử dụng:

> ERD

--- 

## API đầu vào/ đầu ra

| Chức năng | Method | Route | Input (req.body / params) | Output |
|-----------|--------|-------|----------------------------|--------|
| Đăng ký   | POST   | /register | `{name, email, password}` | `{message}` |
| Đăng nhập | POST   | /login | `{email, password}` | `{user info}` hoặc `{error}` |
| Xem SP    | GET    | /products | - | `List<Product>` |
| Chi tiết SP | GET | /product/:id | `id` param | `{product}` |
| Thêm giỏ hàng | POST | /cart/add | `{product_id, quantity}` | `{message}` |
| Đặt hàng  | POST   | /order | `{cart}` từ session | `{order_id}` |

---

## Giao diện chính
- Trang chủ
- Đăng ký / Đăng nhập
- Danh sách giỏ hàng
- Lịch sử đơn hàng

---

## Cách chạy project

```bash
git clone https://github.com/your-group/ecommerce-app.git
cd ecommerce-app
npm install
cp .env.example .env   # hoặc tự tạo file .env
npm run dev