// import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'
import { getTodoById } from '../dataLayer/todosAcess'
import { TodoUpdate } from '../models/TodoUpdate'
// import * as createError from 'http-errors'

const logger = createLogger('todos')

// // TODO: Implement businessLogic

export function todoCreator(todoRequest: CreateTodoRequest, event: APIGatewayProxyEvent): TodoItem{
    logger.info('todo was created', todoRequest)
    const todoId = uuid.v4()
    const todo = {
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: ' ',
        userId: getUserId(event),
        ...todoRequest,
      }
      return todo as TodoItem

}

export async function updateTodo(todoId: string, todo: UpdateTodoRequest): Promise<TodoUpdate> {

  logger.info('todo was updated', todoId)
  await getTodoById(todoId)

  return todo as TodoUpdate
}
