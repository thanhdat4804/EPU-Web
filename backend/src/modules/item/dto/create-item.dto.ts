import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator'

export class CreateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên vật phẩm không được để trống' })
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsNumber()
  @Min(0.01, { message: 'Giá khởi điểm phải lớn hơn 0' })
  startingPrice: number

  @IsOptional()
  @IsNumber()
  reservePrice?: number

  @IsOptional()
  @IsNumber()
  estimateMin?: number

  @IsOptional()
  @IsNumber()
  estimateMax?: number

  @IsOptional()
  @IsNumber()
  categoryId?: number
}
