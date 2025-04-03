import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items: T[];

  @ApiProperty({ required: false })
  nextCursor?: string;

  @ApiProperty()
  hasMore: boolean;
}
