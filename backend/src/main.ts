import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 🟢 Bật CORS cho frontend (Nuxt)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
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
