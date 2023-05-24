import "dotenv/config";
import express from "express";
import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors());

app.use(morgan("dev"));
app.use(express.static(path.resolve(__dirname, "public")));
app.use("/static", express.static("static"));
app.use("/dist", express.static("dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/kakao/payment/ready", async (req, res) => {
  // 결제 api 테스트
  const config = {
    cid: "TC0ONETIME",
    partner_order_id: "123",
    partner_user_id: "1",
    item_name: "sample",
    quantity: "1",
    total_amount: "1000",
    tax_free_amount: "100",
    approval_url: `http://localhost:${process.env.PORT}/kakao/payment/approve`,
    cancel_url: `http://localhost:${process.env.PORT}`,
    fail_url: `http://localhost:${process.env.PORT}`,
  };
  const params = new URLSearchParams(config).toString();
  const response = await fetch(
    `https://kapi.kakao.com/v1/payment/ready?${params}`,
    {
      method: "POST",
      headers: {
        Authorization: `KakaoAK ${process.env.APP_ADMIN_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    }
  );

  const {
    next_redirect_pc_url,
    tid,
    next_redirect_app_url,
    next_redirect_mobile_url,
    android_app_scheme,
    ios_app_scheme,
  } = await response.json();

  let writeStream: fs.WriteStream;
  try {
    writeStream = fs.createWriteStream("./payment.txt", {
      encoding: "utf-8",
      flags: "w",
    });
    writeStream.write(`tid=${tid}`);
    writeStream.end();
  } catch (err) {
    console.log(err);
  }

  if (!req.headers["user-agent"]) {
    throw new Error("none");
  }

  const userAgent = req.headers["user-agent"];
  const isMobile = userAgent.includes("Mobile");
  const isPC = userAgent.includes("Intel") || userAgent.includes("Windows");

  if (isMobile) {
    // client-> (http, method:get) -> server  -> (http, method:post) -> kakaopay server
    res.redirect(next_redirect_mobile_url);
  } else if (isPC) {
    // client -> (js, fetch, method:get) -> server -> (http, method:post) -> kakaopay server
    res.json(next_redirect_pc_url);
  }
});

app.get("/kakao/payment/approve", async (req, res) => {
  const {
    query: { pg_token },
  } = req;

  const file = fs.readFileSync("./payment.txt", "utf-8");

  const config = {
    cid: "TC0ONETIME",
    tid: file.split("=")[1],
    partner_order_id: "123",
    partner_user_id: "1",
    pg_token: `${pg_token}`,
  };
  const params = new URLSearchParams(config).toString();
  const response = await fetch(
    `https://kapi.kakao.com/v1/payment/approve?${params}`,
    {
      method: "POST",
      headers: {
        Authorization: `KakaoAK ${process.env.APP_ADMIN_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    }
  );
  const data = await response.json();
  res.json({ data });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
