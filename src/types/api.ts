export interface ApiResponse {
  data: {
    hash: string
    userId: number
  }
  messages: string[] | []
  error: boolean
}
