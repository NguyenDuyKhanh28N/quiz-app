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


# Cấu trúc cho "thêm câu hỏi cực dễ"

Mục tiêu của bạn = **thêm câu hỏi không cần đụng code**. Nguyên tắc:

> **Mỗi bài = 1 file riêng. Thư mục `data/` là nơi duy nhất bạn làm việc. Code không bao giờ sửa.**

---

## Cấu trúc thư mục khuyến nghị

```
quiz/
├── index.html
├── assets/
│   ├── style.css
│   └── app.js              ← logic (không đụng tới nữa)
└── data/
    ├── manifest.json       ← danh sách tên file bài
    └── quizzes/
        ├── html-co-ban.json
        ├── js-nhap-mon.json
        └── css-flexbox.json
```

**Điểm mấu chốt:** `manifest.json` chỉ là **mảng tên file**. Không chứa nội dung câu hỏi.

```json
[
  "html-co-ban.json",
  "js-nhap-mon.json",
  "css-flexbox.json"
]
```

---

## Mỗi file quiz trông như thế này

`data/quizzes/html-co-ban.json`:

```json
{
  "title": "HTML cơ bản",
  "description": "Ôn tập các khái niệm nền tảng",
  "questions": [
    {
      "q": "HTML là viết tắt của gì?",
      "options": [
        "HyperText Markup Language",
        "HighText Machine Language",
        "HyperTool Multi Language",
        "Home Tool Markup Language"
      ],
      "answer": 0,
      "explain": "HTML = HyperText Markup Language."
    },
    {
      "q": "Thẻ nào dùng để tạo liên kết?",
      "options": ["<link>", "<a>", "<href>", "<url>"],
      "answer": 1
    }
  ]
}
```

- `title`, `description` → hiện ở trang chủ.
- `questions` → mỗi object là 1 câu.
- `answer` = index (0 = A, 1 = B...).
- `explain` tuỳ chọn.
- Số đáp án không giới hạn (2, 3, 4, 5... template tự nhãn A/B/C/D...).

---

## Quy trình thao tác (đây là phần quan trọng)

### ✅ Thêm 1 câu hỏi mới — **1 bước**

Mở file quiz đang có (VD `html-co-ban.json`), thêm 1 object vào cuối mảng `questions`:

```json
{
  "q": "Câu hỏi mới?",
  "options": ["A", "B", "C", "D"],
  "answer": 2,
  "explain": "Giải thích..."
}
```

**Xong.** Không đụng manifest, không đụng code.

### ✅ Thêm 1 bài mới — **2 bước**

1. Tạo file `data/quizzes/ten-bai.json` (copy 1 file cũ làm mẫu, sửa nội dung).
2. Mở `data/manifest.json`, thêm `"ten-bai.json"` vào mảng.

**Xong.** Refresh trang, bài mới xuất hiện.

### ✅ Sửa / xoá câu hỏi — **1 bước**

- Sửa: mở file quiz, sửa trực tiếp.
- Xoá: xoá object khỏi mảng `questions`.
- Xoá cả bài: xoá file + xoá tên trong manifest.

### ✅ Đổi thứ tự bài trên trang chủ — **1 bước**

Sắp xếp lại mảng trong `manifest.json`. (Bài hiện theo đúng thứ tự mảng.)

---

## Code load — viết 1 lần, không sửa nữa

Thay phần `QUIZZES` cố định trong `app.js` bằng:

```js
let QUIZZES = [];

async function loadQuizzes() {
  const files = await fetch('data/manifest.json').then(r => r.json());
  QUIZZES = await Promise.all(
    files.map(name => fetch(`data/quizzes/${name}`).then(r => r.json()))
  );
}

// Khởi động
loadQuizzes().then(render);
```

Toàn bộ `render`, `startQuiz`, `selectAnswer`... giữ nguyên như trước — vì mỗi phần tử trong `QUIZZES` vẫn có `title`, `questions`... đúng shape cũ.

---

## Bonus 1: Thêm bộ validate (rất nên có)

Khi có nhiều file, gõ sai 1 chỗ là cả trang trắng. Thêm hàm kiểm tra:

```js
function validateQuiz(quiz, filename) {
  if (!quiz.title) throw new Error(`${filename}: thiếu "title"`);
  if (!Array.isArray(quiz.questions) || !quiz.questions.length)
    throw new Error(`${filename}: "questions" rỗng hoặc không phải mảng`);
  quiz.questions.forEach((q, i) => {
    const pos = `${filename} — câu ${i + 1}`;
    if (!q.q) throw new Error(`${pos}: thiếu "q"`);
    if (!Array.isArray(q.options) || q.options.length < 2)
      throw new Error(`${pos}: cần ít nhất 2 "options"`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      throw new Error(`${pos}: "answer" phải là 0..${q.options.length - 1}`);
  });
}

async function loadQuizzes() {
  const files = await fetch('data/manifest.json').then(r => r.json());
  QUIZZES = await Promise.all(files.map(async name => {
    const quiz = await fetch(`data/quizzes/${name}`).then(r => r.json());
    validateQuiz(quiz, name);
    return quiz;
  }));
}
```

Bây giờ nếu bạn gõ sai, console sẽ báo chính xác **file nào, câu mấy, lỗi gì** — cực nhanh sửa.

---

## Bonus 2: Nếu bạn không muốn sửa JSON tay

Với người không quen JSON, **Google Sheets là giải pháp siêu dễ**:

### Cách 1: Xuất tay

Bảng tính:

| title | q | a | b | c | d | correct | explain |
|---|---|---|---|---|---|---|---|
| HTML cơ bản | HTML viết tắt? | HyperText... | HighText... | HyperTool... | Home Tool... | A | Giải thích |
| HTML cơ bản | Thẻ tạo link? | `<link>` | `<a>` | `<href>` | `<url>` | B | |

Xuất CSV → 1 script nhỏ convert sang JSON → thả vào `data/quizzes/`. Không cần sửa code.

### Cách 2: Publish Sheet thành JSON (không cần server)

- Google Sheets → **File → Share → Publish to web → CSV**.
- Dùng dịch vụ như **opensheet.elk.sh** hoặc **SheetDB** để lấy JSON trực tiếp.
- `app.js` chỉ cần `fetch` URL đó, parse thành cấu trúc quiz — không đụng file nào nữa.

Ưu điểm: **thêm câu = gõ vào Sheet, không cần deploy gì cả**. Nhược điểm: phụ thuộc dịch vụ ngoài.

---

## Bonus 3: Tự sinh manifest (nếu lười sửa tay)

Nếu bạn dùng Node (hoặc VSCode + task runner), viết 1 script nhỏ **quét thư mục** và tự ghi `manifest.json`:

```js
// scripts/gen-manifest.js
const fs = require('fs');
const files = fs.readdirSync('data/quizzes')
  .filter(f => f.endsWith('.json'))
  .sort();
fs.writeFileSync('data/manifest.json', JSON.stringify(files, null, 2));
console.log(`Đã cập nhật manifest: ${files.length} bài`);
```

Chạy `node scripts/gen-manifest.js` sau khi thêm file → **chỉ cần 1 bước** (tạo file quiz, chạy script). Hoặc cài watcher để tự chạy khi có file mới.

---

## Tóm tắt độ "dễ" theo từng cách

| Cách | Thêm câu | Thêm bài | Phù hợp |
|---|---|---|---|
| **Manifest thủ công** | 1 bước | 2 bước | ⭐⭐⭐⭐ Khuyến nghị |
| **Manifest tự sinh** | 1 bước | 1 bước + chạy script | ⭐⭐⭐⭐⭐ Nếu dùng Node |
| **Google Sheets** | Gõ Sheet | Gõ Sheet | ⭐⭐⭐⭐⭐ Không rành code |
| **1 file JSON khổng lồ** | 1 bước | 1 bước | ⭐⭐⭐ File sẽ phình to |

**Đề xuất của mình:** dùng **manifest thủ công** (đơn giản nhất, không cần build) — khi số bài vượt ~20 thì chuyển sang **script tự sinh manifest**, và nếu có người không rành kỹ thuật cùng nhập liệu thì thêm **Google Sheets** làm phương án phụ.

Cấu trúc này đáp ứng đúng câu bạn nói: *"chỉ cần đưa lên các bài, đổi các câu hỏi"* — nghĩa là bạn chỉ làm việc trong `data/quizzes/`, phần còn lại đã cố định.
