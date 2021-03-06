
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWS from 'aws-sdk'
import { UserItem } from '../models/UserItem'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

export class UsersAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly userTable = process.env.USERS_TABLE){}


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
            UpdateExpression: "set #answers.#questionId = if_not_exists(#answers.#questionId, :newVote)",
            ExpressionAttributeValues: {
                ":newVote": optionSelected,
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

    }

    async getResponsesByUser(userId: string): Promise<UserItem[]>{
        const result = await this.docClient.query({
            TableName: this.userTable,
            KeyConditionExpression: "userId= :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
        }).promise()
        
        const items = result.Items
        return items as UserItem[]
    }

    async createUser(newUser: UserItem): Promise<UserItem>{
        await this.docClient.put({
            TableName: this.userTable,
            Item: newUser
        }).promise()
    
        return newUser
    }
}