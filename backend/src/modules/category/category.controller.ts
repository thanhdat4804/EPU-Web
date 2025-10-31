import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // ✅ Lấy tất cả Category
  @Get()
  async getAll() {
    return this.categoryService.getAllCategories();
  }

  // ✅ Lấy chi tiết Category theo ID
  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getCategoryDetail(id);
  }

   // 🟢 Lấy tất cả auctions theo category
  @Get(':id/auctions')
  async getAuctionsByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getAuctionsByCategory(id);
  }
}
