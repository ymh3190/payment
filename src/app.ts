import "dotenv/config";
import express from "express";
import path from "path";
import fetch from "node-fetch";
import morgan from "morgan";
import os from "os";
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
    approval_url: `http://localhost:${process.env.PORT}`,
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
  const { next_redirect_pc_url } = await response.json();
  if (os.platform() === "darwin") {
    res.redirect(next_redirect_pc_url);
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
