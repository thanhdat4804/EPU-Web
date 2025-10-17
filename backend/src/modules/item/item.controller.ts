import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ItemService } from './item.service';

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
}
