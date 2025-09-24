import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StudentModule } from './modules/student/student.module';

@Module({
  imports: [PrismaModule, StudentModule],
})
export class AppModule {}
