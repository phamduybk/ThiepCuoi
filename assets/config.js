/*
 * CHỈ CẦN SỬA FILE NÀY để cá nhân hóa thiệp.
 * Không đặt mật khẩu, token, số CCCD hoặc dữ liệu bí mật trong repo public.
 */
window.WEDDING_CONFIG = Object.freeze({
  brideName: "CÔ DÂU",
  groomName: "CHÚ RỂ",
  invitationLine: "Cùng chúng tôi lưu giữ một ngày thật đặc biệt.",

  // ISO 8601, ví dụ: 2026-12-20T11:00:00+07:00. Để trống sẽ ẩn đếm ngược.
  eventDate: "",
  dateText: "NGÀY CƯỚI",
  timeText: "",

  venueName: "ĐỊA ĐIỂM TỔ CHỨC",
  venueAddress: "Cập nhật địa chỉ tại assets/config.js",

  // Link bản đồ chỉ được mở khi khách bấm. Để trống sẽ ẩn nút.
  mapUrl: "",

  // Tùy chọn RSVP an toàn: dùng tel:/mailto:, không có form gửi nền.
  rsvpPhone: "",
  rsvpEmail: "",

  // Ảnh phải nằm trong chính repository.
  gallery: [
    "assets/photo-1.svg",
    "assets/photo-2.svg",
    "assets/photo-3.svg"
  ]
});
