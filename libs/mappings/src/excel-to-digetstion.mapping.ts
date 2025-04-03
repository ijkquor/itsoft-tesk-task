import { DigestionUploadDto } from '@libs/dtos';
import { Row } from 'exceljs';

export function ExcelToDigetsionMapping(row: Row): DigestionUploadDto {
  return {
    datetime: row.getCell(1).text,
    parameter: row.getCell(2).text,
    value: Number(row.getCell(3).text),
    location: row.getCell(4).text,
    longitude: Number(row.getCell(5).text),
    latitude: Number(row.getCell(6).text),
  };
}
