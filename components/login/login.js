var login = (function(){
    var obj = {}
    
    obj.gotoFriendsIfLoggedIn = function () {
        $('#login-text').text('Loading ...')
        $('#fb-login-btn').addClass('hidden')
        
        fbInterface.checkLoginState(function (response) {
            if (response && response.status == 'connected') {
                $('#navbar-logout').removeClass('hidden')
                navbar.showPage('friends')
            }
            else {
                $('#login-text').text('Login with Facebook to share your schedule')
                $('#fb-login-btn').removeClass('hidden')
            }
        })
    }
    
    obj.tryLogOut = function () {
        if (confirm("Are you sure you want to log out?")) {
            FB.logout(function (respose) {
                $('#navbar-logout').addClass('hidden')
                navbar.showPage('courses')
            })
        }
    }
    
    return obj
})()
