# ATELIER

ATELIER là website thương mại điện tử thời trang cao cấp với phong cách editorial, tối giản và sang trọng. Dự án kết hợp storytelling thương hiệu, khám phá bộ sưu tập, sản phẩm, wishlist, bag, checkout mô phỏng, account và editorial content trong một trải nghiệm static dễ triển khai.

## Công nghệ

| Lớp | Công nghệ |
|---|---|
| Markup | HTML5 semantic pages |
| Styling | CSS3, design tokens, responsive media queries |
| Interaction | Vanilla JavaScript ES modules |
| Tooling | Vite cho dev server và production build tùy chọn |
| Icons | Inline SVG và Iconify |
| Fonts | Inter và Playfair Display |
| Deployment | GitHub Pages hoặc static hosting |

## Cấu trúc thư mục

```text
Atelier/
├── *.html                    # Các entry page của website
├── assets/
│   ├── css/
│   │   ├── tokens.css        # Design tokens
│   │   ├── site.css          # Visual system và layout hiện hữu
│   │   └── a11y.css          # Skip link, focus-visible, reduced motion
│   ├── js/
│   │   ├── main.js           # Entry module duy nhất cho các trang
│   │   └── modules/           # Navigation, shop, cart, detail và page modules
│   └── data/
│       └── products.json     # Dataset sản phẩm
├── src/
│   └── ui-feedback.js        # File canonical được workflow feedback đồng bộ
├── public/                   # Favicon và public SVG assets
├── scripts/
│   └── qa-static.mjs         # Kiểm tra HTML, metadata, alt và button type
├── docs/                     # Tài liệu BA và case study
├── robots.txt
├── sitemap.xml
└── package.json
```

`src/ui-feedback.js` được giữ lại có chủ đích vì workflow `.github/workflows/sync-ui-feedback.yml` đồng bộ file này từ repository canonical. Đây không phải là một nguồn JavaScript thứ hai của website; entry runtime nằm trong `assets/js/`.

## Chạy local

Cách khuyến nghị là dùng Vite:

```bash
git clone https://github.com/Ngh1aa/Atelier.git
cd Atelier
npm install
npm run dev
```

Mở địa chỉ local mà Vite hiển thị, thường là <http://localhost:5173>.

Vì toàn bộ entry pages vẫn là HTML static ở root, project cũng có thể được phục vụ bởi bất kỳ static server nào:

```bash
python3 -m http.server 4173
```

## Build và preview

```bash
npm run build
npm run preview
```

Vite sẽ biên dịch các ES module trong `assets/js/` thành asset production trong `dist/`. Đây là lựa chọn phù hợp khi muốn tối ưu bundle hoặc kiểm tra production output; không phải yêu cầu bắt buộc để chạy website static trên GitHub Pages.

## Kiểm tra chất lượng

```bash
npm run qa
```

QA kiểm tra `lang`, `title`, `meta description`, `viewport`, `main` landmark, `alt` của hình ảnh và `type` của button trên toàn bộ HTML page. `assets/css/a11y.css` bổ sung skip link, focus-visible và hỗ trợ reduced motion, trong khi giữ nguyên style mặc định của giao diện.

## Kiến trúc JavaScript

`assets/js/main.js` là entrypoint duy nhất. Module này khởi tạo `app.js`, UI feedback và các tương tác visual dùng chung. `app.js` khởi tạo navigation rồi lazy-load module theo pathname, chẳng hạn `shop.js`, `detail.js`, `cart.js`, `favourite.js` và `precommerce-checkout.js`. Cách tổ chức này giữ được ưu điểm của static site nhưng tránh một file JavaScript nguyên khối.

## SEO và accessibility

Mỗi page có `lang`, title, description, canonical URL, viewport và theme color. Các button không gây submit ngoài ý muốn đều có `type="button"`; hình ảnh decorative có `alt=""` và icon được ẩn khỏi screen reader khi phù hợp. Các page chính có `main` landmark, skip link và trạng thái focus rõ ràng.

## Deploy GitHub Pages

Có thể deploy trực tiếp branch chứa các file HTML ở root vì project đã là static website. Nếu deploy bản production đã build bằng Vite, cần publish nội dung của `dist/` thay vì publish source chưa build. Với GitHub Pages dạng project site, cần đặt base path tương ứng nếu dùng asset path tuyệt đối.

## Nguyên tắc bảo toàn giao diện

Branch refactor chỉ thay đổi cách sắp xếp file, đường dẫn asset/module, metadata và lớp hỗ trợ accessibility. Palette, typography, spacing, breakpoint, animation, nội dung và interaction flow hiện hữu được giữ nguyên.

## Vai trò dự án

Dự án được phát triển cho portfolio **Business Analyst & UI/UX Designer**, tập trung vào brand experience, information architecture, product discovery và front-end implementation.

## License

Dự án phục vụ mục đích portfolio và học tập cá nhân.
