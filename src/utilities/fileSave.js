import logger from '../lib/logger';

export default function FileSave() {
    const rnfs = require('react-native-fs');
    const path = rnfs.DocumentDirectoryPath + '/test.txt';

    rnfs
        .writeFile(path, 'Lorem ipsum dolor sit amet', 'utf8')
        .then(() => {
            logger.l(path);
            logger.l('FILE WRITTEN!');
        })
        .catch(err => {
            logger.l(err.message);
        });

    logger.l('RNFS.DocumentDirectoryPath');
    logger.l(rnfs.DocumentDirectoryPath);

    rnfs
        .readDir(rnfs.DocumentDirectoryPath)
        .then(result => {
            logger.l('GOT RESULT', result);
            // stat the first file
            return Promise.all([rnfs.stat(result[0].path), result[0].path]);
        })
        .then(statResult => {
            if (statResult[0].isFile()) {
                return rnfs.readFile(statResult[1], 'utf8');
            }
            return 'no file';
        })
        .then(contents => {
            // log the file contents
            logger.l(contents);
        })
        .catch(err => {
            logger.l('error');
            logger.l(err.message, err.code);
        });
}
