var login = (function(){
    var obj = {}
    
    obj.gotoFriendsIfLoggedIn = function () {
        checkLoginState(function (response) {
            if (fbCurrentState && fbCurrentState.status == 'connected') {
                navbar.showPage('friends')
            }
        })
    }
    
    obj.tryLogOut = function () {
        if (confirm("Are you sure you want to log out?") == true) {
            
        }
        else {
            
        } 
    }
    
    return obj
})()
