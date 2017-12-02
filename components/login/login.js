var login = (function(){
    var obj = {}
    
    obj.gotoFriendsIfLoggedIn = function () {
        checkLoginState(function (response) {
            console.log(response);
        })
    }
    
    return obj
})()
