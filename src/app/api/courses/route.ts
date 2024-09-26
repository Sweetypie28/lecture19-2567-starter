import { DB, readDB } from "@lib/DB";
import { Database } from "@lib/types";
import { NextResponse } from "next/server";
import sleep from "sleep-promise";

//GET http://localhost:3000/api/courses
export const GET = async () => {
  // รอ 1 วินาทีเพื่อจำลองการดีเลย์ (ใช้ sleep-promise)
  await sleep(1000);
  
  // เรียกใช้ฟังก์ชันอ่านฐานข้อมูล
  readDB();
  
  return NextResponse.json({ 
    ok: true, 
    // แปลงชนิดข้อมูลของ "DB" เป็นชนิด "Database" และส่งค่ากลับไปยัง API response
    courses: (<Database>DB).courses 
  });
};
