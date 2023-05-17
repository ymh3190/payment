import "dotenv/config";
import express from "express";
import path from "path";
import fetch from "node-fetch";
import morgan from "morgan";
const app = express();

app.use(morgan("tiny"));
app.use(express.static(path.resolve(__dirname, "public")));
app.use("/static", express.static("static"));
app.use("/dist", express.static("dist"));
app.use(express.json());

const obj = {
  cid: "TC0ONETIME",
  partner_order_id: 123,
  partner_user_id: 1,
  item_name: "sample",
  quantity: 1,
  total_amount: 1000,
  tax_free_amount: 100,
  approval_url: `http://localhost:${process.env.PORT}`,
  cancel_url: `http://localhost:${process.env.PORT}`,
  fail_url: `http://localhost:${process.env.PORT}`,
};
app.get("/payment/ready", async (req, res) => {
  const response = await fetch("http://kapi.kakao.com/v1/payment/ready", {
    method: "post",
    headers: {
      Authorization: `KakaoAK ${process.env.APP_ADMIN_KEY}`,
      "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });
  console.log(await response.json());
  res.status(200).end();
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
