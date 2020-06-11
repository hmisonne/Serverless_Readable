import { ResponseItem } from '../models/ResponseItem'
import { ResponseAccess } from '../dataLayer/responsesAccess'
import { VoteRequest } from '../requests/VoteRequest'

const responseAccess = new ResponseAccess()

export async function getResponsesPerUser(userId: string): Promise<ResponseItem[]>{
    return await responseAccess.getResponsesPerUser(userId)
}

export async function createResponse(questionId: string, userId: string, newVote: VoteRequest): Promise<ResponseItem>{
    return await responseAccess.createResponse({
        userId,
        questionId,
        optionSelected: newVote.optionSelected,
    })
}