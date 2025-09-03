const express = require('express')
const router = express.Router()
const twilio = require('twilio')
require('dotenv').config()

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Temporary OTP store (use DB in production)
const otpStore = {}

router.post('/send-otp', async (req, res) => {
  const { user_id, mobile } = req.body
  if (!user_id || !mobile) return res.status(400).json({ error: 'Missing user_id or mobile' })

  const otp = Math.floor(1000 + Math.random() * 9000)
  otpStore[user_id] = otp

  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile
    })
    res.json({ success: true, message: 'OTP sent to mobile' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

router.post('/verify-otp', (req, res) => {
  const { user_id, otp } = req.body
  if (otpStore[user_id] && otpStore[user_id].toString() === otp) {
    delete otpStore[user_id]
    res.json({ success: true })
  } else {
    res.status(400).json({ error: 'Invalid OTP' })
  }
})

module.exports = router
