export const getThumbPath = (filePath) => {
    if (filePath?.length > 0) {
        let thumbPath = ''
        let splitPath = filePath.split('/');
        const length = splitPath?.length - 1;
        splitPath.forEach((item, index) => {
            if (index == length) {
                thumbPath = `${thumbPath}/thumb_${item}`
            } else {
                if (index == 0) {
                    thumbPath = item
                } else {
                    thumbPath = `${thumbPath}/${item}`
                }
            }
        })
        return thumbPath
    } else {
        return ''
    }
}