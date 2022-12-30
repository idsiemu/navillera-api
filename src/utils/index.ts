import prisma from '~/prisma';


export const generateSerial = async(type: string, exts: Array<string>) => {
    const sysFile = await prisma.sys_file.findUnique({
        where : {
            file_type : type
        }
    })
    const serialArray = exts.map((ext, index) => {
        const gNumber = sysFile.serial_no + index + 1
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
        serialName += `.${ext}`
        return serialName
    })
    if(exts.length) {
        await prisma.sys_file.update({
            where : {
                file_type : type
            },
            data : {
                serial_no : sysFile.serial_no + exts.length
            }
        })
    }
    
    return serialArray
}