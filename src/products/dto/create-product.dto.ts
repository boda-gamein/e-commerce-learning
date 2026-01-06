import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Milk' })
  name: string;

  @ApiProperty({ example: 12.5 })
  price: number;

  @ApiProperty({ example: 20 })
  stockQuantity: number;

  @ApiProperty({ example: '3a6c3e3f-1111-2222-3333-444444444444' })
  categoryId: string;
}