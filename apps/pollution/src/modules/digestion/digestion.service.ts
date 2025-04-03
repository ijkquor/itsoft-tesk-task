import { DigestionUploadDto } from '@libs/dtos';
import { ExcelToDigetsionMapping } from '@libs/mappings';
import { AirQualityModel, AirQualityRepository } from '@libs/mongo';
import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { OptionalId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class DigestionService {
  private readonly logger = new Logger(DigestionService.name);

  constructor(private readonly airQualityRepository: AirQualityRepository) {}

  async upload(file: Express.Multer.File) {
    const { mimetype, buffer } = file;

    this.logger.log(`Upload progress: 0 %`);

    if (mimetype === 'application/json') {
      const rawData = JSON.parse(buffer.toString()) as DigestionUploadDto[];

      for (let i = 0; i < rawData.length; i++) {
        const data = rawData[i];

        await this.airQualityRepository.create(
          data as OptionalId<AirQualityModel>,
        );

        if (i % 100 === 0) {
          this.logger.log(
            `Upload progress: ${((i / rawData.length) * 100).toFixed(2)} %`,
          );
        }
      }
    }

    if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      const book = await new ExcelJS.Workbook().xlsx.read(
        Readable.from(file.buffer),
      );

      const sheet = book.getWorksheet(1) as ExcelJS.Worksheet;

      const rows = sheet.getRows(2, sheet.rowCount - 1) || [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const mapped = ExcelToDigetsionMapping(row);

        await this.airQualityRepository.create(
          mapped as OptionalId<AirQualityModel>,
        );

        if (i % 100 === 0) {
          this.logger.log(
            `Upload progress: ${((i / rows.length) * 100).toFixed(2)} %`,
          );
        }
      }

      this.logger.log(`Upload progress: 100 %`);

      return {
        message: 'Uploaded successfully',
      };
    }
  }
}
