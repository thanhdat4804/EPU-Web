// src/modules/blockchain/dto/create-auction.dto.ts
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEthereumAddress,
  Min,
  MinLength,
  IsInt,
  Max,
  IsNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đấu giá không được để trống' })
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  // Giá khởi điểm
  @IsNumber({}, { message: 'Giá khởi điểm phải là số' })
  @Type(() => Number)
  startingPrice: number;

  // Giá sàn
  @IsNumber({}, { message: 'Giá sàn phải là số' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  reservePrice?: number | null;

  // Ước tính
  @IsNumber({}, { message: 'Giá ước tính min phải là số' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  estimateMin?: number | null;

  @IsNumber({}, { message: 'Giá ước tính max phải là số' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  estimateMax?: number | null;

  // Ảnh
  @IsString({ message: 'Ảnh chính phải là tên file' })
  mainImage: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  @IsOptional()
  subImages?: string[];

  // Thể loại (tùy chọn)
  @IsInt({ message: 'ID danh mục phải là số nguyên' })
  @Type(() => Number)
  categoryId?: number;


  // Thời gian đấu giá (giây)
  @IsInt({ message: 'Thời gian đấu giá phải là số nguyên' })
  @Min(30)
  @Max(30 * 24 * 60 * 60)
  @Type(() => Number)
  duration: number;

  // Hợp đồng
  @IsEthereumAddress({ message: 'Địa chỉ hợp đồng không hợp lệ' })
  contractAddress: string;
}