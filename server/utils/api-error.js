export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function validationError(fields) {
  return new ApiError(400, 'VALIDATION_ERROR', 'Please check the submitted fields.', fields)
}

export function unknownFields(input, allowed, message) {
  return Object.fromEntries(
    Object.keys(input).filter((key) => !allowed.includes(key)).map((key) => [key, message]),
  )
}
