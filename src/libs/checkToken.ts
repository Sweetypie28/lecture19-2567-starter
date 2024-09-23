//ถ้าฝั่ง front end ต้องส่ง api ด้วย
//if token is valid, return payload
//otherwise, return null

import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export function checkToken() {
  const headersData = headers();
  if (!headersData) return null;
  const rawAuthHeader = headersData.get("authorization");
  if (!rawAuthHeader) return null;
  const token = rawAuthHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET || "This is another secret";

  try {
    //return Payload {username, role, studentId}
    return jwt.verify(token, secret); //This is payload
  } catch {
    return null;
  }
}
