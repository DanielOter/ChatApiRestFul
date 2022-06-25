const { getFriendsList, addFriend, deleteFriend, getUser, checkFriendship } = require('../database/repository')
const createError = require("http-errors");

class FriendService {

    async deleteFriendship  ({emailUserA, emailUserB}){
      const userA = await getUser({email: emailUserA}); //Traigo ambos user con los mails.
      const userB = await getUser({email: emailUserB});

      if(userA.length === 0 || userB.length === 0) //Compruebo que el result set no este vacío.
        throw createError.BadRequest('Invalid Email');

      const friendList = await getFriendsList({email: emailUserA}); //Traigo la lista de amigos del usuario que realiza la request.

      if(friendList.length === 0)
        throw createError.BadRequest('User does not have friends');
      
      const foundFriend = friendList.find(user => user.nickname == userB[0].nickname); //Filtro la lista de amigos buscando si hace match con el nickname del user B.
      
      if(!foundFriend) //En caso de que coincidan los nickname
        throw createError.BadRequest('The selected users are not friends');

      await deleteFriend({emailUserA, emailUserB}) //Se borra la amistad.
    }
    //deleteFriendship = async (emailUserA, emailUserB) => deleteFriend({emailUserA, emailUserB})       
    
  getFriends = async (email) =>  getFriendsList({email}) 


  newFriend =  async ({email, emailFriend}) => {
    const friendA = await getUser({email}); 
      const friendB = await getUser({email: emailFriend});


       //Consulto existencia de los emails 
      if(friendB.length === 0)
          throw createError.BadRequest("Invalid eMail")

      const id_user = friendA[0].id_user
      const friendId = friendB[0].id_user  

      const friendship = await checkFriendship({id_user,friendId})

      if(friendship.length > 0 ){
        throw createError.BadRequest("Friendship already exist")
      }
     await addFriend({id_user, friendId})
     await addFriend({id_user: friendId, friendId: id_user})
}

}

module.exports = new FriendService()