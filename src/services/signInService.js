const { insertUser,getUser } = require('../database/repository');

const signInService = async ({email,nickname}) =>{
   let result = {};
   const user = await getUser({email});  
   if(user.length === 0){
         await insertUser({email,nickname});
         result.status = 201;
         result.message = "Created";
         return result;
   }
   result.status = 200;
   result.message = "Ok";
   return result;
}

module.exports = { signInService }