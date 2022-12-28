import prisma from '~/prisma';

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