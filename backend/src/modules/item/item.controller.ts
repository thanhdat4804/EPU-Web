import { Controller, Get, Param, ParseIntPipe, Query,Post, Body } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto'
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  // ✅ Lấy tất cả Item
  @Get()
  async getAll() {
    return this.itemService.getAllItems();
  }

  // ✅ Lấy chi tiết Item theo ID
  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.getItemDetail(id);
  }
  // ✅ Tìm Item theo tên
   @Get('search/by-name')
  searchByName(@Query('name') name: string) {
    return this.itemService.searchItemByName(name);
  }
  @Post()
  create(@Body() dto: CreateItemDto) {
    return this.itemService.create(dto)
  }
  @Get()
  findAll() {
    return this.itemService.findAll()
  }
}
