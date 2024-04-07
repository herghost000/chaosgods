import type { Axios } from 'axios'
import axios from 'axios'

const BASE_URL = 'https://api.github.com/'
export default class GithubRequest {
  public token: string = ''
  public service: Axios

  constructor(token: string) {
    this.token = token
    this.service = axios.create({
      baseURL: BASE_URL,
    })
    this.service.interceptors.request.use((config) => {
      config.headers.Authorization = `token ${this.token}`
      return config
    }, (err) => {
      Promise.reject(err)
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
      params,
      headers,
    })
  }

  public post<T = any>(url: string, data: any = {}, headers = {}) {
    return this.service.post<T>(url, data, {
      headers,
    })
  }
}
