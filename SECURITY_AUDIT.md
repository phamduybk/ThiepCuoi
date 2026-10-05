# Security audit & clean-room decision

Ngày audit: 2026-10-05  
Nguồn đối chiếu: nhánh `main`, commit `6f69b681a82a50ae09faf0a11b350d08516214f6`.

## Kết luận

Không có đủ bằng chứng để khẳng định dự án gốc là malware hoặc cố ý đánh cắp dữ liệu. Tuy nhiên, dự án gốc **không đạt tiêu chuẩn tin cậy cho dữ liệu cá nhân** vì phần lớn logic quan trọng bị che bằng AES/base64/gzip rồi thực thi bằng `eval`, có cơ chế chống Xdebug/kiểm tra tự sửa file, và có luồng dữ liệu thật tới hạ tầng do bên thứ ba kiểm soát.

Vì vậy nhánh này không vá backend gốc. Nó là **clean-room rebuild** chỉ dùng HTML/CSS/JavaScript tĩnh và không tái sử dụng runtime PHP/tunnel của `main`.

## Phát hiện đã xác minh trên bản gốc

### 1. Obfuscation + `eval` — rủi ro cao về khả năng kiểm chứng

Các file đã xác nhận sử dụng mô hình `base64_decode` → `openssl_decrypt(AES-256-CBC)` → `gzuncompress` → `eval`, đồng thời trả 404 khi phát hiện Xdebug gồm ít nhất:

- `application/config/app.php`
- `application/config/database.php`
- `application/controllers/Auth.php`
- `application/controllers/Cli.php`
- `application/controllers/Guest.php`
- `application/controllers/Home.php`
- `application/controllers/Setup.php`
- `application/controllers/admin/Domain.php`
- `application/libraries/Rabitcloud.php`
- `application/libraries/Tunnelrunner.php`

Frontend cũng có JavaScript ghép nhiều chuỗi base64 rồi `atob(...)` + `eval(...)`, ví dụ `assets/js/wedding.js`.

Obfuscation không tự chứng minh mã độc, nhưng ngăn chủ website kiểm toán chính xác logic đang chạy và làm việc phát hiện thay đổi độc hại khó hơn.

### 2. Luồng dữ liệu tới dịch vụ bên thứ ba — đã xác minh

Sau khi giải mã tĩnh `Rabitcloud.php`, client gọi `https://api.jagame.vn` và có các endpoint cho ping, đăng ký/đăng nhập, account và quản lý tunnel.

Dữ liệu có thể gửi tới dịch vụ này gồm:

- email;
- password;
- password confirmation khi đăng ký;
- hostname/label thiết bị;
- hệ điều hành, phiên bản/kiến trúc;
- fingerprint máy (có thể dựa vào `/etc/machine-id`, hostname và thông tin hệ thống);
- port local, tên/secret tunnel và metadata tunnel;
- bearer access token/tunnel token trong các request tiếp theo.

`admin/Domain.php` dùng luồng này để đăng nhập/đăng ký dịch vụ, tạo/start/stop/delete tunnel và lưu trạng thái/tokens của tunnel.

Đây có thể là chức năng hợp lệ của dịch vụ tunnel, nhưng đồng nghĩa thông tin xác thực và metadata máy rời khỏi hệ thống của chủ thiệp. Bản clean loại bỏ hoàn toàn phụ thuộc này.

### 3. Hạ tầng tunnel

Bản gốc có `cloudflared`/cơ chế tunnel và script khởi động PHP local rồi công khai dịch vụ ra Internet. `run_window.bat` có thể tải PHP, VC++ runtime và cloudflared từ các nguồn chính thức nếu thiếu, sau đó chạy CLI tunnel.

Không phát hiện hành vi xấu rõ ràng trong riêng batch script đã đọc; rủi ro chính là việc mở dịch vụ local ra Internet và phụ thuộc logic tunnel bị che giấu.

### 4. Database/uploads tại thời điểm fork

Tại thời điểm audit, thư mục `database` trong Git chỉ có `.gitkeep` và thư mục session; `uploads` chỉ có khung thư mục. Không phát hiện database khách thật hoặc ảnh khách thật đã được commit trong fork tại thời điểm này.

## Bản `clean-pages` loại bỏ gì

Bản clean không chứa:

- PHP, CodeIgniter hoặc database;
- admin/login/server-side auth;
- cloudflared/tunnel/binary thực thi;
- API `jagame.vn`, `thiep.site` hoặc server tác giả;
- mã obfuscated, `eval`, dynamic decrypt/decompress;
- analytics/tracker/cookie/localStorage;
- AJAX/fetch/XHR/WebSocket;
- upload file;
- form gửi dữ liệu nền;
- iframe bên thứ ba.

## Biện pháp phòng vệ trong bản clean

- CSP có `connect-src 'none'` và `form-action 'none'`.
- Referrer policy là `no-referrer`.
- Ảnh gallery chỉ chấp nhận đường dẫn tương đối trong repo.
- `?guest=` được đưa vào DOM bằng `textContent`, không `innerHTML`.
- Link bản đồ chỉ bật với HTTPS và chỉ hoạt động khi người dùng bấm.
- RSVP tùy chọn chỉ dùng `tel:`/`mailto:`.
- Tạo file `.ics` cục bộ bằng `Blob`, không gọi Google Calendar/API.

## Giới hạn và mô hình đe dọa

Không hệ thống nào có thể được bảo đảm an toàn tuyệt đối. Cam kết của nhánh này là phạm vi source hiện tại: không có code chủ động thu thập/gửi dữ liệu nền và không có backend để giữ dữ liệu khách. GitHub Pages/GitHub vẫn là nhà cung cấp hosting và có thể ghi log truy cập hạ tầng theo chính sách của họ; điều đó nằm ngoài source của website.

Nếu về sau thêm analytics, form online, CDN, font ngoài, map iframe, backend, script bên thứ ba hoặc GitHub Action không kiểm soát, cần audit lại.

## Khuyến nghị vận hành

1. Chỉ deploy nhánh `clean-pages`.
2. Không chạy `main` trên máy chứa dữ liệu cá nhân.
3. Không đưa secret/token/password vào repository public.
4. Dùng ảnh đã bỏ metadata vị trí (EXIF GPS) trước khi commit nếu ảnh được chụp bằng điện thoại.
5. Sau mỗi thay đổi, kiểm tra lại rằng HTML/JS không xuất hiện API/tracker mới.
