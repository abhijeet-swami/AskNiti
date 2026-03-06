export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static send(res, statusCode, data, message = "Success") {
    return res.status(statusCode).json({
      success: statusCode < 400,
      statusCode,
      message,
      data,
    });
  }

  static ok(res, data, message = "Success") {
    return this.send(res, 200, data, message);
  }

  static created(res, data, message = "Created") {
    return this.send(res, 201, data, message);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}
