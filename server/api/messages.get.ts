// server/api/messages.get.ts
import { messages } from '../utils/store'

export default defineEventHandler(async (event) => {
  return messages
})