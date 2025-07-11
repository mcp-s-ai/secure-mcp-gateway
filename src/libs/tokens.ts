import { createHmac } from "crypto"
import { envVars } from "./config.js"

export const signTokens = ({
  userAccessKey,
  token,
}: {
  userAccessKey: string
  token: string
}) => {
  const hmac = createHmac("sha256", envVars.AUTH_SECRET)
  hmac.update(`${userAccessKey}:${token}`)
  const signature = hmac.digest("base64url")

  return encodeURIComponent(
    Buffer.from(JSON.stringify({ userAccessKey, token, signature })).toString(
      "base64",
    ),
  )
}

export const verifyToken = (signedToken: string) => {
  let tokenPayload: { userAccessKey: string; token: string; signature: string }
  try {
    const decodedToken = Buffer.from(signedToken, "base64").toString("utf-8")
    tokenPayload = JSON.parse(decodedToken)
  } catch (error) {
    console.error(error)
    throw new Error("Invalid token format")
  }

  const hmac = createHmac("sha256", envVars.AUTH_SECRET)
  hmac.update(`${tokenPayload.userAccessKey}:${tokenPayload.token}`)
  const expectedSignature = hmac.digest("base64url")

  if (tokenPayload.signature !== expectedSignature) {
    throw new Error("Invalid token signature")
  }

  return tokenPayload
}
