const { select, selectWhere, insertRecord, selectPage } = require('../services/generalDbService');

//add
const addRequisition  = async ( data) => {
    try{
        const result = await insertRecord(data, 'requisitions');
        return result;
    }catch(ex){
        return false
    }
}

const requisitions = async (page, perPage) => {
    try {
        const requisitions = await selectPage('requisitions', '*', page, perPage)
        return requisitions;
    } catch (ex) {
        return []
    }
}




//delete
//update


/// reqtypes
//add
//delete
//update