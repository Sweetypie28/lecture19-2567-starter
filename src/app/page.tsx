//ถ้าฝั่ง front end ต้องส่ง api ด้วย
"use client"; //เป็นหน้าที่แสดงให้ผู้ใช้เห็น
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
  //All courses state
  const [courses, setCourses] = useState<Course[]|null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);

  //login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(""); //ถ้ามี token แสดงว่า login สำเร็จแล้ว
  const [authenUsername, setAuthenUsername] = useState(""); //username ที่ api return กลับมา

  //my courses state
  const [myCourses, setMyCourses] = useState<Course[]|null>(null);

  const loadCourses = async () => {
    setLoadingCourses(true); //แสดงจุดๆ เวลาโหลด
    
    const resp = await axios.get("/api/courses"); //call ไปยัง api
    //จะเขียน /api/courses เมื่อ api กับ front อยู่ในโปรเจคเดียวกันเท่านั้น ถ้าไม่ได้อยู่ให้เขียน http://localhost:3000/api/courses
    //console.log(resp.data.courses); //resp is response
    setCourses(resp.data.courses); //เป็น async กับ await(ซึ่งจะเขียน await ได้ ต้องเขียนภายใต้ async เท่านั้น)
    
    setLoadingCourses(false); //ซ่อนจุดๆ
  };

  const loadMyCourses = async () => {
    const resp = await axios.get("/api/enrollments",{
      headers: { //headers เป็น object
        Authorization: `Bearer ${token}`
      }
    });
    //console.log(resp.data);
    setMyCourses(resp.data.courses);
  };

  // load courses when app starts the first time (จะ run เมื่อ app กดเริ่ม)
  useEffect(() => {
    loadCourses();

    //read token and authen username from localStorage
    const token = localStorage.getItem('token');
    const authenUsername = localStorage.getItem('authenUsername');
    if(token && authenUsername){
      setToken(token);
      setAuthenUsername(authenUsername);
    }
  }, []); //[] จะทำงานเฉพาะโหลดครั้งแรก

  // load my courses when the "token" is changed (logged in successfully)
  // also load my courses when app starts the first time
  useEffect(() => {
    if (!token) return; //ถ้าไม่มี token ให้ return เลย

    loadMyCourses();
  }, [token]);

  const login = async () => {
    try {
      const resp = await axios.post("/api/user/login", 
        {
          username,
          password
        }
        );
        //console.log(resp.data);

      // set token and authenUsername here
      setToken(resp.data.token);
      setAuthenUsername(resp.data.username);
      // clear login form
      setUsername("");
      setPassword("");

      //set token and authen Username to localStorage
      localStorage.setItem("token", resp.data.token);
      localStorage.setItem("authenUsername", resp.data.username);

    } catch (error) {
      if (error.response.data)
        // show error message from API response
        alert(error.response.data.message); //alert = เตือน (ฝั่ง api)
      else
        // show other error messages
        alert(error.message);
    }
  };

  const logout = () => {
    // set necessary state variables after logged out
    setAuthenUsername(""); //ถ้ามีค่าเป็นว่างเปล่าแล้ว ให้แสดงหน้าแบบ login เหมือนเดิม
    setToken("");

    // remove token and authenUsername from localStorage เมื่่อกด logout ข้อมูลใน localStorage จะหายไป
    localStorage.removeItem("token");
    localStorage.removeItem("authenUsername");
  };

  return ( //front end
    <Container size="sm">
      <Title fs="italic" ta="center" my="xs">
        Course Enrollments
      </Title>
      <Stack>
        {/* all courses section */}
        <Paper withBorder p="md">
          <Title order={4}>All courses</Title>

          { loadingCourses && (<Loader type="dots"/>) }

          {/*<Loader type="dots" />*/} {/*variant เวลาโหลดจะขึ้นเป็นวงกลมหมุนๆ ถ้า type จะเป็นจุดๆ แทน*/}
          {courses &&
            courses.map((course:Course) => (
              <Text key={course.courseNo}>
                {course.courseNo} - {course.title}
              </Text>
            ))}
        </Paper>

        {/* log in section */}
        <Paper withBorder p="md">
          <Title order={4}>Login</Title>
          
          {/* show login form if not logged in */}
          { !authenUsername && (
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
        ) }          

          {/* show log out option if logged in successfully */}
          { authenUsername && 
          (<Group>
            <Text fw="bold">Hi {authenUsername}!</Text> {/*authenUsername ถูก set ไว้ในฟังก์ชัน login*/}
            <Button color="red" onClick={logout}>
              Logout
            </Button>
          </Group>
        ) }
                    
        </Paper>

        {/* enrollment section */}
        <Paper withBorder p="md">
          <Title order={4}>My courses</Title>

          {/*ถ้ายังไม่ได้ login*/}
          { !authenUsername && (<Text c="dimmed">Please login to see your course(s)</Text>) }
          
          { authenUsername && myCourses &&
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
