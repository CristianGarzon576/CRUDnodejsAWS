const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, HEAD, OPTIONS'
}

const BUCKET = 'BUCKET_NAME';
const REGION = 'REGION';
const ACCESS_KEY = 'ACCESS_KEY';
const SECRET_KEY = 'SECRET_KEY';
const baseUrlBucket = `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;
const table = 'TABLE_NAME';

AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION
});
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
    // TODO implement
    try {
        const {name, lastName, age, idNumber, idType, city, profilePhoto} = JSON.parse(event.body);
        if(!name) {
            return sentResponse(400, {message: 'name is required'});
        }
        if(!lastName) {
            return sentResponse(400, {message: 'lastName is required'});
        }
        if(!age) {
            return sentResponse(400, {message: 'age is required'});
        }
        if(!idNumber) {
            return sentResponse(400, {message: 'idNumber is required'});
        }
        if(!idType) {
            return sentResponse(400, {message: 'idType is required'});
        }
        if(!city) {
            return sentResponse(400, {message: 'city is required'});
        }
        if(!profilePhoto) {
            return sentResponse(400, {message: 'Profile Photo in Base64 is required'});
        }
        
        const buf = Buffer.from(profilePhoto.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const contentTypeImage = profilePhoto.split(';')[0].split(':')[1];
        const data = {
            Bucket: BUCKET,
            Key: `${idType}-${idNumber}`,
            Body: buf,
            ContentType: contentTypeImage,
            ACL: 'public-read'
        };
        let uploadImage = await uploadImg(data);
        if(uploadImage) {
            const params = {
            TableName: table,
            Item: {
                id: `${idType}-${idNumber}`,
                name,
                lastName, 
                age,
                city,
                imageUrl: `${baseUrlBucket}${idType}-${idNumber}`
            }
            };
            const client = await dynamoDb.put(params).promise();
            return sentResponse(201);
        } else {
            return sentResponse(400, {message: 'Error al cargar la imagen'});
        }
    } catch (e) {
      console.error(e);
      return sentResponse(500, {message: `Internal server error ${e}`});
    }
};

const uploadImg = (data) => {
    return s3.putObject(data, (err, res) => {
            if(err) {
                console.error(err);
                console.log(`Fallamos al cargar la imagen por esto: ${err}` ,data);
                return false;
            } else {
                console.log('success', res)
                return true;
            }
        });
}

const sentResponse = (statusCode, body = null) =>  {
    const response = {
        statusCode, 
        body: JSON.stringify(body),
        headers
    }
    
    return response;
};