# 🎒 TASHRIF

**TASHRIF** — bu ota-onalar, o‘qituvchilar va administratorlar uchun o‘quvchilarning uy-maktab-uy yo‘lini nazorat qilishga mo‘ljallangan Telegram bot va admin panel asosidagi tizim. Loyiha yordamida farzandlarning qayerdaligini real vaqt rejimida kuzatish, ularning holatini belgilash va kerakli vaqtida xabardor bo‘lish mumkin.

---

## 📌 Funktsional imkoniyatlar

### 🧑‍🏫 Admin panel (Vite.js)
- Ota-onalar, o‘qituvchilar, o‘quvchilar, sinflar va holat loglarini boshqarish (CRUD)
- Vizual boshqaruv interfeysi
- Backend bilan to‘liq integratsiya (REST API)

### 🤖 Telegram Botlar
#### ParentBot
- Ota-ona Telegram orqali o‘z farzandlarini tanlaydi
- Holatni belgilaydi: `uyda`, `yo‘lda maktab tomon`, `yo‘lda uy tomon`
- Taxminiy kelish vaqtini kiritadi
- Status “yo‘lda maktab tomon” bo‘lganda administrator guruhiga xabar yuboriladi

#### TeacherBot
- O‘qituvchilar uchun alohida bot
- O‘quvchilarni yaratish, sinflarga biriktirish
- Ularning holatini ko‘rish

---

## ⚙️ Texnologiyalar

| Texnologiya  | Tavsifi |
|--------------|---------|
| **Node.js**  | Backend uchun |
| **Express.js** | REST API |
| **MongoDB + Mongoose** | Ma’lumotlar bazasi |
| **Telegraf.js** | Telegram bot yaratish |
| **Vite.js + React** | Admin panel frontend |
| **Tailwind CSS** | UI uchun |
| **Nodemon** | Dev rejimi |

---

## 📁 Loyihaning tuzilmasi

```

.
├── bots/
│   ├── parentBot.js
│   └── teacherBot.js
├── models/
│   ├── Student.js
│   ├── Parent.js
│   ├── Teacher.js
│   ├── Class.js
│   └── StatusLog.js
├── routes/
│   ├── student.routes.js
│   ├── parent.routes.js
│   ├── teacher.routes.js
│   ├── class.routes.js
│   └── statusLog.routes.js
├── frontend/ (Vite + React app)
├── server.js
├── .env
├── package.json
└── README.md

````

---

## 🚀 Ishga tushirish

### Backend (Node.js)

```bash
git clone https://github.com/UlugbekMirdadayev/stanford-parents-bot-backend.git
cd stanford-parents-bot-backend
npm install
npm run dev
````

`.env` faylga quyidagilarni qo‘shing:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maktabyoli
PARENT_BOT_TOKEN=your_parent_bot_token
TEACHER_BOT_TOKEN=your_teacher_bot_token
ADMIN_CHAT_ID=-100xxxxxxxxxx
```

### Frontend (Vite.js)

```bash
cd frontend
npm install
npm run dev
```

---

## 📲 API Endpointlar

| Route             | Tavsifi            |
| ----------------- | ------------------ |
| `/api/students`   | O‘quvchilar CRUD   |
| `/api/parents`    | Ota-onalar CRUD    |
| `/api/teachers`   | O‘qituvchilar CRUD |
| `/api/classes`    | Sinflar CRUD       |
| `/api/status-log` | Status loglar      |

---

## 🛠 TODO (Keyingi bosqichlar uchun)

* [ ] JWT bilan autentifikatsiya
* [ ] TeacherBot funktsiyalarini kengaytirish
* [ ] Admin panelga login sahifa qo‘shish
* [ ] Mobil versiyasini optimallashtirish
* [ ] Gruppa bo‘yicha statistika

---

## 👨‍💻 Muallif

> Ushbu loyiha **Ulug‘bek Mirdadayev** tomonidan yaratilgan. O‘quvchilarning xavfsizligini nazorat qilishda innovatsion yechim!

---

UFLEX © 2025 - Barcha huquqlar himoyalangan.

---