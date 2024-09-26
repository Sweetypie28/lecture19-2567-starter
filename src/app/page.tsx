"use client"; // หน้านี้จะแสดงผลในฝั่ง client (ที่ผู้ใช้เห็น)
import { Course } from "@lib/types";
import {
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  // เก็บสถานะของ courses ทั้งหมด
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // เก็บสถานะสำหรับการ login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(""); // ถ้ามี token แสดงว่า login สำเร็จแล้ว
  const [authenUsername, setAuthenUsername] = useState(""); // เก็บ username ที่ api return กลับมา

  // เก็บสถานะสำหรับ myCourses (รายวิชาที่ลงทะเบียน)
  const [myCourses, setMyCourses] = useState<Course[] | null>(null);

  // ฟังก์ชันเพื่อโหลด courses ทั้งหมด
  const loadCourses = async () => {
    setLoadingCourses(true); // แสดงจุดๆ เวลาที่กำลังโหลดข้อมูล

    // call API เพื่อดึงข้อมูล courses
    const resp = await axios.get("/api/courses");
    // ในกรณีที่ API กับ frontend อยู่ในโปรเจคเดียวกันใช้ "/api/courses" ได้เลย
    // ถ้าไม่ได้อยู่โปรเจคเดียวกันให้เขียนเป็น URL เต็ม เช่น http://localhost:3000/api/courses

    setCourses(resp.data.courses); // เก็บข้อมูล courses ที่ได้จาก API ใน state
    setLoadingCourses(false); // ซ่อนจุดๆ เมื่อโหลดเสร็จ
  };

  // ฟังก์ชันเพื่อโหลด myCourses (วิชาที่ผู้ใช้ลงทะเบียน)
  const loadMyCourses = async () => {
    const resp = await axios.get("/api/enrollments", {
      headers: {
        // ส่ง token ไปใน headers เพื่อยืนยันตัวตน
        Authorization: `Bearer ${token}`,
      },
    });

    setMyCourses(resp.data.courses); // เก็บข้อมูล courses ที่ผู้ใช้ลงทะเบียนใน state
  };

  // โหลด courses เมื่อ app เริ่มทำงานครั้งแรก
  useEffect(() => {
    loadCourses();

    // อ่าน token และ username ที่เก็บใน localStorage
    const token = localStorage.getItem("token");
    const authenUsername = localStorage.getItem("authenUsername");
    if (token && authenUsername) {
      setToken(token);
      setAuthenUsername(authenUsername);
    }
  }, []); // [] ทำให้ useEffect ทำงานแค่ครั้งแรกที่โหลด component

  // โหลด myCourses เมื่อ token เปลี่ยน (เช่นหลังจาก login สำเร็จ)
  useEffect(() => {
    if (!token) return; // ถ้าไม่มี token ไม่ต้องทำอะไร

    loadMyCourses();
  }, [token]); // ทำงานเมื่อ token เปลี่ยน

  // ฟังก์ชันสำหรับการ login
  const login = async () => {
    try {
      // ส่งข้อมูล login ไปยัง API
      const resp = await axios.post("/api/user/login", {
        username,
        password,
      });

      // เก็บ token และ authenUsername ที่ได้จาก API
      setToken(resp.data.token);
      setAuthenUsername(resp.data.username);

      // เคลียร์ฟอร์ม login
      setUsername("");
      setPassword("");

      // เก็บ token และ authenUsername ใน localStorage
      localStorage.setItem("token", resp.data.token);
      localStorage.setItem("authenUsername", resp.data.username);
    } catch (error) {
      if (error.response?.data) {
        // แสดงข้อความ error ที่มาจาก API
        alert(error.response.data.message);
      } else {
        // แสดง error อื่นๆ
        alert(error.message);
      }
    }
  };

  // ฟังก์ชันสำหรับการ logout
  const logout = () => {
    setAuthenUsername(""); // เคลียร์ข้อมูล username
    setToken(""); // เคลียร์ token

    // ลบข้อมูล token และ authenUsername ออกจาก localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("authenUsername");
  };

  return (
    <Container size="sm">
      <Title fs="italic" ta="center" my="xs">
        Course Enrollments
      </Title>
      <Stack>
        {/* ส่วนแสดง courses ทั้งหมด */}
        <Paper withBorder p="md">
          <Title order={4}>All courses</Title>

          {loadingCourses && <Loader type="dots" />} {/* แสดง loader เมื่อกำลังโหลดข้อมูล */}

          {/* แสดง courses ทั้งหมด */}
          {courses &&
            courses.map((course: Course) => (
              <Text key={course.courseNo}>
                {course.courseNo} - {course.title}
              </Text>
            ))}
        </Paper>

        {/* ส่วนสำหรับ login */}
        <Paper withBorder p="md">
          <Title order={4}>Login</Title>

          {/* แสดงฟอร์ม login ถ้ายังไม่ได้ login */}
          {!authenUsername && (
            <Group align="flex-end">
              <TextInput
                label="Username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
              <TextInput
                label="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <Button onClick={login}>Login</Button>
            </Group>
          )}

          {/* แสดงปุ่ม logout ถ้า login สำเร็จ */}
          {authenUsername && (
            <Group>
              <Text fw="bold">Hi {authenUsername}!</Text> {/* แสดง username */}
              <Button color="red" onClick={logout}>
                Logout
              </Button>
            </Group>
          )}
        </Paper>

        {/* ส่วนแสดง myCourses */}
        <Paper withBorder p="md">
          <Title order={4}>My courses</Title>

          {/* ถ้ายังไม่ได้ login */}
          {!authenUsername && (
            <Text c="dimmed">Please login to see your course(s)</Text>
          )}

          {/* ถ้า login แล้วและมี myCourses */}
          {authenUsername &&
            myCourses &&
            myCourses.map((course) => (
              <Text key={course.courseNo}>
                {course.courseNo} - {course.title}
              </Text>
            ))}
        </Paper>
      </Stack>
    </Container>
  );
}
