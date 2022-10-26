import { ReadStream } from "fs-capacitor";

export interface SystemResponse {
  status: number
  error?: SystemError
}

export interface SystemError {
  remark: string
  code: string
  text: string
}

export interface Upload {
  filename: string
  mimetype: string
  encoding: string
  createReadStream(): ReadStream
}