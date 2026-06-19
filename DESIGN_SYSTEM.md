# BogiePOS Design System (Apple Design Principles)

เอกสารนี้รวบรวมข้อกำหนดทางด้าน UI/UX และระบบดีไซน์ของ **BogiePOS** เพื่อใช้เป็นแนวทางมาตรฐานในการพัฒนาหน้าเว็บทุกหน้าให้มีความสอดคล้อง สะอาดตา และหรูหราตามแบบฉบับ Apple Design Principles

---

## 1. Palette สีหลัก (Color Palette)

โทนสีที่ใช้ทั้งหมดอ้างอิงจาก Apple Signature Colors เพื่อสร้างความรู้สึก คลีน สบายตา และมีคอนทราสต์ที่พอดี

| ชื่อสีในระบบ | สีจริง (Hex) | คลาส Tailwind | คำอธิบายการใช้งาน |
| :--- | :--- | :--- | :--- |
| **Background** | `#F5F5F7` | `bg-[#F5F5F7]` | สีพื้นหลังหลักของหน้าจอทั้งหมด (ช่วยให้อักษรและกล่องสีขาวดูลอยเด่น) |
| **Foreground / Primary** | `#1D1D1F` | `text-[#1D1D1F]` / `bg-[#1D1D1F]` | สีอักษรหลัก, ปุ่มกดหลัก และองค์ประกอบสำคัญของระบบ |
| **Card / Paper** | `#FFFFFF` | `bg-white` / `bg-card` | สีพื้นหลังของกล่องข้อมูล (Cards), แถบเมนูด้านข้าง (Sidebar) และตาราง |
| **Muted Text** | `#6E6E73` | `text-[#6E6E73]` | สีของอักษรรอง, รายละเอียดเล็กๆ และสัญลักษณ์ที่ไม่มีความสำคัญสูง |
| **Border / UI Line** | `#D2D2D7` | `border-[#D2D2D7]` / `border-border` | สีเส้นขอบตาราง เส้นคั่น และเส้นโครงสร้างของช่องกรอกข้อมูล |
| **Accent / Hover** | `#E8E8ED` | `bg-[#E8E8ED]` | สีพื้นหลังเมื่อวางเมาส์ (Hover), พื้นหลังของ Badge ทั่วไป หรือปุ่มรอง |
| **Destructive / Red** | `#FF3B30` | `text-[#FF3B30]` / `bg-[#FF3B30]` | สีแจ้งเตือน สินค้าหมด ปุ่มลบ หรือส่วนลด |
| **Success / Green** | `#34C759` | `text-[#34C759]` / `bg-[#34C759]` | สีสถานะมีสต็อก สินค้าลดราคา หรือประหยัดเงิน |
| **Warning / Orange** | `#FF9500` | `text-[#FF9500]` / `bg-[#FF9500]` | สีแจ้งเตือนสินค้าใกล้หมดสต็อก |
| **Info / Blue** | `#007AFF` | `text-[#007AFF]` / `bg-[#007AFF]` | สีไฮไลต์ช่องค้นหา, Focus Ring หรือลิงก์สำคัญ |

---

## 2. ระบบตัวอักษร (Typography)

การจัดลำดับข้อมูลด้วยน้ำหนักและขนาดของตัวอักษรที่เหมาะสม

*   **หน้าหลัก / หัวข้อหลัก (Page Title):**
    *   ขนาด: `text-3xl` (30px) | น้ำหนัก: `font-extrabold` | ระยะห่างอักษร: `tracking-tight`
    *   *Tailwind:* `text-3xl font-extrabold tracking-tight text-[#1D1D1F]`
*   **หัวข้อย่อย / หัวข้อการ์ด (Section / Card Title):**
    *   ขนาด: `text-lg` (18px) หรือ `text-sm` (14px) | น้ำหนัก: `font-bold` หรือ `font-semibold`
    *   *Tailwind:* `text-lg font-bold text-[#1D1D1F]` หรือ `text-sm font-semibold`
*   **เนื้อหาทั่วไป (Body Text):**
    *   ขนาด: `text-sm` (14px) | น้ำหนัก: `font-normal` | ระยะบรรทัด: `leading-relaxed`
    *   *Tailwind:* `text-sm font-normal text-[#1D1D1F] leading-relaxed`
*   **ตัวอักษรรอง / คำอธิบาย (Muted / Subtext):**
    *   ขนาด: `text-xs` (12px) หรือ `text-[10px]` | น้ำหนัก: `font-medium`
    *   *Tailwind:* `text-xs font-medium text-[#6E6E73]`
*   **รหัสบาร์โค้ด / รหัสอ้างอิงบิล (Monospace IDs):**
    *   ขนาด: `text-xs` (12px) | ฟอนต์: `font-mono`
    *   *Tailwind:* `font-mono text-xs text-[#6E6E73]`

---

## 3. ระยะห่าง (Spacing & Padding Pattern)

ยึดการใช้พื้นที่ว่าง (Whitespace) ให้เกิดความรู้สึกหรูหรา ไม่อึดอัด

*   **หน้าจอหลัก (Page Container):**
    *   ระยะห่างภายในหน้าจอ: `p-4 sm:p-6 lg:p-8`
    *   ระยะห่างแนวตั้งระหว่างกลุ่มข้อมูล: `space-y-6`
    *   ความกว้างสูงสุด: `max-w-[1400px] mx-auto`
*   **ระยะห่างของแถวในตาราง (Table Padding):**
    *   ระยะห่างภายในเซลล์ข้อมูล: `px-4 py-5`
    *   *Tailwind:* `<td className="px-4 py-5 align-middle">`
*   **ระยะห่างภายในการ์ด (Card Padding):**
    *   ระยะห่างเริ่มต้น: `p-4` หรือ `p-5`
*   **ระยะห่างของปุ่มและช่องกรอก (Button & Input Padding):**
    *   ปุ่มกดมาตรฐาน: `px-4 py-2` (ความสูงคงที่ `h-10` หรือ `h-9` สำหรับขนาดเล็ก)

---

## 4. สไตล์องค์ประกอบการแสดงผล (Component Styles)

### 4.1 ปุ่มกด (Buttons)
*   **ปุ่มหลัก (Primary Button):**
    *   *สไตล์:* พื้นหลังสีชาร์โคล อักษรขาว ขอบโค้งมนสูง ไม่มีเงาหนา
    *   *Tailwind:* `bg-[#1D1D1F] text-white font-semibold rounded-2xl h-10 px-4 hover:opacity-90 active:scale-97 transition-all`
*   **ปุ่มรอง / ขอบเส้น (Secondary / Outline Button):**
    *   *สไตล์:* พื้นสีขาวการ์ด เส้นขอบเทาบาง อักษรดำ
    *   *Tailwind:* `bg-white text-[#1D1D1F] border border-[#D2D2D7] font-semibold rounded-2xl h-10 px-4 hover:bg-[#F5F5F7] active:scale-97 transition-all`
*   **ปุ่มลบ / แจ้งเตือน (Destructive Button):**
    *   *Tailwind:* `bg-[#FF3B30] text-white font-semibold rounded-2xl h-10 px-4 hover:opacity-90 active:scale-97 transition-all`

### 4.2 กล่องข้อมูล (Cards)
*   **กล่องแสดงสินค้า / กล่องเมทริกซ์สรุป:**
    *   *สไตล์:* พื้นขาว เส้นขอบเทาจาง โค้งมนกว้าง และมีเงาอ่อนเป็นพิเศษ เมื่อวางเมาส์จะลอยขึ้นและขยายตัวอย่างนุ่มนวล
    *   *Tailwind:* `bg-white border border-[#D2D2D7]/50 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] will-change-transform transition-all hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]`

### 4.3 ตาราง (Tables)
*   **โครงสร้างตารางหลัก:**
    *   *Tailwind:* `rounded-2xl border border-[#D2D2D7]/50 bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]`
*   **แถวตาราง (Table Rows):**
    *   *Tailwind:* `border-b border-[#D2D2D7]/40 hover:bg-[#F5F5F7]/50 transition-colors`

### 4.4 ช่องกรอกข้อมูล (Inputs / Selects)
*   **กล่องกรอกข้อมูลมาตรฐาน:**
    *   *Tailwind:* `bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl h-10 px-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all`

---

## 5. ความโค้งมนและเงา (Border Radius & Shadow)

*   **ความโค้งมนสูงสุด (Large Elements - Cards/Buttons/Dialogs):**
    *   ใช้โค้ดขอบโค้ง: `rounded-2xl` (16px) หรือ `rounded-3xl` สำหรับกล่องขนาดใหญ่
*   **ความโค้งมนทั่วไป (Medium Elements - Inputs/Badges):**
    *   ใช้โค้ดขอบโค้ง: `rounded-xl` (12px)
*   **ความโค้งมนระดับไมโคร (Pills/Tabs):**
    *   ใช้โค้ดขอบโค้ง: `rounded-full` (เช่น ปุ่มเลือกแท็บประเภทสินค้า)
*   **เงาระบบนุ่มนวล (Soft Shadows):**
    *   เงาพื้นฐาน (Static states): `shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)]`
    *   เงาลอยตัว (Hover / Dialog states): `shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)]`

---

## 6. กฎเหล็กประจำโปรเจกต์ (Core Rules for All Pages)

1.  **ห้ามใช้สีดำสนิท (`#000000`) หรือ สีขาวสว่างจ้าเกินไปบนหน้าจอหลัก** ให้ยึดสีพื้นหลัง `#F5F5F7` และตัวอักษร `#1D1D1F` เสมอ
2.  **ทุก Element ที่คลิกได้ต้องมี Tactile Feedback:** ต้องมี Transition ความยาว `200ms` หรือใกล้เคียง และใช้คลาส `active:scale-97` (ยุบตัวลงเมื่อกดสัมผัส) เพื่อสร้างความสมจริง
3.  **ความสม่ำเสมอของตารางข้อมูล:** คอลัมน์ตารางที่เป็นจำนวนเงิน ส่วนลด หรือปุ่มดำเนินการ (Actions) ต้องชิดขวา (`text-right`) และหัวตารางต้องชิดขวาตามข้อมูลเสมอเพื่อความรวดเร็วในการกวาดสายตาอ่าน
4.  **ห้ามใช้เอฟเฟกต์เบลอบนฉากหลัง Pop-up:** ฉากหลังต้องมืดลงอย่างเรียบง่าย (`rgba(0,0,0,0.5)`) โดยไม่มีการใส่ `backdrop-blur` เพื่อประสิทธิภาพสูงสุดและความเรียบร้อยตามคำแนะนำผู้ใช้
5.  **จัดกึ่งกลางหน้าต่าง Dialog เสมอ:** การเด้งสไลด์ขึ้นของป๊อปอัปจะเคลื่อนไหวในแนวแกน Y ขึ้นมาหาจุดกึ่งกลางของหน้าจอ `transform: translate(-50%, -50%)` โดยไม่มีการเคลื่อนที่ขอบกระตุกแวบเฟดในเฟรมแรก
