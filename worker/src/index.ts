import component from '../../mc/dist/index'
import { handleRequest } from './handler'
import { Env } from './models'

export default {
  async fetch(
    request: Request,
    env: Env,
    execContext: ExecutionContext
  ): Promise<Response> {
    return handleRequest(request, execContext, env, component)
  },
}
