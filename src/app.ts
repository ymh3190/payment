import "dotenv/config";
import express from "express";
import path from "path";
import fetch from "node-fetch";
import morgan from "morgan";
import os from "os";
import fs from "fs";
const app = express();

app.use(morgan("tiny"));
app.use(express.static(path.resolve(__dirname, "public")));
app.use("/static", express.static("static"));
app.use("/dist", express.static("dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/payment/ready", async (req, res) => {
  const config = {
    cid: "TC0ONETIME",
    partner_order_id: "123",
    partner_user_id: "1",
    item_name: "sample",
    quantity: "1",
    total_amount: "1000",
    tax_free_amount: "100",
    approval_url: `http://localhost:${process.env.PORT}/payment/approve`,
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
    tid /* next_redirect_app_url,
      next_redirect_mobile_url,
      android_app_scheme,
      ios_app_scheme, */,
  } = await response.json();

  let writeStream: fs.WriteStream;
  try {
    writeStream = fs.createWriteStream("./payment.txt", {
      encoding: "utf-8",
      flags: "w",
    });
    writeStream.write(`tid=${tid}`);
  } catch (err) {
    console.log(err);
  } finally {
    writeStream.end();
  }

  if (os.platform() === "darwin") {
    res.redirect(next_redirect_pc_url);
  }
});

app.get("/payment/approve", async (req, res) => {
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
