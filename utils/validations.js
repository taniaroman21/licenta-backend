const validateId = async (objCollection, id) => {
  try {
    const obj = await objCollection.findById(id);
  }
  catch{
    return Promise.reject(new Error(`User with id ${id} does not exist`));
  }
}

module.exports.validateId = validateId;