import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Milk 1L' })
  name?: string;

  @ApiPropertyOptional({ example: 10.99 })
  price?: number;

  @ApiPropertyOptional({ example: 15 })
  stockQuantity?: number;

  @ApiPropertyOptional({ example: '3a6c3e3f-1111-2222-3333-444444444444' })
  categoryId?: string;
}
