import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import 'source-map-support/register'

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    console.log('Processing event batch from DynamoDB', JSON.stringify(event))

    for (const record of event.Records) {
        console.log('Processing record', JSON.stringify(record))

        if (record.eventName !== 'INSERT') {
            continue
        }

        const newItem = record.dynamodb.NewImage
        const imageId = newItem.imageId.S

        const body = {
            imageId: newItem.imageId.S,
            groupId: newItem.groupId.S,
            imageUrl: newItem.imageUrl.S,
            title: newItem.title.S,
            timestamp: newItem.timestamp.S
        }

        await es.index({
            index: 'images-index',
            type: 'images',
            id: imageId,
            body
        })

    }

}