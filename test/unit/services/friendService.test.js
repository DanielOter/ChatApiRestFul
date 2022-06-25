const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const newFriendstub = sinon.stub();
const shipStub = sinon.stub();
const deleteFriendStub = sinon.stub();
const getUserStub = sinon.stub();
const getFriendsListStub = sinon.stub();

const friendService = proxyquire("../../../src/services/friendService", {
    "../database/repository": {
        deleteFriend: deleteFriendStub,
        getFriendsList: getFriendsListStub,
        addFriend: newFriendstub,
        checkFriendship: shipStub,
        getUser: getUserStub,
    },
});

describe("Test friendService", () => {
    beforeEach(() => {
        getUserStub.resetHistory();
        deleteFriendStub.resetHistory();
        getFriendsListStub.resetHistory();
        newFriendstub.resetHistory();
        shipStub.resetHistory();
    });
    it("Should delete the friend from list", async () => {
        const userA = [
            { id_user: 1, email: "emailfake2@gmail.com", nickname: "u" },
        ];
        const userB = [{ id_user: 2, email: "v@gmail.com", nickname: "v" }];
        const friendList = [{ nickname: "v" }, { nickname: "u" }];

        const emailUserA = { email: "emailfake2@gmail.com" };
        const emailUserB = { email: "v@gmail.com" };

        getUserStub.withArgs({ email: emailUserA.email }).resolves(userA);
        getUserStub.withArgs({ email: emailUserB.email }).resolves(userB);
        getFriendsListStub
            .withArgs({ email: emailUserA.email })
            .resolves(friendList);
        deleteFriendStub
            .withArgs({
                emailUserA: "emailfake2@gmail.com",
                emailUserB: "v@gmail.com",
            })
            .resolves({});

        await friendService.deleteFriendship({
            emailUserA: "emailfake2@gmail.com",
            emailUserB: "v@gmail.com",
        });

        chai.expect(getUserStub.calledTwice).to.be.true;
        chai.expect(getFriendsListStub.calledOnce).to.be.true;
        chai.expect(deleteFriendStub.calledOnce).to.be.true;
    });
    it("Should throw invalid Email Error", async () => {
        const emailUserA = { email: "emailfake2@gmail.com" };
        const emailUserB = { email: "v@gmail.com" };
        try {
            getUserStub.withArgs({ email: emailUserA.email }).resolves([]);
            getUserStub.withArgs({ email: emailUserB.email }).resolves([]);
            await friendService.deleteFriendship({
                emailUserA: "emailfake2@gmail.com",
                emailUserB: "v@gmail.com",
            });
        } catch (error) {
            chai.expect(error.message).to.be.eql("Invalid Email");
        }
    });
    it("Should throw user does not have friends Error", async () => {
        const userA = [
            { id_user: 1, email: "emailfake2@gmail.com", nickname: "u" },
        ];
        const userB = [{ id_user: 2, email: "v@gmail.com", nickname: "v" }];
        const friendList = [{ nickname: "v" }, { nickname: "l" }];

        const emailUserA = { email: "emailfake2@gmail.com" };
        const emailUserB = { email: "v@gmail.com" };

        try {
            getUserStub.withArgs({ email: emailUserA.email }).resolves(userA);
            getUserStub.withArgs({ email: emailUserB.email }).resolves(userB);
            getFriendsListStub
                .withArgs({ email: emailUserA.email })
                .resolves([]);
            await friendService.deleteFriendship({
                emailUserA: "emailfake2@gmail.com",
                emailUserB: "v@gmail.com",
            });
        } catch (error) {
            chai.expect(error.message).to.be.eql("User does not have friends");
        }
    });
    it("Should throw the selected users are not friends Error", async () => {
        const userA = [
            { id_user: 1, email: "emailfake2@gmail.com", nickname: "u" },
        ];
        const userB = [{ id_user: 2, email: "u@gmail.com", nickname: "v" }];
        const friendList = [{ nickname: "l" }];

        const emailUserA = { email: "emailfake2@gmail.com" };
        const emailUserB = { email: "v@gmail.com" };

        try {
            getUserStub.withArgs({ email: emailUserA.email }).resolves(userA);
            getUserStub.withArgs({ email: emailUserB.email }).resolves(userB);
            getFriendsListStub
                .withArgs({ email: emailUserA.email })
                .returns(friendList);
            await friendService.deleteFriendship({
                emailUserA: "emailfake2@gmail.com",
                emailUserB: "v@gmail.com",
            });
        } catch (error) {
            chai.expect(error.message).to.be.eql(
                "The selected users are not friends"
            );
        }
    });

    it("Should return a friends list", async () => {
        //Declare
        const email = "emailexample@gmail.com";
        const friendsArray = [{ nickname: "roverto" }, { nickname: "mariano" }];

        //return stuff
        getFriendsListStub.withArgs({ email }).resolves(friendsArray);

        //run tested stuff
        const result = await friendService.getFriends(email);

        //checks
        chai.expect(getFriendsListStub.calledOnce).to.be.true;
        chai.expect(result).to.be.eql(friendsArray);
    });
    it("Should add new friend", async () => {
        //Declare
        const email = "emailexample@gmail.com";
        const emailFriend = "emailexample2@gmail.com";
        const mock = [{ id_user: 1, email: "a@g.com", nickname: "roverto" }];
        const mock2 = [{ id_user: 2, email: "b@g.com", nickname: "julio" }];
        const id_user = mock[0].id_user;
        const friendId = mock2[0].id_user;

        //return stuff
        getUserStub.withArgs({ email }).resolves(mock);
        getUserStub.withArgs({ email: emailFriend }).resolves(mock2);

        shipStub.withArgs({ id_user, friendId }).resolves([]);

        newFriendstub.withArgs({ id_user, friendId }).resolves();
        newFriendstub
            .withArgs({ id_user: friendId, friendId: id_user })
            .resolves();

        //run tested stuff
        const result = await friendService.newFriend({ email, emailFriend });

        //checks
        chai.expect(newFriendstub.calledTwice).to.be.true;
        chai.expect(getUserStub.calledTwice).to.be.true;
        chai.expect(shipStub.calledOnce).to.be.true;
    });
    it("Should fail for invalid email", async () => {
        //Declare
        const email = "emailexample@gmail.com";
        const emailFriend = "emailexample2@gmail.com";
        const mock = [{ id_user: 1, email: "a@g.com", nickname: "roverto" }];
        const mock2 = [];

        //return stuff
        getUserStub.withArgs({ email }).resolves(mock);
        getUserStub.withArgs({ email: emailFriend }).resolves(mock2);

        //run tested stuff
        try {
            const result = await friendService.newFriend({
                email,
                emailFriend,
            });
        } catch (error) {
            //checks
            chai.expect(error.message).to.be.eql("Invalid eMail");
            chai.expect(getUserStub.calledTwice).to.be.true;
        }
    });
    it("Should fail for friendship exisiting already", async () => {
        //Declare
        const email = "emailexample@gmail.com";
        const emailFriend = "emailexample2@gmail.com";
        const mock = [{ id_user: 1, email: "a@g.com", nickname: "roverto" }];
        const mock2 = [{ id_user: 2, email: "b@g.com", nickname: "julio" }];
        const id_user = mock[0].id_user;
        const friendId = mock2[0].id_user;

        //return stuff
        getUserStub.withArgs({ email }).resolves(mock);
        getUserStub.withArgs({ email: emailFriend }).resolves(mock2);

        shipStub.withArgs({ id_user, friendId }).resolves([{}]);

        //run tested stuff
        try {
            const result = await friendService.newFriend({
                email,
                emailFriend,
            });
        } catch (error) {
            //checks
            chai.expect(error.message).to.be.eql("Friendship already exist");
            chai.expect(getUserStub.calledTwice).to.be.true;
            chai.expect(shipStub.calledOnce).to.be.true;
        }
    });
});
