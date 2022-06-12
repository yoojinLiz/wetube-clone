import "dotenv/config"; // .env 파일의 변수를 process.env 안에 넣어주기
import "./db"; //db 연결 
import "./models/Video"; //db에서 모델을 import 해서 compile
import "./models/User";
import "./models/Comment";

import app from "./server";
const PORT = 4000;

const handlelistener = () => console.log(`✅ Server is listening on port http://localhost:${PORT}'`);
app.listen(PORT, handlelistener); //서버가 시작되면 자동으로 callback 실행 