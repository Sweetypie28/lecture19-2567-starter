import { DB, readDB } from "@lib/DB";
import { Database } from "@lib/types";
import { NextResponse } from "next/server";
import sleep from "sleep-promise";

//GET http://localhost:3000/api/courses
export const GET = async () => {
  await sleep(1000);
  readDB();
  return NextResponse.json({ 
    ok: true, 
    // Type casting to "Database"
    courses: (<Database>DB).courses 
  });
};
