import { DB, readDB, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { Database, Payload } from "@lib/types";
import { NextRequest, NextResponse } from "next/server";
import sleep from "sleep-promise";

//GET http://localhost/3000/api/enrollments
export const GET = async () => {
  // ตรวจสอบ token ของผู้ใช้
  const payload = checkToken();
  if (!payload) {
    // ส่ง response หาก token ไม่ถูกต้อง
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  // แปลงชนิดข้อมูลของ payload เป็น "Payload"
  const { role, studentId } = <Payload>payload;

  // อ่านข้อมูลจากฐานข้อมูล
  readDB();
  if (role === "ADMIN") {
    // หากผู้ใช้เป็น admin ส่งข้อมูล enrollments ทั้งหมด
    return NextResponse.json({
      ok: true,
      enrollments: (<Database>DB).enrollments,
    });
  }

  // ค้นหาหมายเลขวิชาที่ผู้ใช้นักเรียนลงทะเบียน
  const courseNoList = [];
  for (const enroll of (<Database>DB).enrollments) {
    if (enroll.studentId === studentId) {
      courseNoList.push(enroll.courseNo);
    }
  }

  // ค้นหาวิชาตามหมายเลขวิชา
  const courses = [];
  for (const courseNo of courseNoList) {
    const course = (<Database>DB).courses.find((x) => x.courseNo === courseNo);
    courses.push(course);
  }

  // จำลองการหน่วงเวลาในการตอบสนอง
  await sleep(1000);

  // ส่ง response พร้อมข้อมูลวิชาที่ผู้ใช้นักเรียนลงทะเบียน
  return NextResponse.json({
    ok: true,
    courses,
  });
};

//POST http://localhost/3000/api/enrollments
export const POST = async (request: NextRequest) => {
  // ตรวจสอบ token ของผู้ใช้
  const payload = checkToken();
  if (!payload) {
    // ส่ง response หาก token ไม่ถูกต้อง
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  
  // แปลงชนิดข้อมูลของ payload เป็น "Payload"
  const { role, studentId } = <Payload>payload;

  // ตรวจสอบสิทธิ์ หากเป็น admin ไม่อนุญาตให้เข้าถึง API นี้
  if (role === "ADMIN") {
    return NextResponse.json(
      {
        ok: true,
        message: "Only Student can access this API route",
      },
      { status: 403 }
    );
  }

  // อ่านข้อมูล body จาก request
  const body = await request.json();
  const { courseNo } = body;

  // ตรวจสอบความถูกต้องของข้อมูลหมายเลขวิชา
  if (typeof courseNo !== "string" || courseNo.length !== 6) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo must contain 6 characters",
      },
      { status: 400 }
    );
  }

  // อ่านข้อมูลจากฐานข้อมูล
  readDB();
  
  // ตรวจสอบว่ามีวิชานี้อยู่ในระบบหรือไม่
  const foundCourse = (<Database>DB).courses.find((x) => x.courseNo === courseNo);
  if (!foundCourse) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo does not exist",
      },
      { status: 400 }
    );
  }

  // ตรวจสอบว่านักเรียนลงทะเบียนวิชานี้ไปแล้วหรือไม่
  const foundEnroll = (<Database>DB).enrollments.find(
    (x) => x.studentId === studentId && x.courseNo === courseNo
  );
  if (foundEnroll) {
    return NextResponse.json(
      {
        ok: false,
        message: "You already enrolled that course",
      },
      { status: 400 }
    );
  }

  // เพิ่มข้อมูลการลงทะเบียนของนักเรียน
  (<Database>DB).enrollments.push({
    studentId,
    courseNo,
  });
  
  // บันทึกการเปลี่ยนแปลงข้อมูลลงฐานข้อมูล
  writeDB();

  // ส่ง response ยืนยันการลงทะเบียนสำเร็จ
  return NextResponse.json({
    ok: true,
    message: "You has enrolled a course successfully",
  });
};

//DELETE http://localhost/3000/api/enrollments
export const DELETE = async (request: NextRequest) => {
  // ตรวจสอบ token ของผู้ใช้
  const payload = checkToken();
  if (!payload) {
    // ส่ง response หาก token ไม่ถูกต้อง
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  // แปลงชนิดข้อมูลของ payload เป็น "Payload"
  const { role, studentId } = <Payload>payload;

  // ตรวจสอบสิทธิ์ หากเป็น admin ไม่อนุญาตให้เข้าถึง API นี้
  if (role === "ADMIN") {
    return NextResponse.json(
      {
        ok: true,
        message: "Only Student can access this API route",
      },
      { status: 403 }
    );
  }

  // อ่านข้อมูล body จาก request
  const body = await request.json();
  const { courseNo } = body;

  // ตรวจสอบความถูกต้องของข้อมูลหมายเลขวิชา
  if (typeof courseNo !== "string" || courseNo.length !== 6) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo must contain 6 characters",
      },
      { status: 400 }
    );
  }

  // อ่านข้อมูลจากฐานข้อมูล
  readDB();
  
  // ค้นหาว่ามีการลงทะเบียนวิชานี้ของนักเรียนหรือไม่
  const foundIndex = (<Database>DB).enrollments.findIndex(
    (x) => x.studentId === studentId && x.courseNo === courseNo
  );
  if (foundIndex === -1) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "You cannot drop from this course. You have not enrolled it yet!",
      },
      { status: 404 }
    );
  }

  // ลบการลงทะเบียนออกจากฐานข้อมูล
  (<Database>DB).enrollments.splice(foundIndex, 1);
  writeDB();

  // ส่ง response ยืนยันการยกเลิกวิชาสำเร็จ
  return NextResponse.json({
    ok: true,
    message: "You has dropped from this course. See you next semester.",
  });
};
