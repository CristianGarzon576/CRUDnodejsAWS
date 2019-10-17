const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const table = 'TABLE_NAME';

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, HEAD, OPTIONS'
}

exports.handler = async (event) => {
    // TODO implement
    try {
        const {name, lastName, age, city} = JSON.parse(event.body);
        const {id} = event.pathParameters;
        if (!id) {
            return sentResponse(400, {message: 'Bad Request'});
        }
        if(!name) {
            return sentResponse(400, {message: 'name is required'});
        }
        if(!lastName) {
            return sentResponse(400, {message: 'lastName is required'});
        }
        if(!age) {
            return sentResponse(400, {message: 'age is required'});
        }
        if(!city) {
            return sentResponse(400, {message: 'city is required'});
        }
        const params = {
            TableName: table,
            Key: {"id": id}
        }
        const exist = await getClient(params);
        if (!exist.Item) {
            return sentResponse(404, {message: 'Client dose not exist'});
        } else {
            params.UpdateExpression = "set #name = :n, #lastName = :ln, #city = :c, #age = :a";
            params.ExpressionAttributeNames = {
                "#name": "name",
                "#lastName": "lastName",
                "#city": "city",
                "#age": "age",
            }
            params.ExpressionAttributeValues = {
                ":n": name,
                ":ln": lastName,
                ":c": city,
                ":a": age
            };
            await update(params);
            return sentResponse(201);
        }
    } catch(e) {
        return sentResponse(500, {message: `Internal server error ${e}`});
    }
};

const getClient = (params) => {
    return dynamoDb.get(params).promise();
}

const update = (params) => {
    return dynamoDb.update(params).promise();
};

const sentResponse = (statusCode, body = null) => {
    const response = {
        statusCode,
        body: JSON.stringify(body),
        headers
    }
    return response;
};