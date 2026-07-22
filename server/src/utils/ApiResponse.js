class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }

  static ok(data, msg = 'Success') {
    return new ApiResponse(200, msg, data);
  }
  static created(data, msg = 'Created successfully') {
    return new ApiResponse(201, msg, data);
  }
}

export default ApiResponse;
