import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DigestionService } from './digestion.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { IsValidFileForDigestion } from '@libs/validators';

@ApiTags('Data Digestion')
@Controller('digestion')
export class DigestionController {
  constructor(private readonly digestionService: DigestionService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload, validate and save air quality data file',
    description:
      'Uploads a file containing air quality measurements. The file can be either in JSON or Excel format. The data will be validated and stored in the database.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'File containing air quality measurements (JSON or Excel)',
          example: 'air-quality-data.json',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File successfully uploaded and processed',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Uploaded successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or content',
  })
  @ApiResponse({
    status: 413,
    description: 'File size exceeds the maximum limit (10MB)',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async upload(
    @IsValidFileForDigestion({
      maxSize: 10 * 1024 * 1024, // 10MB
    })
    file: Express.Multer.File,
  ) {
    return this.digestionService.upload(file);
  }
}
