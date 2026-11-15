"use client"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

// The code tile (content from app/preview/input-otp): six boxes, 481729 filled in.
export function InputOTPDemo() {
  return (
    <InputOTP maxLength={6} defaultValue="481729" aria-label="Verification code">
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
