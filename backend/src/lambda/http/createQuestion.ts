import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createQuestion } from '../../businessLogic/questions'
import { CreateQuestionRequest } from '../../requests/CreateQuestionRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('createQuestion')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const userId = getUserId(event)
  const newQuestion: CreateQuestionRequest = JSON.parse(event.body) 
  const item = await createQuestion(newQuestion, userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      item
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)