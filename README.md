# Quiz App — Trắc nghiệm đơn giản

Trang web làm trắc nghiệm tĩnh — nhẹ, không framework, không build.
Chỉ cần sửa file JSON là có bài mới.

## Cấu trúc

```
.
├── index.html
├── assets/
│   ├── style.css
│   └── app.js
└── data/
    ├── manifest.json
    └── quizzes/
        ├── html-co-ban.json
        └── js-nhap-mon.json
```

## Chạy thử ở máy

> **Quan trọng:** KHÔNG mở trực tiếp `index.html` bằng double-click
> (trình duyệt sẽ chặn `fetch` do CORS). Phải chạy qua local server.

Chọn 1 trong các cách:

```bash
# Python (có sẵn trên macOS/Linux)
python3 -m http.server 8000

# Node
npx serve .

# Hoặc mở bằng VSCode + extension "Live Server"
```

Mở http://localhost:8000

## Thêm 1 câu hỏi mới

1. Mở file quiz đang có, ví dụ `data/quizzes/html-co-ban.json`
2. Thêm 1 object vào cuối mảng `questions`:

```json
{
  "q": "Câu hỏi mới?",
  "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
  "answer": 2,
  "explain": "Giải thích (tuỳ chọn)"
}
```

- `answer` là **index** đáp án đúng (0 = A, 1 = B, ...).
- Bỏ `explain` nếu không cần hiện giải thích.
- Số đáp án không cố định (2, 3, 4, 5, ... đều được).

**Xong.** Refresh trang, câu hỏi mới xuất hiện.

## Thêm 1 bài mới

1. Copy `data/quizzes/html-co-ban.json` thành
   `data/quizzes/ten-bai-moi.json`, sửa nội dung.
2. Mở `data/manifest.json`, thêm tên file vào mảng:

```json
[
  "html-co-ban.json",
  "js-nhap-mon.json",
  "ten-bai-moi.json"
]
```

**Xong.** Bài mới hiện trên trang chủ theo đúng thứ tự trong manifest.

## Sửa / xoá

- **Sửa câu hỏi:** mở file quiz, sửa trực tiếp.
- **Xoá câu:** xoá object khỏi mảng `questions`.
- **Xoá cả bài:** xoá file `.json` và xoá tên trong `manifest.json`.
- **Đổi thứ tự bài:** sắp xếp lại mảng trong `manifest.json`.

## Chia sẻ link tới 1 bài

Mỗi bài có URL riêng: `#/quiz/<tên-file-không-có-.json>`

Ví dụ: `https://your-site.vercel.app/#/quiz/html-co-ban`

## Deploy lên Vercel (khuyến nghị)

1. Đẩy code lên GitHub:

```bash
git init
git add .
git commit -m "init quiz app"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

2. Vào https://vercel.com → **Add New → Project** → chọn repo vừa push.
3. Framework Preset: **Other**. Build Command: để trống.
   Output Directory: để trống (mặc định `.`).
4. Bấm **Deploy**. Xong, có URL dạng `xxx.vercel.app`.

Lần sau chỉ cần `git push` là Vercel tự deploy lại.

## Deploy lên GitHub Pages

1. Đẩy code lên GitHub như trên.
2. Vào **Settings → Pages**.
3. **Source:** Deploy from a branch → chọn `main` / `(root)` → **Save**.
4. Chờ ~1 phút, trang có tại `https://<user>.github.io/<repo>/`.

## Sửa giao diện

- Màu sắc, cỡ chữ, bo góc: file `assets/style.css` (phần `:root` ở đầu).
- Logic: file `assets/app.js`.

## Xử lý sự cố

| Vấn đề | Nguyên nhân | Cách sửa |
|---|---|---|
| Trang trắng | Mở bằng `file://` | Chạy local server |
| "Không tải được dữ liệu" | Sai `manifest.json` / thiếu file | Mở DevTools Console xem lỗi cụ thể |
| Báo lỗi câu X thiếu `answer` | `answer` không phải số, hoặc >= số đáp án | Sửa lại `answer` trong file quiz |
| Sửa JSON mà không thấy đổi | Cache | Ctrl+Shift+R (hard reload) |