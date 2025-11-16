export const extractFileNameFromURL = (fileUrl) => {
    try {
        // const url = new URL(fileUrl);
        // const pathname = url.pathname;
        
        // const lastSlashIndex = pathname.lastIndexOf('/');
        // const filename = pathname.substring(lastSlashIndex + 1);
        // return decodeURIComponent(filename);

        const url = new URL(fileUrl);
        let path = decodeURIComponent(url.pathname);
        const fullFileName = path.substring(path.lastIndexOf('/') + 1);
        const firstUnderscoreIndex = fullFileName.indexOf('_');
        if(firstUnderscoreIndex !== -1 && firstUnderscoreIndex > 0){
            return fullFileName.substring(firstUnderscoreIndex + 1);
        }

        return fullFileName;
        
    } catch(error){
        console.error('Invalid URL:', fileUrl);
        return 'Invalid URL';
    }
};