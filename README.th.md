# agent-workflow-skills
[![skills.sh](https://skills.sh/b/kittipongkraseatho/agent-workflow-skills)](https://skills.sh/kittipongkraseatho/agent-workflow-skills)

[English](README.md) · **ไทย**

Skill สำหรับ AI coding agent (Claude Code และ Codex) ตอนนี้มี 1 ตัว: **`agentic-setup`**

## agentic-setup ทำอะไร

สั่งครั้งเดียว AI จะตั้งค่า repo ของคุณให้ agent ทุกตัวทำงานแบบเดียวกัน:

1. **อ่านกฎจากไฟล์เดียว** คือ `CLAUDE.md`
2. **โหลด skill ที่ตรงกับงานก่อนแตะโค้ด** เพราะมี hook คอยเตือนทุกครั้งที่สั่งงาน
3. **ทำงานตามขั้นตอนเดียวกัน** ตั้งแต่รับงานจนเปิด PR โดยมีคนอนุมัติในจุดสำคัญ

## วิธีใช้

**1. ติดตั้ง skill** (ต้องมี Node.js):

```bash
npx skills add kittipongkraseatho/agent-workflow-skills --skill agentic-setup -g
```

`-g` คือติดตั้งระดับเครื่อง ใช้ได้กับทุก repo

**2. เปิด Claude Code ใน repo นั้น แล้วพิมพ์:**

```text
ตั้งค่า agentic setup ให้ repo นี้
```

**3. ตอบคำถามสั้นๆ** ที่ AI อ่านจากโค้ดเองไม่ได้ เช่น กฎที่ห้ามละเมิด, PR เข้า branch ไหน แล้วกดยืนยันรายการ skill ที่จะติดตั้ง

**4. Review แล้ว merge PR** ที่ AI เปิดให้

## สิ่งที่ได้ใน repo

| ไฟล์ | หน้าที่ |
|---|---|
| `CLAUDE.md` | กฎทั้งหมดของ repo และตารางว่างานแบบไหนใช้ skill ตัวไหน |
| `AGENTS.md` | ชี้ให้ Codex และ agent อื่นไปอ่าน `CLAUDE.md` (ไม่มีกฎซ้ำ) |
| `.claude/hooks/skill-reminder.mjs` | hook ที่อ่านตาราง skill จาก `CLAUDE.md` มาเตือน AI ทุกครั้งที่สั่งงาน |
| `.claude/skills/` และ `.agents/skills/` | skill ชุดเดียวกันสำหรับ Claude Code และ Codex |
| `skills-lock.json` | ล็อกเวอร์ชันของ skill ทุกคนในทีมได้ชุดเดียวกัน |
| `docs/agents/` | กติกาของแต่ละขั้นในการส่งมอบงาน (เลือกติดตั้งได้) |

## หลังติดตั้ง AI ทำงานยังไง

```text
คุณสั่งงาน
  → hook เตือนตาราง skill
  → AI อ่านกฎใน CLAUDE.md แล้วโหลด skill ที่ตรงกับงาน
  → คุยให้เข้าใจตรงกัน → เขียน spec → แตกเป็น tickets   (คุณอนุมัติ)
  → เขียนโค้ดแบบ test ก่อน
  → รัน lint + test จนเขียว → AI review โค้ดตัวเอง
  → เปิด PR                                              (คุณ review และ merge)
  → /retro เอาบทเรียนกลับไปปรับกฎ
```

งานเล็กข้ามขั้น spec และ tickets ได้

## ใช้กับ stack ไหนได้

ใช้ได้ทุก stack ขั้นตอนการทำงานไม่ขึ้นกับภาษา ส่วน skill เฉพาะ stack มีรายการที่คัดไว้แล้วสำหรับ NestJS, Nuxt, Vue, Redis และ Go ถ้าเป็น stack อื่น AI จะค้นหาแล้วให้คุณเลือกก่อนติดตั้ง

ทดสอบแล้วกับ monorepo (NestJS + Nuxt) และ service ภาษา Go

## ตรวจว่าตั้งค่าครบ

```bash
node ~/.claude/skills/agentic-setup/scripts/verify.mjs .
```

ผ่านเมื่อบรรทัดสุดท้ายขึ้นว่า checks passed ครบทุกข้อ

## ความปลอดภัย

`agentic-setup` เปลี่ยนวิธีทำงานของ agent ใน repo ของคุณ จึงขอบอกให้ชัดว่ามันทำอะไรบ้าง

**สิ่งที่ทำบนเครื่องของคุณ**

- เขียนไฟล์เฉพาะใน repo: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`, `docs/agents/`, `skills-lock.json`
- เพิ่ม hook หนึ่งตัวใน `.claude/settings.json` ซึ่งรัน script Node ขนาดเล็กทุกครั้งที่สั่งงาน
- รัน `npx skills add` เพื่อติดตั้ง skill จาก repo GitHub ของคนอื่น

skill นี้ไม่ขอสิทธิ์ sudo ไม่แก้ไฟล์นอก repo และไม่เรียกเครือข่ายเอง ส่วน hook อ่านแค่ `CLAUDE.md` กับ `skills-lock.json`

**ทำไมเครื่องมือตรวจความปลอดภัยถึงเตือน**

ผลตรวจบน skills.sh เตือนสองเรื่อง และทั้งสองเรื่องคือหน้าที่ของ skill นี้:

1. **ติดตั้ง skill ของบุคคลอื่น** skill คือชุดคำสั่งที่ agent จะทำตาม skill ที่ไม่ดีจึงเป็นความเสี่ยงจริง AI จะแสดงรายการและรอให้คุณยืนยันก่อนติดตั้ง จะอ่าน skill ที่ไม่รู้จักก่อนเสนอ และ `skills-lock.json` ล็อกสิ่งที่ติดตั้งไว้
2. **เพิ่ม hook ที่รันทุกครั้งที่สั่งงาน** hook ส่งตาราง Skills จาก `CLAUDE.md` ให้ agent ดังนั้นใครแก้ `CLAUDE.md` ได้ก็เปลี่ยนสิ่งที่ agent ได้รับได้ hook จึงตัด HTML, markdown และอักขระล่องหนออก ตัดข้อความที่ยาวเกิน อ่านไม่เกิน 40 แถว และเอ่ยชื่อ skill เฉพาะตัวที่ติดตั้งอยู่ใน repo จริง

**สิ่งที่คุณยังต้องทำเอง**

- อ่านรายการ skill ก่อนกดยืนยัน
- review การแก้ตาราง Skills ใน `CLAUDE.md` เหมือน review โค้ด เพราะ hook ตัดสินความหมายของคำธรรมดาไม่ได้
- review การอัปเดต skill (`npx skills update`) ก่อน commit

เจอปัญหา เปิด issue ที่ repo นี้ได้

## License

[MIT](LICENSE)
