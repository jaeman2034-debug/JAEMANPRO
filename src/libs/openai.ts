import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'test_key',
  dangerouslyAllowBrowser: true, // 브라우저 환경에서 사용 허용
}) 