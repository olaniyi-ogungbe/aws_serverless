import * as AWS from 'aws-sdk'
const AWSXRay = require ('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'


const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const todosTable = process.env.TODOS_TABLE
const index = process.env.TODOS_CREATED_AT_INDEX
const docClient: DocumentClient = createDynamoDBClient()



// // TODO: Implement the dataLayer logic
export async function createTodo(todo : TodoItem) : Promise<TodoItem> {
    logger.info('create todo', todo)
    await docClient
        .put({
            TableName: todosTable,
            Item: todo
        })
        .promise()

    return todo
}

export async function getAllTodosById(userId : string) : Promise<TodoItem[]> {
    logger.info('get all todos by id', userId)
    const result = await docClient.query({
        TableName : todosTable,
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeNames:{
            '#userId' : 'userId'
        },
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    return result.Items as TodoItem[];
}

export async function getTodoById(todoId : string) : Promise<TodoItem> {
    logger.info('get to do by id', todoId)
    const result = await docClient.query({
        TableName : todosTable,
        IndexName : index,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
            ':todoId': todoId
        }
    }).promise()
    const items = result.Items
    if(items.length !==0) return result.Items[0] as TodoItem

    return null
}

export async function updateImage(todo : TodoItem) : Promise<TodoItem> {
    logger.info('update image url', todo)
   const result = await docClient.update({
        TableName : todosTable,
        Key: {
                userId: todo.userId,
                todoId: todo.todoId
            },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
            ':attachmentUrl': todo.attachmentUrl
        }
    }).promise()
   
    return result.Attributes as TodoItem
}



export async function deleteTodo(todo : TodoItem) : Promise<void> {
    await docClient.delete({
         TableName : todosTable,
         Key: {
             userId: todo.userId,
             todoId: todo.todoId
         },
     }).promise()
    
 } 

export async function updateTodo(userId: string, todoId: string, todo: TodoUpdate): Promise<TodoUpdate> {
   const result = await docClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set #name = :name, dueDate=:dueDate, done=:done",
      ExpressionAttributeValues: {
        ":n": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done
      },
      ExpressionAttributeNames: { '#name': 'name' },
    }).promise()
    return result.Attributes as TodoUpdate
  }


    



function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log( )
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }