# ThiepCuoi · Clean Pages

Đây là bản **clean-room static** dùng riêng cho `tronghoan1991/ThiepCuoi`, được tạo để chạy trên GitHub Pages mà không cần PHP, database, tunnel hay máy tính bật 24/7.

## Nguyên tắc an toàn

- Không PHP / CodeIgniter / SQLite.
- Không `eval`, mã hóa/obfuscation hoặc code tự giải mã.
- Không Cloudflare Tunnel, `cloudflared`, `jagame.vn`, `api.jagame.vn`, `thiep.site`.
- Không analytics, tracker, cookie, `localStorage` hay beacon.
- Không `fetch`, XHR, WebSocket. CSP đặt `connect-src 'none'`.
- Không iframe bên thứ ba. Link bản đồ chỉ mở sau khi khách chủ động bấm.
- Tên khách trong `?guest=` chỉ được hiển thị bằng `textContent`, không gửi đi đâu.

## Cá nhân hóa

Sửa duy nhất `assets/config.js`:

- `brideName`, `groomName`
- `eventDate`, `dateText`, `timeText`
- `venueName`, `venueAddress`
- `mapUrl` nếu muốn nút bản đồ
- `rsvpPhone` / `rsvpEmail` nếu muốn liên hệ xác nhận
- `gallery` để trỏ tới ảnh nằm trong repo

Không commit mật khẩu, token, CCCD hoặc dữ liệu bí mật vì GitHub Pages trên gói Free thường dùng repository public.

### Link mời theo tên khách

Ví dụ:

`https://tronghoan1991.github.io/ThiepCuoi/?guest=Nguyen%20Van%20A`

Tên chỉ được đọc cục bộ trong trình duyệt.

## Bật GitHub Pages

Vào **Settings → Pages → Build and deployment → Deploy from a branch**, chọn:

- Branch: `clean-pages`
- Folder: `/ (root)`

Sau khi GitHub xuất bản, địa chỉ dự kiến là:

`https://tronghoan1991.github.io/ThiepCuoi/`

## Lưu ý chức năng

Bản này cố ý không có admin, form lưu RSVP, upload ảnh khách hoặc database. Các tính năng đó đòi hỏi backend và làm tăng bề mặt rò rỉ dữ liệu. RSVP mặc định dùng `tel:`/`mailto:` và chỉ hoạt động nếu anh cấu hình.

Xem `SECURITY_AUDIT.md` để biết vì sao không tái sử dụng backend của nhánh `main`.
