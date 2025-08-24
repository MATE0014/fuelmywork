import crypto from "crypto"

// Generate a 6-digit OTP
export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString()
}

// Hash OTP for secure storage
export function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex")
}

// Verify OTP
export function verifyOTP(inputOTP, hashedOTP) {
  const inputHash = crypto.createHash("sha256").update(inputOTP).digest("hex")
  return inputHash === hashedOTP
}

// Generate expiry time (10 minutes from now)
export function generateOTPExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
}

// Check if OTP is expired
export function isOTPExpired(expiryTime) {
  return new Date() > new Date(expiryTime)
}
