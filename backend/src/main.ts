import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import cookieParser = require('cookie-parser')
import csurf = require('csurf')
import { Request, Response, NextFunction } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 🟢 Bật CORS cho frontend (Nuxt)
  app.enableCors({
    origin: 'http://localhost:3000', // đổi nếu frontend ở host khác
    credentials: true, // rất quan trọng để cookie gửi/nhận được
  })

  // parse cookie trước (bắt buộc)
  app.use(cookieParser())

  // 🛡️ CSRF protection (dùng cookie để lưu token)
  // Lưu ý: secure: true chỉ dùng khi HTTPS (production)
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'lax', // hoặc 'strict' nếu muốn chặt hơn
        secure: process.env.NODE_ENV === 'production',
        // maxAge: 3600 * 1000, // tùy chọn
      },
    }),
  )

  // Bắt lỗi csurf (EBADCSRFTOKEN) để trả response rõ ràng
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err && err.code === 'EBADCSRFTOKEN') {
      // token không hợp lệ / thiếu - trả 403
      return res.status(403).json({ statusCode: 403, message: 'Invalid CSRF token' })
    }
    return next(err)
  })

  // 🟡 Bật Global ValidationPipe cho toàn project
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // chỉ chấp nhận field có trong DTO
      forbidNonWhitelisted: true, // từ chối nếu có field lạ
      transform: true, // tự động convert kiểu (string -> number, v.v.)
    }),
  )

  await app.listen(3001)
  console.log('🚀 Backend is running on http://localhost:3001')
}

bootstrap()
