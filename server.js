const express = require("express")
const cors = require("cors")
const axios = require("axios")
const PaytmChecksum = require("paytmchecksum")

const app = express()

app.use(cors())
app.use(express.json())

const MID =
  process.env.PAYTM_MID

const MERCHANT_KEY =
  process.env.PAYTM_KEY

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Paytm Server Running"
  })
})

app.post("/create-paytm-transaction", async (req, res) => {

  try {

    const orderId =
      "NF-" + Date.now()

    const paytmParams = {

      requestType: "Payment",

      mid: MID,

      websiteName: "DEFAULT",

      channelId: "WAP",

      orderId: orderId,

      callbackUrl:
        "https://secure.paytmpayments.com/theia/paytmCallback?ORDER_ID=" + orderId,

      txnAmount: {
        value: req.body.amount.toString(),
        currency: "INR"
      },

      userInfo: {
        custId:
          req.body.mobile || "CUSTOMER001"
      }
    }

    const checksum =
      await PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams),
        MERCHANT_KEY
      )

    const response =
      await axios.post(

        `https://secure.paytmpayments.com/theia/api/v1/initiateTransaction?mid=${MID}&orderId=${orderId}`,

        {
          body: paytmParams,

          head: {
            signature: checksum
          }
        }
      )

    res.json(response.data)

  } catch (err) {

    res.json({
      success: false,
      error: err.message,
      details: err.response?.data
    })
  }
})

app.listen(process.env.PORT || 3000)
