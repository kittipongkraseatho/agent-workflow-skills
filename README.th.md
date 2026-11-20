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
- รัน `npx skills@1.9.0 add` เพื่อติดตั้ง skill จาก repo GitHub ของคนอื่น โดยล็อกแต่ละตัวไว้ที่ commit ที่แน่นอน

skill นี้ไม่ขอสิทธิ์ sudo ไม่แก้ไฟล์นอก repo และไม่เรียกเครือข่ายเอง ส่วน hook อ่านแค่ `CLAUDE.md` กับ `skills-lock.json`

**ทำไมเครื่องมือตรวจความปลอดภัยถึงเตือน**

ผลตรวจของ Snyk บน skills.sh ให้ระดับ medium จากสามข้อ ทั้งสามข้อมาจากหน้าที่ของ skill นี้เอง จึงไม่มีทางหายไป ด้านล่างคือความหมายของแต่ละข้อและสิ่งที่จำกัดความเสี่ยงไว้

1. **W011 เนื้อหาจากบุคคลอื่น** skill คือชุดคำสั่งที่ agent จะทำตาม skill ที่ไม่ดีจึงเป็นความเสี่ยงจริง ก่อนเสนอ skill ใด AI จะอ่าน `SKILL.md` และ script ของมันที่ commit ที่จะติดตั้ง รวมถึง skill ใน catalog ด้วย และแจ้งถ้าเจอคำสั่งที่ดึง URL รันโค้ดที่ดาวน์โหลดมา ขอ secret หรือสั่งให้ข้าม `CLAUDE.md` คุณจะเห็นรายการพร้อม commit และไม่มีอะไรถูกติดตั้งจนกว่าคุณจะยืนยัน
2. **W012 dependency ภายนอก** skill มาจาก repo GitHub ที่ skill นี้ควบคุมไม่ได้ แต่ละตัวถูกติดตั้งที่ commit เต็มที่ถูกอ่านแล้ว (`owner/repo@<sha>`) ไม่ใช่สถานะล่าสุดของ repo และตัวติดตั้งเองก็ล็อกไว้ที่ `skills@1.9.0` `skills-lock.json` บันทึก commit และ hash ของแต่ละ skill และ `verify.mjs` จะ fail ถ้า skill ที่มาจาก git ไม่มี commit
3. **W013 การแก้ระบบ** skill นี้เพิ่ม hook ใน `.claude/settings.json` ที่รัน `node .claude/hooks/skill-reminder.mjs` ทุกครั้งที่สั่งงาน hook ส่งตาราง Skills จาก `CLAUDE.md` ให้ agent ดังนั้นใครแก้ `CLAUDE.md` ได้ก็เปลี่ยนสิ่งที่ agent ได้รับได้ hook จึงตัด HTML, markdown และอักขระล่องหนออก ตัดข้อความที่ยาวเกิน อ่านไม่เกิน 40 แถว และเอ่ยชื่อ skill เฉพาะตัวที่ติดตั้งอยู่ใน repo จริง และไม่แตะอะไรนอก repo

**สิ่งที่คุณยังต้องทำเอง**

- อ่านรายการ skill และข้อสังเกตของ AI ก่อนกดยืนยัน
- review การแก้ตาราง Skills ใน `CLAUDE.md` เหมือน review โค้ด เพราะ hook ตัดสินความหมายของคำธรรมดาไม่ได้
- review การอัปเดต skill (`npx skills@1.9.0 update`) ทีละไฟล์ก่อน commit

เจอปัญหา เปิด issue ที่ repo นี้ได้

## License

[MIT](LICENSE)
