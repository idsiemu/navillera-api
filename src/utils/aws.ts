import * as AWS from 'aws-sdk'

const client = new AWS.S3({
    accessKeyId : process.env.AWS_S3_KEY,
    secretAccessKey : process.env.AWS_S3_SECRET,
    region : 'ap-northeast-2'
})

const signedUrlExpireSeconds = 60 * 5

export const getPreSignedUrl = (key) => {
    return client.getSignedUrl('putObject', {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: signedUrlExpireSeconds
    })
}

