import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getAllTodosById } from '../../helpers/todosAcess'
import { getUserId } from '../utils'
// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(event)
    // Write your code here
    const todos = await getAllTodosById(getUserId(event))

    return {
      statusCode: 201,
      body: JSON.stringify({
        items:todos
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
