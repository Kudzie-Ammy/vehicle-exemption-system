const fs = require('fs');

///////// Folder ops //////////////////
const documents = `../documents/`;

const createFolder = (user, folderName) => {
    try {
        const folder = `${documents}${folderName}_${user}`;
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);

          //save to db
        }
      } catch (err) {
        console.error(err);
      }
}

const renameFolder = (folderId, newName ) => {
    fs.renameSyc('/Users/joe', '/Users/roger', err => {
        if (err) {
          console.error(err);
        }
        // done
      });
}

const deleteFolderWithFiles = (folderId) => {
    fs.rm(dir, { recursive: true, force: true }, err => {
        if (err) {
          throw err;
        }
      
        console.log(`${dir} is deleted!`);
      });
}

const deleteEmptyFolder = (folderId) => {
    fs.rmdir(dir, err => {
        if (err) {
          throw err;
        }
      
        console.log(`${dir} is deleted!`);
      });
}


//////////File Ops ////////////////////////
const uploadFile = () => {

}

const downloadFile = () => {

}

const viewFile = () => {
    
}

module.exports = {
    createFolder
}