import type { Axios } from 'axios'
import axios from 'axios'

const BASE_URL = 'https://gitee.com/api/v5'
export default class GiteeRequest {
  public token: string = ''
  public service: Axios

  constructor(token: string) {
    this.token = token
    this.service = axios.create({
      baseURL: BASE_URL,
    })
    this.service.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        if (error.response && error.response.data)
          return error.response
        return Promise.reject(error)
      },
    )
  }

  public get<T = any>(url: string, params: any = {}, headers = {}) {
    return this.service.get<T>(url, {
      params: {
        ...params,
        access_token: this.token,
      },
      method: 'GET',
      headers,
    })
  }
}
