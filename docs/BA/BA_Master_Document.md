# Tài Liệu Business Analysis - ATELIER

## 1. Thông Tin Tài Liệu

| Hạng mục | Nội dung |
| --- | --- |
| Tên dự án | ATELIER - Luxury Fashion E-commerce Website |
| Loại tài liệu | Business Analysis Master Document |
| Phiên bản | 1.0 |
| Ngày lập | 25/05/2026 |
| Phạm vi đánh giá | Source code hiện tại trong repository `Atelier` |
| Mục tiêu tài liệu | Tổng hợp bối cảnh, vấn đề thị trường, giải pháp, phạm vi nghiệp vụ, yêu cầu chức năng, luồng người dùng, giá trị kinh doanh và định hướng phát triển cho dự án |

## 2. Tóm Tắt Điều Hành

ATELIER là một website thương mại điện tử thời trang cao cấp theo phong cách tối giản, editorial và monochrome. Dự án tập trung vào trải nghiệm hình ảnh, câu chuyện thương hiệu, hành trình mua sắm tinh gọn và cảm giác sang trọng xuyên suốt từ trang chủ đến trang thanh toán.

Phiên bản hiện tại là một front-end MVP/prototype được xây dựng bằng HTML5, CSS, JavaScript và Vite. Repository đã có các trang chính của một website e-commerce: trang chủ, shop, chi tiết sản phẩm, wishlist, giỏ hàng, checkout, xác nhận đơn hàng, đăng nhập/đăng ký, tài khoản, blog và trang giới thiệu thương hiệu.

Giá trị cốt lõi của ATELIER không chỉ nằm ở việc bán sản phẩm thời trang, mà ở cách biến hành trình mua hàng thành một trải nghiệm thương hiệu cao cấp: ít nhiễu, giàu hình ảnh, có câu chuyện, có cảm giác curated và nhất quán với định vị luxury fashion.

## 3. Lý Do Làm Project

### 3.1. Bối Cảnh Kinh Doanh

Thị trường thời trang trực tuyến ngày càng cạnh tranh, nhưng phần lớn website e-commerce vẫn đang vận hành theo tư duy catalogue: nhiều sản phẩm, nhiều khuyến mãi, nhiều banner và ít cảm xúc thương hiệu. Với phân khúc cao cấp, cách tiếp cận này dễ làm giảm giá trị cảm nhận của sản phẩm.

Khách hàng luxury fashion không chỉ mua một món đồ. Họ mua chất liệu, câu chuyện, hình ảnh cá nhân, sự tin cậy và cảm giác được phục vụ. Vì vậy, một website cho thương hiệu thời trang cao cấp cần làm tốt cả hai vai trò: bán hàng và xây dựng hình ảnh thương hiệu.

### 3.2. Mục Đích Dự Án

ATELIER được xây dựng để tạo một nền tảng trải nghiệm mua sắm thời trang cao cấp có tính thẩm mỹ cao, điều hướng rõ ràng và tập trung vào các điểm chạm quan trọng trong hành trình khách hàng:

- Khám phá thương hiệu qua hero, collection, story và editorial content.
- Xem sản phẩm trong bố cục hình ảnh cao cấp.
- Đánh giá sản phẩm qua hình ảnh, mô tả, chất liệu, size và lợi ích dịch vụ.
- Lưu sản phẩm yêu thích để cân nhắc sau.
- Thêm sản phẩm vào giỏ và đi đến checkout.
- Tạo tài khoản, xem thông tin cá nhân và đơn hàng gần đây.

### 3.3. Tầm Nhìn Sản Phẩm

ATELIER hướng tới một trải nghiệm luxury commerce nơi website không chỉ là kênh bán hàng, mà là không gian số của thương hiệu. Mỗi trang cần góp phần củng cố thông điệp: tối giản, có chủ đích, thủ công, bền vững và sang trọng.

## 4. Vấn Đề Của Các Sản Phẩm Cùng Thị Trường Hiện Nay

### 4.1. Trải Nghiệm Bị Thương Mại Hóa Quá Mức

Nhiều website thời trang sử dụng quá nhiều banner khuyến mãi, pop-up, flash sale và thông tin giảm giá. Cách làm này phù hợp với mass market nhưng dễ phá vỡ cảm giác cao cấp ở phân khúc luxury.

Hệ quả:

- Khách hàng bị phân tâm khỏi sản phẩm.
- Giá trị thương hiệu bị kéo xuống bởi cảm giác bán hàng gấp.
- Hành trình khám phá thiếu cảm xúc và thiếu chiều sâu.

### 4.2. Thiếu Câu Chuyện Thương Hiệu

Các sản phẩm thời trang cao cấp cần được đặt trong ngữ cảnh: nguồn cảm hứng, chất liệu, kỹ thuật, triết lý thiết kế và phong cách sống. Nhiều website chỉ hiển thị ảnh, tên, giá và nút mua, khiến sản phẩm bị biến thành hàng hóa phổ thông.

Hệ quả:

- Khách hàng khó hiểu vì sao sản phẩm có mức giá cao.
- Khó tạo kết nối cảm xúc với thương hiệu.
- Tỷ lệ cân nhắc mua hàng thấp hơn, đặc biệt với sản phẩm giá trị lớn.

### 4.3. Danh Mục Sản Phẩm Dày Nhưng Khó Scan

Một số website có nhiều sản phẩm nhưng bố cục thiếu trật tự, filter không rõ hoặc thông tin bị nhồi nhét. Khách hàng phải tốn nhiều công để tìm sản phẩm phù hợp.

Hệ quả:

- Người dùng mất phương hướng trong catalogue.
- Tỷ lệ rời trang tăng.
- Sản phẩm chủ lực không được làm nổi bật đúng mức.

### 4.4. Trang Chi Tiết Sản Phẩm Chưa Đủ Thuyết Phục

Với thời trang cao cấp, trang chi tiết sản phẩm cần giải quyết các câu hỏi quan trọng: chất liệu là gì, form dáng ra sao, có bền vững không, phối thế nào, vận chuyển thế nào, giá trị khác biệt nằm ở đâu. Nhiều website vẫn chưa khai thác đủ chiều sâu này.

Hệ quả:

- Khách hàng thiếu thông tin để ra quyết định.
- Sản phẩm cao cấp bị nhìn như sản phẩm thông thường.
- Giảm khả năng upsell/cross-sell.

### 4.5. Checkout Thiếu Cảm Giác Tin Cậy

Checkout của nhiều site hoặc quá dài, hoặc thiếu thông tin tổng kết rõ ràng, hoặc không giữ được ngôn ngữ thiết kế của thương hiệu.

Hệ quả:

- Khách hàng dễ bỏ giỏ.
- Người dùng không chắc tổng tiền, thuế, phí vận chuyển.
- Trải nghiệm cao cấp bị đứt đoạn ở bước quan trọng nhất.

### 4.6. Content Và Commerce Bị Tách Rời

Trong luxury fashion, nội dung editorial là một phần của bán hàng. Tuy nhiên, nhiều website tách blog, brand story và shop thành các mảng rời rạc, không hỗ trợ nhau trong hành trình chuyển đổi.

Hệ quả:

- Nội dung không kéo được nhu cầu mua hàng.
- Shop không tận dụng được chiều sâu thương hiệu.
- Khó xây dựng cộng đồng và lòng trung thành.

## 5. ATELIER Đã Giải Quyết Được Những Gì

### 5.1. Tạo Được Hệ Trải Nghiệm Thương Hiệu Nhất Quán

ATELIER sử dụng phong cách monochrome, typography tương phản giữa heading và body, hình ảnh editorial và bố cục thoáng. Điều này giúp website giữ được cảm giác cao cấp từ trang chủ đến các trang chức năng.

Các trang liên quan:

- `index.html`: hero, new-in, featured collections, contact/newsletter.
- `about.html`: câu chuyện thương hiệu, triết lý, quy trình, cam kết.
- `blog.html`: content editorial về style, craft, minimalism và luxury lifestyle.

### 5.2. Chuyển Website Từ Catalogue Thành Trải Nghiệm Curated

Trang shop dùng layout masonry thay vì grid đều đơn giản. Cách trình bày này tạo cảm giác lookbook/editorial, phù hợp với sản phẩm thời trang cao cấp.

Các yếu tố đã có:

- Danh sách sản phẩm có hình ảnh lớn.
- Tên và giá sản phẩm rõ.
- Filter bar ở cấp giao diện: Sort By, Category, Size, Color.
- Pagination để mô phỏng catalogue nhiều trang.

### 5.3. Tăng Sức Thuyết Phục Của Trang Chi Tiết Sản Phẩm

Trang chi tiết sản phẩm đã có nhiều thành phần quan trọng cho quyết định mua:

- Breadcrumb giúp định vị sản phẩm trong catalogue.
- Gallery ảnh chính và thumbnails.
- Tên collection, tên sản phẩm, giá.
- Mô tả chất liệu và giá trị thiết kế.
- Danh sách điểm nổi bật: sourcing bền vững, đường may hoàn thiện thủ công, xuất xứ.
- Chọn size và size guide.
- Nút Add to Cart và Wishlist.
- Thông tin dịch vụ: complimentary shipping, luxe packaging.
- Gợi ý phối đồ qua mục Complete the Look.

### 5.4. Hình Thành Hành Trình Mua Hàng Đầu Cuối

MVP hiện tại đã mô phỏng được hành trình mua hàng cơ bản:

1. Người dùng vào trang chủ.
2. Khám phá sản phẩm mới hoặc collection.
3. Vào shop.
4. Xem chi tiết sản phẩm.
5. Thêm vào wishlist hoặc giỏ hàng.
6. Điều chỉnh giỏ hàng.
7. Điền thông tin checkout.
8. Xem trang xác nhận đơn hàng.
9. Vào account để xem thông tin cá nhân và đơn hàng gần đây.

### 5.5. Đã Có Nền Tảng Cho Retention Và Brand Community

ATELIER đã có các touchpoint giúp giữ chân khách hàng:

- Wishlist.
- Account profile.
- Recent orders.
- Newsletter.
- Blog/editorial content.
- Brand story/about page.

Những thành phần này là nền tảng để phát triển CRM, personalization và loyalty ở các giai đoạn sau.

## 6. Đối Tượng Người Dùng Và Stakeholder

### 6.1. Nhóm Người Dùng Chính

| Nhóm người dùng | Mục tiêu | Nhu cầu chính |
| --- | --- | --- |
| Khách hàng mới | Khám phá thương hiệu và sản phẩm | Cảm nhận nhanh định vị thương hiệu, xem sản phẩm nổi bật, tin vào chất lượng |
| Khách hàng đang cân nhắc | So sánh sản phẩm và quyết định mua | Hình ảnh rõ, mô tả thuyết phục, size, chất liệu, giá, chính sách vận chuyển |
| Khách hàng quay lại | Theo dõi sản phẩm yêu thích và đơn hàng | Wishlist, account, order history, trải nghiệm nhất quán |
| Người yêu thời trang/lifestyle | Tìm cảm hứng và câu chuyện | Blog, brand philosophy, collection story |

### 6.2. Stakeholder Nghiệp Vụ

| Stakeholder | Mối quan tâm |
| --- | --- |
| Founder/Brand Owner | Định vị thương hiệu, doanh thu, cảm nhận cao cấp |
| Marketing Team | Nội dung editorial, collection launch, newsletter, social traffic |
| E-commerce Manager | Catalogue, checkout, conversion, cart abandonment |
| Customer Service | Thông tin size, shipping, returns, support touchpoints |
| Product/Design Team | UI consistency, responsive, visual identity |
| Development Team | Kiến trúc front-end, khả năng mở rộng, tích hợp backend/API |

## 7. Phạm Vi Dự Án Hiện Tại

### 7.1. Trong Phạm Vi MVP Hiện Tại

- Website front-end cho thương hiệu thời trang cao cấp.
- Trang chủ với hero, new-in, collection và newsletter.
- Trang shop hiển thị danh sách sản phẩm.
- Trang chi tiết sản phẩm với gallery, size, wishlist, add to cart và gợi ý sản phẩm.
- Trang wishlist tĩnh.
- Trang cart có tăng/giảm số lượng và xóa sản phẩm ở phía giao diện.
- Trang checkout với form liên hệ, địa chỉ giao hàng, thanh toán và order summary.
- Trang xác nhận đơn hàng.
- Trang đăng nhập/đăng ký và quên mật khẩu ở mức demo UI.
- Trang tài khoản với profile và recent orders.
- Trang blog và about để hỗ trợ thương hiệu.
- Responsive styling qua CSS.

### 7.2. Ngoài Phạm Vi MVP Hiện Tại

Các nội dung sau chưa được triển khai thực tế trong source code hiện tại và nên được xem là đề xuất cho giai đoạn tiếp theo:

- Backend xử lý đăng nhập, đăng ký và phân quyền.
- Cơ sở dữ liệu sản phẩm, người dùng, giỏ hàng, wishlist và đơn hàng.
- Tích hợp thanh toán thật.
- Tính toán thuế, phí vận chuyển, tồn kho theo thời gian thực.
- Filter/sort/search sản phẩm hoạt động bằng dữ liệu thật.
- Quản trị sản phẩm, đơn hàng, content và inventory.
- Email transactional: xác nhận đơn, reset password, newsletter.
- Tracking analytics, conversion funnel và A/B testing.

## 8. Mục Tiêu Kinh Doanh

| Mã | Mục tiêu | Ý nghĩa |
| --- | --- | --- |
| BO-01 | Xây dựng hình ảnh thương hiệu cao cấp | Website phải tạo cảm giác luxury, curated và đáng tin |
| BO-02 | Tăng khả năng khám phá sản phẩm | Người dùng dễ đi từ brand story sang product discovery |
| BO-03 | Giảm ma sát mua hàng | Cart và checkout cần rõ ràng, ngắn gọn, có tổng kết đơn hàng |
| BO-04 | Tăng tỷ lệ quay lại | Wishlist, account và content giúp khách hàng có lý do trở lại |
| BO-05 | Tạo nền tảng mở rộng e-commerce | MVP cần đủ cấu trúc để tích hợp backend/API ở phase sau |

## 9. Yêu Cầu Nghiệp Vụ Cấp Cao

| Mã | Yêu cầu nghiệp vụ | Mức ưu tiên |
| --- | --- | --- |
| BR-01 | Website phải truyền tải định vị luxury fashion ngay từ trang chủ | Must Have |
| BR-02 | Người dùng phải xem được danh sách sản phẩm và thông tin giá | Must Have |
| BR-03 | Người dùng phải xem được chi tiết sản phẩm, hình ảnh, mô tả, size và thông tin dịch vụ | Must Have |
| BR-04 | Người dùng phải có thể lưu sản phẩm vào wishlist ở cấp giao diện | Should Have |
| BR-05 | Người dùng phải có thể xem giỏ hàng, chỉnh số lượng và xóa sản phẩm ở cấp giao diện | Must Have |
| BR-06 | Người dùng phải có thể đi qua luồng checkout và nhận xác nhận đơn hàng ở mức prototype | Must Have |
| BR-07 | Website phải có nội dung thương hiệu và editorial content để hỗ trợ niềm tin | Should Have |
| BR-08 | Website phải responsive trên desktop, tablet và mobile | Must Have |
| BR-09 | Hệ thống phải sẵn sàng cho tích hợp backend trong tương lai | Should Have |

## 10. Yêu Cầu Chức Năng

### 10.1. Navigation Và Layout Chung

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-01 | Người dùng có thể điều hướng giữa Home, About Us, Shop và Blog | Menu xuất hiện nhất quán trên các trang chính |
| FR-02 | Người dùng có thể truy cập Cart, Wishlist và Account từ header | Icon cart, heart và user hiển thị ở header |
| FR-03 | Website có footer với newsletter, client services, company và legal links | Footer xuất hiện nhất quán ở các trang nội dung |

### 10.2. Trang Chủ

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-04 | Hiển thị hero editorial với thông điệp thương hiệu | Hero có headline, CTA Shop Now và hình ảnh thời trang |
| FR-05 | Hiển thị New In products | Có ít nhất 3 sản phẩm mới với hình ảnh, tên và collection |
| FR-06 | Hiển thị Featured Collections | Có khu vực collection nổi bật bằng hình ảnh lớn |
| FR-07 | Thu thập email qua newsletter/contact block ở mức UI | Input email và nút submit hiển thị rõ |

### 10.3. Shop/Product Listing

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-08 | Hiển thị danh sách sản phẩm | Có các product item với ảnh, tên và giá |
| FR-09 | Cung cấp filter/sort ở mức giao diện | Có Sort By, Category, Size, Color |
| FR-10 | Người dùng click sản phẩm để đến trang chi tiết | Product item link đến `detailproduct.html` |
| FR-11 | Có pagination ở mức giao diện | Hiển thị số trang và điều hướng trước/sau |

### 10.4. Chi Tiết Sản Phẩm

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-12 | Hiển thị breadcrumb | Người dùng biết đang ở Shop/Collection/Product |
| FR-13 | Hiển thị gallery sản phẩm | Có ảnh chính và thumbnails có thể click đổi ảnh |
| FR-14 | Hỗ trợ xem màu thật/grayscale | Nút View True Colors thay đổi trạng thái ảnh |
| FR-15 | Hiển thị thông tin sản phẩm | Có collection, tên, giá, mô tả và feature list |
| FR-16 | Cho phép chọn size ở mức UI | Size XS/S/M/L/XL hiển thị, một size active |
| FR-17 | Có CTA mua hàng và wishlist | Có nút Add to Cart và Wishlist |
| FR-18 | Hiển thị thông tin dịch vụ | Có complimentary shipping và luxe packaging |
| FR-19 | Gợi ý sản phẩm phối kèm | Có mục Complete the Look |

### 10.5. Wishlist

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-20 | Hiển thị danh sách sản phẩm yêu thích | Có sản phẩm, collection, giá và hình ảnh |
| FR-21 | Có hành động Remove và Add to Cart ở mức UI | Nút hiển thị trên mỗi item |
| FR-22 | Cho phép quay lại Shop | Có link Continue Shopping |

### 10.6. Cart

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-23 | Hiển thị sản phẩm trong giỏ | Có ảnh, tên, ref, size, số lượng và giá |
| FR-24 | Cho phép tăng/giảm số lượng ở mức UI | Nút plus/minus thay đổi số lượng hiển thị |
| FR-25 | Cho phép xóa item ở mức UI | Nút remove làm item biến mất khỏi DOM |
| FR-26 | Hiển thị order summary | Có subtotal, shipping, total và tax note |
| FR-27 | Điều hướng sang checkout | Nút Proceed to Checkout link sang `checkout.html` |
| FR-28 | Hiển thị gợi ý sản phẩm | Có mục You May Also Like |

### 10.7. Checkout Và Order Success

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-29 | Thu thập thông tin liên hệ | Có email và checkbox nhận tin |
| FR-30 | Thu thập địa chỉ giao hàng | Có tên, địa chỉ, city, state, zip, country và phone |
| FR-31 | Thu thập thông tin thanh toán ở mức UI | Có credit card, card number, expiry và CVV |
| FR-32 | Hiển thị order summary tại checkout | Có item, subtotal, shipping, tax và total |
| FR-33 | Cho phép đặt hàng ở mức prototype | Nút Place Order điều hướng đến order success |
| FR-34 | Hiển thị xác nhận đơn hàng | Có order number, delivery estimate, shipping method, address và order summary |

### 10.8. Authentication Và Account

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-35 | Hiển thị form sign in | Có email, password, remember me, forgot password |
| FR-36 | Hiển thị form create account | Có first name, last name, email, password, confirm password và checkbox đồng ý điều khoản |
| FR-37 | Chuyển tab login/register | Click tab thay đổi form active |
| FR-38 | Hiển thị quên mật khẩu | Có trang reset password và link quay lại sign in |
| FR-39 | Hiển thị profile account | Có avatar, thông tin cá nhân, form profile và recent orders |

### 10.9. Content/Brand Story

| Mã | Mô tả | Tiêu chí chấp nhận |
| --- | --- | --- |
| FR-40 | About page trình bày câu chuyện thương hiệu | Có The House, Our Beginning, The Craft, The Future |
| FR-41 | About page trình bày triết lý và cam kết | Có Philosophy, Process, Commitment |
| FR-42 | Blog page trình bày editorial stories | Có Latest Stories, category filter và post list |

## 11. Yêu Cầu Phi Chức Năng

| Mã | Yêu cầu | Mô tả |
| --- | --- | --- |
| NFR-01 | Visual consistency | Giao diện phải duy trì phong cách monochrome, tối giản và editorial |
| NFR-02 | Responsive design | Layout cần hoạt động tốt trên desktop, tablet và mobile |
| NFR-03 | Performance | Website static/Vite cần tải nhanh, hình ảnh cần được tối ưu ở giai đoạn production |
| NFR-04 | Accessibility | Cần có alt text, focus state, label form và tương phản màu phù hợp |
| NFR-05 | Maintainability | CSS/HTML cần có cấu trúc rõ để dễ tách component hoặc chuyển sang framework sau này |
| NFR-06 | Scalability | Dữ liệu sản phẩm, cart, wishlist và order nên có mô hình để tích hợp API về sau |
| NFR-07 | Trust & Security | Khi triển khai thật cần HTTPS, bảo vệ form, thanh toán qua provider uy tín và không lưu dữ liệu thẻ trực tiếp |

## 12. Luồng Người Dùng Chính

### 12.1. Luồng Khám Phá Và Mua Hàng

1. Người dùng truy cập `index.html`.
2. Người dùng xem hero, New In và Featured Collections.
3. Người dùng click Shop Now hoặc vào `shop.html`.
4. Người dùng scan danh sách sản phẩm.
5. Người dùng chọn một sản phẩm để xem `detailproduct.html`.
6. Người dùng xem ảnh, mô tả, size và gợi ý phối đồ.
7. Người dùng chọn Add to Cart hoặc Wishlist.
8. Người dùng vào `cart.html`.
9. Người dùng điều chỉnh số lượng hoặc xóa item.
10. Người dùng click Proceed to Checkout.
11. Người dùng điền thông tin checkout.
12. Người dùng click Place Order.
13. Người dùng xem `order-success.html`.

### 12.2. Luồng Đăng Nhập/Đăng Ký

1. Người dùng mở dropdown account ở header.
2. Người dùng chọn Sign In hoặc Create Account.
3. Website hiển thị `login.html`.
4. Người dùng chuyển giữa tab Sign In và Create Account.
5. Người dùng nhập thông tin.
6. Ở MVP hiện tại, form chỉ demo bằng alert, chưa xác thực thật.

### 12.3. Luồng Tìm Cảm Hứng Thương Hiệu

1. Người dùng vào `about.html` để đọc về The House, Craft, Process và Commitment.
2. Người dùng vào `blog.html` để đọc editorial stories.
3. Người dùng đăng ký newsletter để nhận thông tin collection và story.
4. Người dùng quay lại Shop khi có nhu cầu mua.

## 13. Use Case Tiêu Biểu

### UC-01: Xem Danh Sách Sản Phẩm

| Thành phần | Nội dung |
| --- | --- |
| Actor | Khách hàng |
| Trigger | Người dùng chọn Shop từ navigation |
| Pre-condition | Website tải thành công |
| Main flow | Mở shop, xem danh sách sản phẩm, scan ảnh/tên/giá, click sản phẩm |
| Post-condition | Người dùng được chuyển sang trang chi tiết sản phẩm |

### UC-02: Xem Chi Tiết Sản Phẩm Và Chọn Size

| Thành phần | Nội dung |
| --- | --- |
| Actor | Khách hàng đang cân nhắc mua |
| Trigger | Người dùng click sản phẩm |
| Pre-condition | Sản phẩm có trang chi tiết |
| Main flow | Xem gallery, đọc mô tả, kiểm tra feature, chọn size, xem shipping, xem Complete the Look |
| Post-condition | Người dùng sẵn sàng Add to Cart hoặc Wishlist |

### UC-03: Quản Lý Giỏ Hàng

| Thành phần | Nội dung |
| --- | --- |
| Actor | Khách hàng |
| Trigger | Người dùng mở cart |
| Pre-condition | Cart có item mẫu |
| Main flow | Xem sản phẩm, tăng/giảm số lượng, xóa item, xem order summary |
| Post-condition | Người dùng tiếp tục mua hoặc sang checkout |

### UC-04: Đặt Hàng Prototype

| Thành phần | Nội dung |
| --- | --- |
| Actor | Khách hàng |
| Trigger | Người dùng click Proceed to Checkout |
| Pre-condition | Có item trong cart |
| Main flow | Điền contact, shipping address, payment, xem tổng đơn, click Place Order |
| Post-condition | Người dùng đến trang xác nhận đơn hàng |

## 14. Mô Hình Dữ Liệu Nghiệp Vụ Đề Xuất

MVP hiện tại đang dùng dữ liệu tĩnh trong HTML. Khi triển khai production, nên chuẩn hóa thành các thực thể sau:

| Entity | Thuộc tính đề xuất |
| --- | --- |
| User | id, firstName, lastName, email, phone, passwordHash, role, createdAt |
| CustomerProfile | userId, defaultAddressId, preferences, newsletterOptIn |
| Product | id, name, slug, collection, category, description, price, currency, status |
| ProductVariant | id, productId, size, color, sku, stockQuantity |
| ProductImage | id, productId, url, alt, sortOrder, type |
| Wishlist | id, userId, createdAt |
| WishlistItem | wishlistId, productId, variantId, addedAt |
| Cart | id, userId/sessionId, status, createdAt, updatedAt |
| CartItem | cartId, productId, variantId, quantity, unitPrice |
| Order | id, userId, orderNumber, status, subtotal, tax, shippingFee, total, createdAt |
| OrderItem | orderId, productId, variantId, quantity, unitPrice |
| Address | id, userId, name, phone, line1, line2, city, state, zip, country |
| Payment | id, orderId, provider, status, transactionId, paidAt |
| Article | id, title, category, excerpt, content, coverImage, publishedAt |
| NewsletterSubscriber | id, email, source, status, createdAt |

## 15. Quy Tắc Nghiệp Vụ Đề Xuất

| Mã | Quy tắc |
| --- | --- |
| R-01 | Sản phẩm chỉ được checkout nếu còn tồn kho |
| R-02 | Một cart item được xác định bởi product, variant size/color và cart |
| R-03 | Số lượng sản phẩm trong cart không được nhỏ hơn 1 |
| R-04 | Wishlist yêu cầu user đăng nhập hoặc cần session tạm nếu chưa đăng nhập |
| R-05 | Checkout phải có email, địa chỉ giao hàng và phương thức thanh toán hợp lệ |
| R-06 | Tax và shipping cần được tính lại ở server trước khi tạo order |
| R-07 | Không lưu số thẻ thanh toán trực tiếp trong hệ thống |
| R-08 | Order number phải duy nhất và dễ tra cứu |
| R-09 | Newsletter cần lưu consent và trạng thái unsubscribe |
| R-10 | Product price hiển thị trên client chỉ là tham khảo, giá cuối cùng phải xác nhận ở backend |

## 16. Ma Trận Trang Và Vai Trò Nghiệp Vụ

| Trang/File | Vai trò nghiệp vụ |
| --- | --- |
| `index.html` | Landing/homepage, tạo ấn tượng thương hiệu, dẫn sang shop và newsletter |
| `shop.html` | Product listing/catalogue |
| `detailproduct.html` | Product detail, thuyết phục mua, hỗ trợ chọn size và cross-sell |
| `favourite.html` | Wishlist/saved items |
| `cart.html` | Cart review, quantity adjustment, order summary |
| `checkout.html` | Checkout form, shipping/payment, final order review |
| `order-success.html` | Order confirmation |
| `login.html` | Sign in/create account UI |
| `forgot-password.html` | Reset password UI |
| `account.html` | Customer profile và recent orders |
| `about.html` | Brand story, philosophy, craft, sustainability |
| `blog.html` | Editorial content, inspiration và brand authority |
| `style.css` | Visual system, layout, responsive và component styling |
| `main.js` | Scroll reveal, navbar behavior, cart quantity/remove interaction |

## 17. Đánh Giá Khoảng Cách Hiện Tại

| Khu vực | Hiện trạng | Khoảng cách cần xử lý |
| --- | --- | --- |
| Product data | Hard-code trong HTML | Cần API/CMS hoặc data source tập trung |
| Cart | UI thay đổi số lượng/xóa item trên DOM | Chưa lưu state, chưa tính lại total động, chưa đồng bộ backend |
| Wishlist | Trang tĩnh | Chưa có add/remove thật và chưa lưu theo user |
| Auth | Form demo alert | Chưa có xác thực, session, reset password thật |
| Checkout | Form prototype | Chưa validate đầy đủ, chưa thanh toán thật, chưa tạo order thật |
| Account | Dữ liệu mẫu | Chưa liên kết user/order thật |
| Filter/sort | UI placeholder | Chưa lọc/sắp xếp sản phẩm thật |
| Content | HTML tĩnh | Cần CMS hoặc admin nếu vận hành lâu dài |
| Analytics | Chưa thấy tracking | Cần event tracking cho funnel, product view, add to cart, checkout |
| SEO | Có title cơ bản | Cần meta description, structured data, Open Graph và URL strategy |

## 18. KPI Đề Xuất

### 18.1. KPI Kinh Doanh

| KPI | Ý nghĩa |
| --- | --- |
| Conversion Rate | Tỷ lệ người dùng hoàn tất mua hàng |
| Add-to-Cart Rate | Tỷ lệ người xem sản phẩm thêm vào giỏ |
| Checkout Completion Rate | Tỷ lệ hoàn tất checkout |
| Average Order Value | Giá trị đơn hàng trung bình |
| Wishlist Save Rate | Tỷ lệ sản phẩm được lưu vào wishlist |
| Returning Visitor Rate | Tỷ lệ khách quay lại |

### 18.2. KPI Trải Nghiệm

| KPI | Ý nghĩa |
| --- | --- |
| Product Detail Engagement | Mức độ tương tác với gallery, size, true color, complete look |
| Cart Abandonment Rate | Tỷ lệ bỏ giỏ |
| Checkout Error Rate | Tỷ lệ lỗi/khó khăn khi nhập form |
| Newsletter Signup Rate | Hiệu quả thu lead |
| Mobile Bounce Rate | Chất lượng trải nghiệm mobile |

### 18.3. KPI Kỹ Thuật

| KPI | Mục tiêu đề xuất |
| --- | --- |
| Largest Contentful Paint | Dưới 2.5s trên kết nối phổ biến |
| Cumulative Layout Shift | Dưới 0.1 |
| JavaScript errors | Gần 0 trên production |
| Image optimization coverage | 100% ảnh production có kích thước/nén phù hợp |
| Accessibility issues critical | 0 lỗi critical |

## 19. Rủi Ro, Giả Định Và Phụ Thuộc

### 19.1. Rủi Ro

| Rủi ro | Tác động | Hướng xử lý |
| --- | --- | --- |
| Dữ liệu hard-code khó mở rộng | Khó quản lý catalogue thật | Tách data layer/API ở phase sau |
| Cart chưa lưu state | Người dùng reload sẽ mất thay đổi | Dùng localStorage tạm hoặc backend cart |
| Checkout chưa thanh toán thật | Không thể bán hàng production | Tích hợp payment provider |
| Ảnh lớn có thể ảnh hưởng performance | Tải trang chậm | Tối ưu ảnh, lazy loading, responsive images |
| Filter/sort chưa hoạt động | Kỳ vọng người dùng không được đáp ứng | Ưu tiên triển khai search/filter thật |
| Auth chỉ là demo | Không có personalization thật | Xây backend auth/session |

### 19.2. Giả Định

- ATELIER đang ở giai đoạn MVP/prototype front-end.
- Mục tiêu trước mắt là thể hiện trải nghiệm, định vị thương hiệu và flow e-commerce.
- Backend, database, payment và admin sẽ được triển khai ở các phase sau nếu sản phẩm đi production.
- Nội dung sản phẩm hiện tại là dữ liệu mẫu để mô phỏng catalogue luxury fashion.

### 19.3. Phụ Thuộc

- Vite để build và preview project.
- Iconify CDN cho icons.
- Bộ ảnh trong `public/assets`.
- Browser hỗ trợ JavaScript hiện đại cho IntersectionObserver và DOM interaction.

## 20. Roadmap Đề Xuất

### Phase 1 - Hoàn Thiện MVP Front-End

- Chuẩn hóa copy bị lỗi encoding ở một số ký tự mũi tên.
- Hoàn thiện responsive QA cho tất cả page.
- Bổ sung trạng thái empty cart, empty wishlist, form errors.
- Tính lại cart total khi tăng/giảm/xóa item.
- Lưu cart/wishlist tạm bằng localStorage.
- Làm filter/sort hoạt động bằng dữ liệu JS tĩnh.

### Phase 2 - E-commerce Foundation

- Thiết kế database/API cho product, user, cart, wishlist và order.
- Tích hợp authentication thật.
- Tích hợp product data động.
- Tích hợp cart/wishlist theo user hoặc session.
- Tạo order thật từ checkout.
- Gửi email xác nhận đơn hàng.

### Phase 3 - Production Commerce

- Tích hợp payment provider.
- Tính thuế, phí vận chuyển và tồn kho.
- Xây admin/CMS cho sản phẩm, collection, article và order.
- Thêm search/filter nâng cao.
- Tối ưu SEO, structured data và analytics.
- Tối ưu hiệu năng ảnh và caching.

### Phase 4 - Growth Và Personalization

- Product recommendation dựa trên hành vi.
- Loyalty/member tier.
- Abandoned cart email.
- Editorial-to-commerce linking.
- A/B testing hero, CTA và checkout.
- Dashboard KPI cho marketing/e-commerce team.

## 21. Tiêu Chí Thành Công Cho Bản Hoàn Chỉnh

Một phiên bản production của ATELIER có thể được xem là thành công khi:

- Người dùng có thể hoàn tất mua hàng thật từ product discovery đến payment.
- Cart, wishlist, account và order history hoạt động dựa trên dữ liệu thật.
- Trải nghiệm thương hiệu vẫn giữ cảm giác luxury, không bị biến thành shop đại trà.
- Mobile experience mượt, hình ảnh tải nhanh và không vỡ layout.
- Checkout rõ ràng, đáng tin và có tỷ lệ hoàn tất tốt.
- Marketing team có thể cập nhật content/collection mà không cần sửa code trực tiếp.
- Dữ liệu analytics đủ để đo conversion funnel và tối ưu tăng trưởng.

## 22. Kết Luận

ATELIER đã xây dựng được nền tảng front-end vững cho một website luxury fashion e-commerce: nhận diện thị giác rõ, câu chuyện thương hiệu có chiều sâu, catalogue có tính editorial, product detail đủ thuyết phục, và hành trình mua hàng được mô phỏng từ khám phá đến xác nhận đơn.

Điểm mạnh lớn nhất của dự án là định vị trải nghiệm. Website không chạy theo mô hình bán hàng ồn ào, mà chọn cảm giác tối giản, sang trọng và có chủ đích. Đây là hướng đi phù hợp với phân khúc thời trang cao cấp, nơi niềm tin và cảm xúc thương hiệu ảnh hưởng mạnh đến quyết định mua.

Để tiến tới production, dự án cần được bổ sung data layer, backend, authentication, payment, quản trị nội dung/sản phẩm và analytics. Tuy nhiên, với vai trò MVP/prototype, ATELIER đã giải quyết tốt bài toán quan trọng nhất: chứng minh được concept thương hiệu, cấu trúc hành trình người dùng và tiềm năng phát triển thành một nền tảng commerce hoàn chỉnh.
