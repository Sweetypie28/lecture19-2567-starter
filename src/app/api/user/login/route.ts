import { DB, readDB } from "@lib/DB";
import { NextRequest, NextResponse } from "next/server";
import sleep from "sleep-promise";
import { Database } from "@lib/types";

import jwt from "jsonwebtoken";

//POST https://localhost:3000/api/user/login
export const POST = async (request:NextRequest) => {
  const body = await request.json();
  const { username, password } = body;

  //you should do the validation here
  readDB();
  const user = (<Database>DB).users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) { //หาข้อมูลคนที่ login ไม่เจอ
    return NextResponse.json(
      {
        ok: false,
        message: "Username or password is incorrect",
      },
      { status: 400 }
    );
  }

  const secret = process.env.JWT_SECRET || "This is another secret"

  //if found user, sign a JWT TOKEN
  const token = jwt.sign(
    { username, role: user.role, studentId: user.studentId }, //จพใส่ข้อมูลอะไรลงไปใน token บ้าง
    secret, //string ที่เป็นความลับ ผู้สร้างมองเห็นเท่านั้น
    { expiresIn: "8h" }
  );

  await sleep(1000); //จำลองการทำงานเมื่อทำงานบนอินเตอร์เน็ต

  return NextResponse.json({ ok: true, token, username }); //token จะส่งทั้ง token และ username กลับไป
};
