const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const BUCKET = 'BUCKET_NAME';
const REGION = 'REGION';
const ACCESS_KEY = 'ACCESS_KEY';
const SECRET_KEY = 'SECRET_KEY';
const table = 'TABLE_NAME';

AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION
});
const s3 = new AWS.S3();

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, HEAD, OPTIONS'
}
exports.handler = async (event) => {
    // TODO implement
    try {
        const {id} = event.pathParameters;
        if (!id) {
            return sentResponse(400, {message: 'Bad Request'});
        }
        const params = {
            TableName: table,
            Key: {"id": id}
        }
        const exist = await getClient(params);
        if(!exist.Item) {
            return sentResponse(404, {message: 'Client does not exist'});
        } else {
            await removeItem(params);
            await removeImage({Bucket: BUCKET, Key: id});
            return sentResponse(200, {message: 'Client remove'});
        }
    } catch (e) {
        return sentResponse(500, `Internal server Error ${e}`);
    }
};

const getClient = (params) => {
    return dynamoDb.get(params).promise();
};

const removeItem = (params) => {
    return dynamoDb.delete(params).promise();
}

const removeImage = (params) => {
    return s3.deleteObject(params).promise();
}

const sentResponse = (statusCode, body) => {
    const response = {
        statusCode,
        body: JSON.stringify(body),
        headers
    }
    return response;
}