import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger, BadRequestException, ValidationError } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import { Request, Response, NextFunction } from 'express'
import * as express from 'express'
import { AppModule } from './app.module'
import * as multer from 'multer'
// ========================================
// CẤU HÌNH MÔI TRƯỜNG (.env)
// ========================================
const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const IS_PRODUCTION = NODE_ENV === 'production'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: IS_PRODUCTION ? ['error', 'warn'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  const logger = new Logger('Bootstrap')

  // ========================================
  // 1. CORS – Cho phép frontend Nuxt
  // ========================================
  app.enableCors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  })

  // ========================================
  // 2. Cookie Parser – Bắt buộc trước CSRF
  // ========================================
  app.use(cookieParser())

  // ========================================
  // 3. CSRF Protection – Dùng cookie lưu token
  // ========================================
  const csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_PRODUCTION,
      maxAge: 3600, // 1 giờ
      path: '/',
    },
  })

  // Bỏ qua CSRF cho route upload file
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/auction/create') && req.method === 'POST') {
      return next() // Bỏ qua CSRF cho upload
    }
    return csrfProtection(req, res, next)
  })

  // ========================================
  // 4. Xử lý lỗi CSRF – Trả JSON rõ ràng
  // ========================================
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err?.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        statusCode: 403,
        message: 'CSRF token không hợp lệ hoặc bị thiếu',
        error: 'Forbidden',
        timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        path: req.path,
      })
    }
    next(err)
  })

  // ========================================
  // 5. Global Validation Pipe
  // ========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const result: Record<string, string[]> = {}

        errors.forEach((err) => {
          const field = err.property
          const constraints = err.constraints

          if (constraints && typeof constraints === 'object') {
            result[field] = Object.values(constraints)
          }
        })

        return new BadRequestException(result)
      },
    }),
  )

  // ========================================
  // 7. Khởi chạy server
  // ========================================
  await app.listen(PORT, '0.0.0.0')

  // ========================================
  // 8. Log khởi động – Đẹp & rõ ràng
  // ========================================
  logger.log('────────────────────────────────────────')
  logger.log(`Backend đang chạy tại: http://localhost:${PORT}`)
  logger.log(`Môi trường: ${NODE_ENV.toUpperCase()}`)
  logger.log(`Frontend: ${FRONTEND_URL}`)
  logger.log(`Upload limit: 50MB`)
  logger.log(`CSRF: ${IS_PRODUCTION ? 'HTTPS + secure cookie' : 'HTTP + dev mode'}`)
  logger.log(`CORS: ${FRONTEND_URL}`)
  logger.log('────────────────────────────────────────')
}

bootstrap().catch((err) => {
  console.error('Lỗi khởi động ứng dụng:', err)
  process.exit(1)
})