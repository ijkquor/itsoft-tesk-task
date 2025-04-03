import {
  EventSearchDto,
  EventSearchReportDto,
  EventSearchResponseDto,
} from '@libs/dtos';
import { EventModel } from '@libs/mongo/src/models/event.model';
import { EventRepository } from '@libs/mongo/src/repositories/event.repository';
import { Injectable } from '@nestjs/common';
import { Filter } from 'mongodb';
import * as PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js/auto';

interface DateTimeFilter {
  $gte?: Date;
  $lte?: Date;
}

interface EventFilter extends Filter<EventModel> {
  createdAt?: DateTimeFilter;
}

@Injectable()
export class SearchService {
  private readonly chartJSNodeCanvas: ChartJSNodeCanvas;

  constructor(private readonly eventRepository: EventRepository) {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 600,
      height: 400,
      backgroundColour: 'white',
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
      },
    });
  }

  private async generalSearch(
    {
      ip,
      path,
      method,
      statusCode,
      minExecutionTime,
      maxExecutionTime,
      cursor,
      limit = 10,
      startDate,
      endDate,
    }: Partial<EventSearchDto>,
    isForReport: boolean = false,
  ): Promise<EventModel[]> {
    const filter: EventFilter = {};

    if (ip) filter.ip = ip;
    if (path) filter.path = path;
    if (method) filter.method = method;
    if (statusCode) filter.statusCode = statusCode;
    if (minExecutionTime) filter.executionTime = { $gte: minExecutionTime };
    if (maxExecutionTime) filter.executionTime = { $lte: maxExecutionTime };

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('ascii');
      const [timestamp, id] = decodedCursor.split(':');

      filter.$or = [
        { createdAt: { $lt: new Date(+timestamp) } },
        { createdAt: new Date(+timestamp), _id: { $lt: id } },
      ];
    }

    const results = await this.eventRepository
      .getCollection()
      .find(filter)
      .sort({ datetime: -1, _id: -1 })
      .limit(isForReport ? 0 : limit)
      .toArray();

    return results.map((r) => ({
      ...r,
      responseBody:
        JSON.stringify(r?.responseBody)?.length > 512
          ? { message: 'Data to big, see the database record for youserlf.' }
          : r.responseBody,
    }));
  }

  async search({
    ip,
    path,
    method,
    statusCode,
    minExecutionTime,
    maxExecutionTime,
    cursor,
    limit,
    startDate,
    endDate,
  }: EventSearchDto): Promise<EventSearchResponseDto> {
    const generalResults = await this.generalSearch({
      ip,
      path,
      method,
      statusCode,
      minExecutionTime,
      maxExecutionTime,
      limit,
      cursor,
      startDate,
      endDate,
    });

    const hasMore = generalResults.length > limit;

    let nextCursor: string | undefined;

    if (hasMore) {
      const lastItem = generalResults[generalResults.length - 1];
      const cursorData = `${lastItem.createdAt.getTime()}:${lastItem._id}`;
      nextCursor = Buffer.from(cursorData).toString('base64');
    }

    return {
      items: generalResults,
      nextCursor,
      hasMore,
    };
  }

  async report({
    ip,
    path,
    method,
    statusCode,
    minExecutionTime,
    maxExecutionTime,
    startDate,
    endDate,
  }: EventSearchReportDto): Promise<Buffer> {
    const generalResults = await this.generalSearch(
      {
        ip,
        path,
        method,
        statusCode,
        minExecutionTime,
        maxExecutionTime,
        startDate,
        endDate,
      } as Partial<EventSearchDto>,
      true,
    );

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: 'Event Log Report',
        Author: 'Logger System',
      },
    });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {});

    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('Event Log Report', { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(
        `Report Period: ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'End'}`,
        { align: 'center' },
      )
      .moveDown(2);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(2);

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Status Code Distribution', { underline: true })
      .moveDown();

    const statusCodeCounts = generalResults.reduce(
      (acc, event) => {
        const code = event.statusCode as number;
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const statusCodeConfig: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: Object.keys(statusCodeCounts),
        datasets: [
          {
            data: Object.values(statusCodeCounts),
            backgroundColor: [
              '#26c281', // Green
              '#e74c3c', // Red
              '#f1c40f', // Yellow
              '#3498db', // Blue
              '#9b59b6', // Purple
              '#e67e22', // Orange
              '#1abc9c', // Turquoise
              '#34495e', // Dark Blue
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Status Code Distribution',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            position: 'right',
            labels: {
              padding: 20,
            },
          },
        },
      },
    };

    const statusCodeBuffer =
      await this.chartJSNodeCanvas.renderToBuffer(statusCodeConfig);
    doc.image(statusCodeBuffer, {
      fit: [500, 300],
      align: 'center',
    });

    doc.addPage();

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Execution Time Distribution', { underline: true })
      .moveDown();

    const executionTimes = generalResults.map(
      (event) => event.executionTime as number,
    );
    const maxTime = Math.max(...executionTimes);
    const minTime = Math.min(...executionTimes);
    const binCount = 10;
    const binSize = (maxTime - minTime) / binCount;

    const bins = new Array<number>(binCount).fill(0);

    executionTimes.forEach((time) => {
      const binIndex = Math.min(
        Math.floor((time - minTime) / binSize),
        binCount - 1,
      );
      bins[binIndex]++;
    });

    const executionTimeConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: bins.map((_, i) => `${(minTime + i * binSize).toFixed(0)}ms`),
        datasets: [
          {
            label: 'Execution Time Distribution',
            data: bins,
            backgroundColor: '#3498db',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Execution Time Distribution',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Events',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Execution Time (ms)',
            },
          },
        },
      },
    };

    const executionTimeBuffer =
      await this.chartJSNodeCanvas.renderToBuffer(executionTimeConfig);
    doc.image(executionTimeBuffer, {
      fit: [500, 300],
      align: 'center',
    });

    doc.addPage();

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('HTTP Method Distribution', { underline: true })
      .moveDown();

    const methodCounts = generalResults.reduce(
      (acc, event) => {
        acc[event.method] = (acc[event.method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const methodConfig: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: Object.keys(methodCounts),
        datasets: [
          {
            data: Object.values(methodCounts),
            backgroundColor: [
              '#2ecc71', // Green
              '#e74c3c', // Red
              '#3498db', // Blue
              '#f1c40f', // Yellow
              '#9b59b6', // Purple
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'HTTP Method Distribution',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            position: 'right',
            labels: {
              padding: 20,
            },
          },
        },
      },
    };

    const methodBuffer =
      await this.chartJSNodeCanvas.renderToBuffer(methodConfig);
    doc.image(methodBuffer, {
      fit: [500, 300],
      align: 'center',
    });

    doc.addPage();

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Summary Statistics', { underline: true })
      .moveDown();

    const stats = [
      ['Total Events', generalResults.length.toString()],
      [
        'Average Execution Time',
        `${(executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length).toFixed(2)}ms`,
      ],
      ['Min Execution Time', `${minTime}ms`],
      ['Max Execution Time', `${maxTime}ms`],
      [
        'Unique IPs',
        new Set(generalResults.map((event) => event.ip)).size.toString(),
      ],
      [
        'Unique Paths',
        new Set(generalResults.map((event) => event.path)).size.toString(),
      ],
    ];

    const startX = 50;
    const colWidth = 250;

    stats.forEach(([label, value]) => {
      const y = doc.y;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(label, startX, y)
        .font('Helvetica')
        .text(value, startX + colWidth, y);
      doc.moveDown(1.5);
    });

    doc
      .moveDown(4)
      .fontSize(10)
      .font('Helvetica')
      .text(`Report generated on ${new Date().toLocaleString()}`, {
        align: 'center',
      });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
}
