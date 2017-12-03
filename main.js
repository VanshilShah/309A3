

var components = [
    'navbar',
    'login',
    'courses',
    'about',
    'friends'
]

var FB_APP_ID = '1664665356936852'
var DOMAIN_NAME = 'https://shareschedule.herokuapp.com/'


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

    obj.dataToEvents = function (data) {
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
                    var event = {
                        id: courseInfo.data.id,
                        title: courseInfo.data.code + '\n' + section.code + '\n' + section.times[i].location,
                        start: `2017-05-0${section.times[i].day}T${section.times[i].startStr}`,
                        end: `2017-05-0${section.times[i].day}T${section.times[i].endStr}`,
                        color: colors[cnt]
                    }
                    events.push(event)
                }
                cnt = (cnt + 1) % colors.length
            }
        }

        return events
    }

    obj.onDataChanged = function (data) {
        obj.setEvents(obj.dataToEvents(data))
    }

    return obj
}

function main() {
    loadComponents()
    console.log('main function called.')
}

function loadComponents() {
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

            })
        })
        })()
    }
}

var userData = (function () {
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

    obj.data = {
        /*
        dictionary, key = courseID, value = {
            data: course data object,
            section: section code (null if not yet selected)
        }
        */
        courses: {},
    }

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
        handler(obj.data)
    }

    obj.dispatchChanges = function () {
        for (var i = 0, len = observers.length; i < len; i++) {
            observers[i](obj.data)
        }
    }

    return obj
})()

// initialize facebook API
window.fbAsyncInit = function() {
    FB.init({
        appId            : FB_APP_ID,
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v2.11'
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

var fbInterface = (function(){
    var obj = {}
    
    var loginState = null
    
    obj.checkLoginState = function (callback) {
        FB.getLoginStatus(function(response) {
            loginState = response
            callback(response)
        });
    }

    return obj
})()

$(document).ready(main);
