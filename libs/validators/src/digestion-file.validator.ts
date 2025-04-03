import { DigestionUploadDto } from '@libs/dtos';
import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Request } from 'express';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';
import { validateOrReject, ValidationError } from 'class-validator';
import { ExcelToDigetsionMapping } from '@libs/mappings';

interface FileValidationOptions {
  maxSize?: number;
}

export const AllowedMimeTypesForDigestion = [
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const IsValidFileForDigestion = createParamDecorator(
  async (data: FileValidationOptions, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const file = request.file as Express.Multer.File;

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const { mimetype, size } = file;

    if (!AllowedMimeTypesForDigestion.includes(mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types are: ${AllowedMimeTypesForDigestion.join(', ')}`,
      );
    }

    if (mimetype === 'application/json') {
      const rawData = JSON.parse(file.buffer.toString()) as object;

      if (!Array.isArray(rawData)) {
        throw new BadRequestException('Invalid JSON file');
      }

      if (rawData.length === 0) {
        throw new BadRequestException('Invalid JSON file');
      }

      try {
        for (const entry of rawData) {
          await validateOrReject(plainToClass(DigestionUploadDto, entry));
        }
      } catch (_error) {
        const error = _error as ValidationError[];

        throw new BadRequestException(
          `Invalid JSON file: ${error
            .map(
              (e) =>
                e.property +
                ', ' +
                Object.values(e.constraints || {}).join(', '),
            )
            .join(', ')}`,
        );
      }
    }

    if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      const book = await new ExcelJS.Workbook().xlsx.read(
        Readable.from(file.buffer),
      );

      const sheet = book.getWorksheet(1);

      if (!sheet) {
        throw new BadRequestException('Invalid Excel file');
      }

      const rows = sheet.getRows(2, sheet.rowCount - 1) || [];

      if (rows.length === 0) {
        throw new BadRequestException('Invalid Excel file');
      }

      try {
        for (const row of rows) {
          const mapped = ExcelToDigetsionMapping(row);

          await validateOrReject(plainToClass(DigestionUploadDto, mapped));
        }
      } catch (_error) {
        const error = _error as ValidationError[];

        throw new BadRequestException(
          `Invalid Excel file: ${error
            .map(
              (e) =>
                e.property +
                ', ' +
                Object.values(e.constraints || {}).join(', '),
            )
            .join(', ')}`,
        );
      }

      return file;
    }

    if (data.maxSize && size > data.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${data.maxSize / (1024 * 1024)}MB`,
      );
    }

    return file;
  },
);
