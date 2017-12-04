

var components = [
    'navbar',
    'login',
    'courses',
    'about',
    'friends'
]

var FB_APP_ID = '1664665356936852'
var DOMAIN_NAME = 'https://shareschedule.herokuapp.com/'

var loadingCount = 0

function startLoading() {
    if (loadingCount === 0) {
        $('#loading-div').removeClass('hidden')
    }
    loadingCount++
}

function endLoading() {
    if (loadingCount > 0) {
        loadingCount--
        if (loadingCount === 0) {
            $('#loading-div').addClass('hidden')
        }
    }
}

function newCalendar(elementID, clickHandler) {
    var obj = {}
    var calendarElement = $('#' + elementID)

    var calendarEvents = []

    calendarElement.fullCalendar({
        header: false,
        defaultView: 'agendaWeek',
        weekends: false,
        height: 'parent',
        // columnHeader: false,
        allDaySlot: false,
        themeSystem: 'bootstrap3',
        duration: {days: 5},
        slotDuration: '00:15:00',
        slotLabelInterval: '01:00:00',
        columnFormat: 'ddd',
        minTime: '09:00:00',
        maxTime: '22:00:00',
        defaultDate: '2017-05-01',
        eventClick: clickHandler,
        eventSources: [
            {
                events: function(start, end, timezone, callback) {
                    callback(calendarEvents)
                }
            }
        ]
    })

    // for each section:
    // int day: day of week, 1, 2, 3, 4, 5
    // int start: start hour of day
    // int end: end hour of day
    obj.setEvents = function (events) {
        calendarEvents.length = 0
        for (var i = 0, len = events.length; i < len; i++) {
            calendarEvents.push(events[i])
        }
        calendarElement.fullCalendar('refetchEvents')
    }

    var colors = [
        '#2b82ea',
        '#d96d09',
        '#aa3ea7',
        '#128a01',
        '#c02431',
        '#2d3cc7',
        '#655035',
        '#f589dc'
    ]
    
    var notFoundColor = '#cccccc'

    obj.dataToEvents = function (data, background, colorDict) {
        var events = []

        var courses = data.courses

        var cnt = 0
        for (var courseID in courses) {
            var courseInfo = courses[courseID]
            if (courseInfo.section) {
                var section = null
                var sections = courseInfo.data.meeting_sections
                for (var i = 0, len = sections.length; i < len; i++) {
                    if (courseInfo.section == sections[i].code) {
                        section = sections[i]
                        break
                    }
                }
                if (!section) continue
                for (var i = 0, len = section.times.length; i < len; i++) {
                    if (background && !colorDict[courseID]) {
                        continue
                    }
                    var event = {
                        id: (background ? 'background:' : '') + courseInfo.data.id + ':' + courseInfo.section,
                        title: courseInfo.data.code + '\n' + section.code + '\n' + section.times[i].location,
                        start: `2017-05-0${section.times[i].day}T${section.times[i].startStr}`,
                        end: `2017-05-0${section.times[i].day}T${section.times[i].endStr}`,
                        color: background ? colorDict[courseID] : colors[cnt]
                    }
                    if (background) {
                        event.rendering = 'background'
                    }
                    else {
                        colorDict[courseID] = colors[cnt]
                    }
                    events.push(event)
                }
                cnt = (cnt + 1) % colors.length
            }
        }

        return events
    }
    
    function extend(a, b) {
        for (var i = 0, len = b.length; i < len; i++) {
            a.push(b[i])
        }
    }
    
    obj.onDataChanged = function (data) {
        var colorDict = {}
        var events = obj.dataToEvents(data.data, false, colorDict)
        for (var i = 0, len = data.friends.length; i < len; i++) {
            extend(events, obj.dataToEvents(data.friends[i], true, colorDict))
        }
        
        obj.setEvents(events)
    }

    return obj
}

function main(callback) {
    loadComponents(callback)
    console.log('main function called.')
}

function loadComponents(callback) {
    count = 0
    function onCount() {
        count++
        if (count == components.length) {
            callback()
        }
    }
    for (var i = 0, len = components.length; i < len; i++) {
        (function () {
        var componentName = components[i]
        var componentPath = 'components/' + componentName + '/' + componentName

        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: componentPath + '.css'
        }).appendTo('head');

        $('#' + componentName).load(componentPath + '.html', function () {
            $.getScript(componentPath + '.js', function (data, status) {
                onCount()
            })
        })
        })()
    }
}

function buildURLString(url) {
    var result = url.url;
    if (url.qs) {
        result += '?'
        var i = 0
        for (var key in url.qs) {
            if (i > 0) {
                result += '&'
            }
            result += key + '=' + url.qs[key]
            i++
        }
    }
    return result
}

function requestPromise(url, data, type) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: type || 'GET',
            dataType: 'json',
            data: data || {},
            url: buildURLString(url)
            // success: function (data, textStatus, jqXHR) {
                // console.log(data)
            // }
        })
        .done(function (data) {
            resolve(data)
        })
        .fail(function (err) {
            reject(err)
        })
        /* request.get(
            url,
            function (err, response, body) {

            if (err) {
                reject(err)
            }
            else {
                var data = JSON.parse(body)
                resolve(data)
            }
        }); */
    })
}

var fbInterface = (function(){
    var obj = {}
    var observers = []
    
    var loginState = null
    
    obj.currentUserID = null
    obj.oldUserID = null
    
    obj.checkLoginState = function (callback) {
        FB.getLoginStatus(function(response) {
            loginState = response
            console.log(response);
            callback(response)
            
            var newUserID = (
                response
                && response.status === "connected"
                && response.authResponse
                ) ? response.authResponse.userID : null
            
            if (obj.currentUserID !== newUserID) {
                obj.oldUserID = obj.currentUserID
                obj.currentUserID = newUserID
                obj.dispatchChanges()
            }
        });
    }
    
    obj.getFriends = function (callback) {
        FB.api(
            // "/{user-id}/friends",
            "me/friends?fields=picture,name,id",
            function (response) {
                if (response) {
                    if (!response.error) {
                        callback(response)
                    }
                    else {
                        console.log('error getting friends:');
                        console.log(response.error);
                        callback(null)
                    }
                }
                else {
                    callback(null)
                }
            }
        );
    }
    
    obj.addObserver = function (handler) {
        observers.push(handler)
        handler(obj.currentUserID)
    }

    obj.dispatchChanges = function () {
        for (var i = 0, len = observers.length; i < len; i++) {
            observers[i](obj.currentUserID)
        }
    }


    return obj
})()

function newProfileData(isMainUser) {
    var obj = {}

    var observers = []

    var selectedSectionIDs = []
    var sectionIndexOf = {}
    var sectionIDOf = {}
    var sectionByIndex = {}
    var edgeMatrix = []
    var adjList = []
    var allSolutions = []
    
    var conflictAlertOn = false
    var bonusCourseID = null
    var bonusSectionCode = null
    
    obj.userID = null
    obj.userExists = false
    
    obj.friends = []

    obj.clearData = function () {
        obj.data = {
            /*
            dictionary, key = courseID, value = {
                data: course data object,
                section: section code (null if not yet selected)
            }
            */
            courses: {},
        }
        
        // this doesn't dispatch change.
    }
    obj.clearData()

    obj.refreshCandidates = function () {

    }
    
    function getSectionID(courseID, sectionCode) {
        return courseID + ':' + sectionCode
    }
    
    obj.getCourseData = function (courseID) {
        return obj.data.courses[courseID]
    }

    function recompute() {
        // selectedSectionIDs
        selectedSectionIDs.length = 0
        for (var courseID in obj.data.courses) {
            var sectionCode = obj.data.courses[courseID].section
            selectedSectionIDs.push(getSectionID(courseID, sectionCode))
        }

        // sectionIndexOf and sectionIDOf
        sectionIndexOf = {}
        sectionIDOf = {}
        sectionByIndex = {}
        var startNodes = []
        var layersList = []
        var count = 0
        var coursesCount = 0
        for (var courseID in obj.data.courses) {
            var course = obj.data.courses[courseID].data
            var layer = []
            for (var i = 0, len = course.meeting_sections.length; i < len; i++) {
                var sectionCode = course.meeting_sections[i].code
                var sectionID = getSectionID(courseID, sectionCode)
                sectionIndexOf[sectionID] = count
                sectionIDOf[count] = sectionID
                sectionByIndex[count] = course.meeting_sections[i]
                if (coursesCount == 0) startNodes.push(count)
                layer.push(count)
                count++
            }
            layersList.push(layer)
            coursesCount++
        }
        layersList.push([])

        // edgeMatrix
        edgeMatrix.length = 0
        for (var i = 0; i < count; i++) {
            var row = []
            for (var j = 0; j < count; j++) {
                row.push(0)
            }
            edgeMatrix.push(row)
        }
        for (var i = 0; i < count; i++) {
            for (var j = 0; j < i; j++) {
                if (!hasConflict(sectionByIndex[i], sectionByIndex[j])) {
                    edgeMatrix[i][j] = edgeMatrix[j][i] = 1
                }
            }
        }
        // console.log(edgeMatrix);

        // adjList
        adjList.length = 0
        for (var i = 0; i < layersList.length - 1; i++) {
            var layer = layersList[i]
            for (var j = 0; j < layer.length; j++) {
                adjList.push(layersList[i + 1].slice())
            }
        }

        // allSolutions
        allSolutions = listMaxCliques(startNodes, coursesCount, edgeMatrix, adjList)
        for (var i = 0, len = allSolutions.length; i < len; i++) {
            allSolutions[i] = decodeSolution(allSolutions[i])
        }
    }

    function hasConflict(section1, section2) {
        var times1 = section1.times
        var times2 = section2.times
        for (var i = 0, len = times1.length; i < len; i++) {
            var time1 = times1[i]
            for (var j = 0, len2 = times2.length; j < len2; j++) {
                var time2 = times2[j]
                if (time1.day == time2.day && time1.start < time2.end && time2.start < time1.end) {
                    return true
                }
            }
        }
        return false
    }

    function maxCliqueDFS(node, quota, edgeMatrix, adjList, stack, output) {
        stack.push(node)

        if (stack.length == quota) {
            output.push(stack.slice())
        }
        else {
            for (var i = 0, len = adjList[node].length; i < len; i++) {
                var next = adjList[node][i]
                var conflict = false
                for (var j = 0, len2 = stack.length; j < len2; j++) {
                    if (edgeMatrix[next][stack[j]] == 0) {
                        conflict = true
                        break
                    }
                }
                if (!conflict) {
                    maxCliqueDFS(next, quota, edgeMatrix, adjList, stack, output)
                }
            }
        }

        stack.pop()
    }

    function listMaxCliques(startNodes, quota, edgeMatrix, adjList) {
        var results = []
        var stack = []

        for (var i = 0, len = startNodes.length; i < len; i++) {
            var startNode = startNodes[i]
            maxCliqueDFS(startNode, quota, edgeMatrix, adjList, stack, results)
        }

        return results
    }

    function decodeSolution(rawSolution) {
        var result = {}
        for (var i = 0, len = rawSolution.length; i < len; i++) {
            var sectionID = sectionIDOf[rawSolution[i]]
            var colonIndex = sectionID.indexOf(':')
            var courseID = sectionID.substring(0, colonIndex)
            var sectionCode = sectionID.substring(colonIndex + 1, sectionID.length)
            result[courseID] = sectionCode
        }

        return result
    }

    function solutionRating(solution) {
        var common = 0

        for (var courseID in solution) {
            var sectionCode = solution[courseID]
            if (courseID === bonusCourseID && sectionCode == bonusSectionCode) {
                common += 100000
            }
            if (sectionCode == obj.data.courses[courseID].section) {
                common++
            }
        }

        return common
    }

    function applySolution(solution) {
        for (var courseID in solution) {
            var sectionCode = solution[courseID]
            obj.data.courses[courseID].section = sectionCode
        }
    }

    function conflictCheck() {
        recompute()
        var len = selectedSectionIDs.length
        var conflict = false
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < i; j++) {
                if (edgeMatrix
                    [sectionIndexOf[selectedSectionIDs[i]]]
                    [sectionIndexOf[selectedSectionIDs[j]]]
                    == 0
                ) {
                    conflict = true
                    break
                }
            }
        }
        if (conflict) {
            // console.log('conflict found.');
            if (conflictAlertOn) {
                // alert('A conflict was detected.')
            }
            var bestSolution = null
            var bestRating = -1
            for (var i = 0, len = allSolutions.length; i < len; i++) {
                var solution = allSolutions[i]
                // console.log(solution);
                var rating = solutionRating(solution)
                if (rating > bestRating) {
                    bestSolution = solution
                    bestRating = rating
                }
            }
            if (bestSolution) {
                applySolution(bestSolution)
            }
            else {
                // TODO
                // no solution exists.
                alert('This schedule contains unsolvable conflict.')
            }
        }
        else {
            // console.log('conflict not found.');
        }
    }

    obj.addCourse = function (course) {
        // console.log(course);
        if (course.meeting_sections.length == 0 || course.meeting_sections[0].times.length == 0) {
            alert('This course has no section data.')
            return
        }
        obj.data.courses[course.id] = {
            data: course,
            section: course.meeting_sections[0].code
        }
        conflictCheck()
        obj.dispatchChanges()
    }
    
    obj.changeSection = function (courseID, sectionCode) {
        obj.data.courses[courseID].section = sectionCode
        
        conflictAlertOn = true
        bonusCourseID = courseID
        bonusSectionCode = sectionCode
        
        conflictCheck()
        
        conflictAlertOn = false
        bonusCourseID = null
        bonusSectionCode = null
        
        obj.dispatchChanges()
    }

    obj.removeCourse = function (courseID) {
        delete obj.data.courses[courseID]
        conflictCheck()
        obj.dispatchChanges()
    }

    obj.removeAllCourses = function () {
        obj.data.courses = {}
        obj.dispatchChanges()
    }

    obj.addObserver = function (handler) {
        observers.push(handler)
        handler(obj)
    }

    obj.dispatchChanges = function () {
        for (var i = 0, len = observers.length; i < len; i++) {
            observers[i](obj)
        }
        
        obj.saveData()
    }
    
    obj.onCoursesLoaded = function () {
        
    }
    
    obj.saveData = function () {
        if (!isMainUser || !obj.userID) {
            return
        }
        
        var url = {
            url: '/users/' + obj.userID,
            qs: {}
        }
        startLoading()
        requestPromise(url, obj.data, obj.userExists ? 'PUT' : 'POST')
        .then(function (err) {
            if (err) {
                // the user does not exist
                alert('Saving data failed.')
                console.log(err);
            }
            else {
                obj.userExists = true
            }
            endLoading()
        })
        .catch(function (err) {
            console.log(err);
            endLoading()
        })
    }
    
    obj.onUserChanged = function (userID, oldUserID, forceLoad) {
        obj.userID = userID
        
        if (!userID) {
            if (!isMainUser) {
                obj.clearData()
            }
            
            obj.friends = []
            
            obj.dispatchChanges()
            
            return
        }
        
        // loading courses
        // load only when: is not main user, or if current user data empty, or when user confirms
        
        var url = {
            url: '/users/' + userID,
            qs: {}
        }
        startLoading()
        requestPromise(url, null, 'GET')
        .then(function (data) {
            console.log(data);
            if (!data) {
                // the user does not exist
                obj.userExists = false
            }
            else {
                // the user already exists
                obj.userExists = true
            }
            return data
        })
        .then(function (data) {
            if (forceLoad
                || !isMainUser
                || $.isEmptyObject(obj.data.courses)
                || (
                    obj.userExists
                    &&
                    confirm('Do you want to load your existing schedule?')
                )
            ) {
                if (data && data.courses) {
                    obj.data = data
                }
                else {
                    obj.clearData()
                }
            }
            
            if (isMainUser) {
                obj.friends = []
                
                // TODO load background friends
                fbInterface.getFriends(function (fbFriends) {
                    var count = 0
                    for (var i = 0; i < fbFriends.data.length; i++) {
                        var friendID = fbFriends.data[i].id
                        var url = {
                            url: '/users/' + friendID,
                            qs: {}
                        }
                        requestPromise(url, null, 'GET')
                        .then(function (data) {
                            count++
                            if (data && data.courses) {
                                obj.friends.push(data)
                            }
                            if (count == fbFriends.data.length) {
                                obj.dispatchChanges()
                                endLoading()
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                            count++
                            if (count == fbFriends.data.length) {
                                obj.dispatchChanges()
                                endLoading()
                            }
                        })
                    }
                })
            }
            else {
                obj.dispatchChanges()
                endLoading()
            }
            
        })
        .catch(function (err) {
            console.log(err);
            endLoading()
        })
        
    }

    return obj
}

var userData = newProfileData(true)
fbInterface.addObserver(function (userID) {
    userData.onUserChanged(userID, fbInterface.oldUserID)
})

var friendData = newProfileData(false)
fbInterface.addObserver(function (userID) {
    if (!userID) {
        friendData.onUserChanged(null, null)
    }
})
// TODO friend onUserChanged will be from manual clicking, and it CAN be null.

function refreshUserData() {
    userData.onUserChanged(fbInterface.currentUserID, fbInterface.oldUserID, true)
}

$(document).ready(function () {
    main(function () {
        // initialize facebook API
        window.fbAsyncInit = function() {
            FB.init({
                appId:   FB_APP_ID,
                cookie:  true,
                xfbml:   true,
                version: 'v2.11'
            });
            
            console.log('Facebook API initialized.');
            
            login.ifLoggedIn()
        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    })
});

