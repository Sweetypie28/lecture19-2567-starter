import { DB, readDB } from "@lib/DB";
import { NextRequest, NextResponse } from "next/server";
import sleep from "sleep-promise";
import { Database } from "@lib/types";

import jwt from "jsonwebtoken";

//POST https://localhost:3000/api/user/login
export const POST = async (request: NextRequest) => {
  // อ่านข้อมูล body จาก request
  const body = await request.json();
  const { username, password } = body;

  // ควรมีการตรวจสอบข้อมูล validation ที่นี่
  readDB();
  // ค้นหาผู้ใช้ที่มี username และ password ตรงกัน
  const user = (<Database>DB).users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) { // หากไม่พบข้อมูลผู้ใช้ที่ตรงกัน
    return NextResponse.json(
      {
        ok: false,
        message: "Username or password is incorrect",
      },
      { status: 400 }
    );
  }

  // สร้าง secret key สำหรับ JWT
  const secret = process.env.JWT_SECRET || "This is another secret";

  // หากพบผู้ใช้ ให้สร้าง JWT token
  const token = jwt.sign(
    { username, role: user.role, studentId: user.studentId }, // ข้อมูลที่ใส่ใน token
    secret, // string ที่เป็นความลับ ผู้สร้าง token เท่านั้นที่รู้
    { expiresIn: "8h" } // กำหนดเวลาให้ token หมดอายุใน 8 ชั่วโมง
  );

  await sleep(1000); // จำลองการทำงานที่ใช้เวลาเมื่อเชื่อมต่ออินเทอร์เน็ต

  // ส่ง response พร้อม token และ username กลับไปยัง client
  return NextResponse.json({ ok: true, token, username });
};
