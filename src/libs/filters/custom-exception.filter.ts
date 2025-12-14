import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  NotAcceptableException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

const errorCodes = {
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  FORBIDDEN_ERROR: 'ACCESS_DENIED_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DATA_CONFLICT_ERROR: 'DATA_CONFLICT_ERROR',
  NOT_ACCEPTABLE_ERROR: 'NOT_ACCEPTABLE_ERROR',
  UNPROCESSABLE_DATA_ERROR: 'UNPROCESSABLE_DATA_ERROR',
  BAD_REQUEST_ERROR: 'BAD_REQUEST_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};

@Catch(
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  NotAcceptableException,
  InternalServerErrorException,
)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | UnauthorizedException
      | NotFoundException
      | ForbiddenException
      | ConflictException
      | UnprocessableEntityException
      | NotAcceptableException
      | InternalServerErrorException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorResponse = exception.getResponse() as {
      status: string;
      data?: any;
      message: string;
      errors: any;
    };

    const { data, message, errors } = errorResponse;
    let statusCode: number;
    let status: string;

    if (exception instanceof NotFoundException) {
      statusCode = 404;
      status = errorCodes.NOT_FOUND_ERROR;
    } else if (exception instanceof ConflictException) {
      statusCode = 409;
      status = errorCodes.DATA_CONFLICT_ERROR;
    } else if (exception instanceof UnprocessableEntityException) {
      statusCode = 422;
      status = errorCodes.UNPROCESSABLE_DATA_ERROR;
    } else if (exception instanceof BadRequestException) {
      statusCode = 400;
      status = errorCodes.BAD_REQUEST_ERROR;
    } else if (exception instanceof InternalServerErrorException) {
      statusCode = 500;
      status = errorCodes.INTERNAL_SERVER_ERROR;
    } else {
      statusCode = 500;
      status = errorCodes.INTERNAL_SERVER_ERROR;
    }

    response.status(statusCode).json({
      status,
      message,
      data,
      errors,
    });
  }
}
