var login = (function(){
    var obj = {}
    
    obj.gotoFriendsIfLoggedIn = function () {
        checkLoginState(function (response) {
            if (fbCurrentState && fbCurrentState.status == 'connected') {
                navbar.showPage('friends')
            }
        })
    }
    
    return obj
})()
