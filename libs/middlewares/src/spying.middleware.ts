import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { RabbitMQService } from '@libs/rabbitmq';
import { EventPayload } from '@libs/dtos';
import { TimeSeriesService } from '@libs/redis/src/time-series.service';

@Injectable()
export class SpyingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SpyingMiddleware.name);

  constructor(
    private readonly rabbitMqService: RabbitMQService,
    private readonly emitter: string,
    private readonly timeSeriesService?: TimeSeriesService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    this.logger.debug(`[${new Date(startTime).toISOString()}] ${req.path}`);

    const requestHeaders = req.headers;
    const ip = req.socket.remoteAddress || 'unknown';

    const originalSend = res.send;
    let responseBody: object;

    res.send = function (body: any): Response {
      responseBody = body as object;

      return originalSend.call(this, body) as Response;
    };

    res.on('finish', () => {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      const statusCode = res.statusCode;
      const responseHeaders = res.getHeaders();

      const payload = {
        ip,
        requestHeaders,
        responseHeaders,
        responseBody,
        executionTime,
        statusCode,
        method: req.method,
        path: req.path,
        query: req.query,
        requestBody: req.body as object,
        params: req.params,
      } as EventPayload;

      this.rabbitMqService
        .publishEvent({
          payload,
          emitter: this.emitter,
        })
        .then(() => {
          this.logger.debug(
            `App ${this.emitter} has sent a message to the queue`,
          );
        })
        .catch((error) => {
          this.logger.error(error);
        });

      if (this.timeSeriesService) {
        this.logger.debug(
          'In Redis, time series data structure is not available by default, I beg your pardon for the inconvenience.',
        );

        this.timeSeriesService
          .addEventToTimeSeries(this.emitter, payload)
          .then(() => {
            this.logger.log(
              `App ${this.emitter} has added an event to the time series`,
            );
          })
          .catch((error) => this.logger.error(error));
      }
    });

    next();
  }
}
