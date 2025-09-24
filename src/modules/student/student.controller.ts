import { Controller, Get } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('students')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get()
  async getStudents() {
    return this.studentService.getAllStudents();
  }
}
