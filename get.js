const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS'
}
const table = 'TABLE_NAME';


exports.handler = async (event, context) => {
    // TODO implement
    try {
        const queryParams = event.queryStringParameters;
        const params = {
            TableName: table
        };
        if (!!queryParams && !!queryParams.age) {
            params.FilterExpression = "#age >= :age";
            params.ExpressionAttributeNames = {"#age": "age"};
            params.ExpressionAttributeValues = {":age": parseInt(queryParams.age)}
        }
        if (!!queryParams && !!queryParams.idType && !!queryParams.idNumber && !queryParams.age) {
            params.FilterExpression = "#id = :id";
            params.ExpressionAttributeNames = {"#id": "id"};
            params.ExpressionAttributeValues = {":id": `${queryParams.idType}-${queryParams.idNumber}`}
        }
        if (!!queryParams && !!queryParams.idType && !!queryParams.idNumber && !!queryParams.age) {
            params.FilterExpression = "#id = :id and #age >= :age";
            params.ExpressionAttributeNames = {
                "#id": "id",
                "#age": "age"
            };
            params.ExpressionAttributeValues = {
                ":id": `${queryParams.idType} - ${queryParams.idNumber}`,
                ":age": queryParams.age
            }
        }
        const clients = await scan(params);
        const body = prepareBody(clients.Items);
        return sendResponse(200, body);
    } catch (e) {
        console.error(e);
        return sendResponse(500, {error: `Internal server error, pero controlado ${e}`});
    }
};

const scan = (params) => {
    return dynamoDb.scan(params).promise();
}

const prepareBody = (clients) => {
    const body = clients.map(client => {
        const id = client.id.split('-');
        client.idType = id[0].trim();
        client.idNumber = id[1].trim();
        delete client.id;
        return client;
    });
    return body;
};

const sendResponse = (statusCode, body = null) => {
    const response = {
        statusCode, 
        body: JSON.stringify(body),
        headers
    }
    
    return response;
};