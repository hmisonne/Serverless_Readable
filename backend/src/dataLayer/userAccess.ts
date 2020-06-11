import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { UserInfo } from '../models/UserInfo'
import * as AWS from 'aws-sdk'


export class UserAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly userTable = process.env.USERS_TABLE){}

    
    async createUser(newQuestion: UserInfo): Promise<UserInfo> {
        await this.docClient.put({
            TableName: this.userTable,
            Item: newQuestion,
          }).promise()
          

        return newQuestion
        
    }
    
    async getAllUsers(): Promise<UserInfo[]> {
        const response = await this.docClient.scan({
            TableName: this.userTable
        }).promise()
        const items = response.Items
        return items as UserInfo[]
    }

    async updateUserVote(userId: string, questionId: string, optionSelected: string ): Promise<void> {
        await this.docClient.update({
            TableName: this.userTable,
            Key:{
                userId,
            },
            ExpressionAttributeNames: {
                "#answers": "answers",
                "#questionId": questionId
            },
            UpdateExpression: "set #answers.#questionId = :optionSelected",
            ExpressionAttributeValues: {
                ":userId": userId,
                ':optionSelected': optionSelected
            },
            ReturnValues: "UPDATED_NEW"
          }).promise()
        
    }
}
