/*eslint no-empty: "error"*/
import * as AWS from 'aws-sdk'
import { ReadStream } from "fs-capacitor";
import prisma from '~/prisma';

const client = new AWS.S3({
    accessKeyId : process.env.AWS_S3_KEY,
    secretAccessKey : process.env.AWS_S3_SECRET,
    region : 'ap-northeast-2'
})

export const s3UploadImages = async(stream:ReadStream, name:string, extension: string) => {
    try{
        const result = await client.upload({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: name,
            ACL: 'public-read',
            Body: stream,
            ContentType : extension
        }).promise()
        if(result.Location){
            return true
        }
        return false
    }catch(e) {
        return false
    }
}

export const s3DeleteFiles = async(files: Array<any>) => {
    if(files.length === 0){
        return true
    }
    const result = await client.deleteObjects({
        Bucket: process.env.AWS_S3_BUCKET,
        Delete: {
            Objects : files
        },
    }).promise()
    if(result.Deleted){
        return true
    }
    return false
}

export const streamToString = (stream) => {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    })
}

export const getSizeArray = (width: number, height: number) => {

    const sizeArray = []
    const rate = height/width

    if(width < 120){
        // empty
    }else if(width < 480){
        const size120 = { width : 120, height : Math.round(120*rate), size: 'ss_size'}
        sizeArray.push(size120)
    }else if(width < 720){
        const size120 = { width : 120, height : Math.round(120*rate), size: 'ss_size'}
        const size480 = { width : 480, height : Math.round(480*rate), size: 's_size' }
        sizeArray.push(size120)
        sizeArray.push(size480)
    }else if(width < 960){
        const size120 = { width : 120, height : Math.round(120*rate), size: 'ss_size'}
        const size480 = { width : 480, height : Math.round(480*rate), size: 's_size'}
        const size720 = { width : 720, height : Math.round(720*rate), size: 'm_size'}
        sizeArray.push(size120)
        sizeArray.push(size480)
        sizeArray.push(size720)
    }else if(width < 1280){
        const size120 = { width : 120, height : Math.round(120*rate), size: 'ss_size'}
        const size480 = { width : 480, height : Math.round(480*rate), size: 's_size'}
        const size720 = { width : 720, height : Math.round(720*rate), size: 'm_size'}
        const size960 = { width : 960, height : Math.round(960*rate), size: 'l_size'}
        sizeArray.push(size120)
        sizeArray.push(size480)
        sizeArray.push(size720)
        sizeArray.push(size960)
    }else{
        const size120 = { width : 120, height : Math.round(120*rate), size: 'ss_size'}
        const size480 = { width : 480, height : Math.round(480*rate), size: 's_size'}
        const size720 = { width : 720, height : Math.round(720*rate), size: 'm_size'}
        const size960 = { width : 960, height : Math.round(960*rate), size: 'l_size'}
        const size1280 = { width : 1280, height : Math.round(1280*rate), size: 'xl_size'}
        sizeArray.push(size120)
        sizeArray.push(size480)
        sizeArray.push(size720)
        sizeArray.push(size960)
        sizeArray.push(size1280)
    }
    return sizeArray
}

export const generateSerial = async(type: string, length: number) => {
    const serialArray = []
    const sysFile = await prisma.sys_file.findUnique({
        where : {
            file_type : type
        }
    })

    for(let i = 1; i <= length ; i++){
        const gNumber = sysFile.serial_no + i
        const gStr = gNumber.toString();
        const gDigit = gStr.length;
        let serialName = sysFile.pre_fix
        if(gDigit < sysFile.serial_digit){
            const cDiff = sysFile.serial_digit - gDigit
            for(let j = 0; j < cDiff; j++){
                serialName += '0'
            }
            serialName += gNumber
        }else{
            serialName += gNumber
        }
        serialArray.push(serialName)
    }

    await prisma.sys_file.update({
        where : {
            file_type : type
        },
        data : {
            serial_no : sysFile.serial_no + length
        }
    })
    return serialArray
}