var userCalendar = newCalendar('user-calendar', function (calEvent) {
    // TODO more functionality.
    editCourse(calEvent.id.split(':')[0])
})
userData.addObserver(userCalendar.onDataChanged)

var courseSelector = (function () {
    var obj = {}

    var pages = [
        'user-courses',
        'search-courses',
        'sections'
    ]

    var navStack = []

    var showPage = function (pageName) {
        for (var i = 0, len = pages.length; i < len; i++) {
            $('#' + pages[i]).removeClass('hidden')
            $('#' + pages[i]).hide()
        }
        $('#' + pageName).show()
    }

    obj.navToPage = function (pageName) {
        navStack.push(pageName)
        showPage(pageName)
    }

    obj.navBack = function () {
        if (navStack.length > 1) {
            navStack.pop()
            showPage(navStack[navStack.length - 1])
        }
    }

    obj.navHome = function () {
        navStack.length = 0
        obj.navToPage(pages[0])
    }

    obj.navToPage('user-courses')

    obj.searchCoursesList = $('#search-courses-list')
    obj.userCoursesList = $('#user-courses-list')
    obj.sectionsList = $('#sections-list')
    obj.sectionsTitle = $('#sections-title-course')
    obj.searchCoursesData = []
    obj.userCoursesData = []
    obj.sectionsData = []

    obj.editingCourse = null

    obj.clearCourses = function (coursesList) {
        coursesList.empty()
    }

    obj.showText = function (coursesList, message) {
        obj.clearCourses(coursesList)
        coursesList.append(`
        <h4 class="center-text"><b>` + message + `</b></h4>
        `)
    }

    obj.userCourseItem = function (course) {
        return `
        <div class="course-item primary-bg accent-bg-hover user-course-item text-on-primary" onclick="editCourse('${course.data.id}')">
            <h4 class="center-text"><b>${course.data.code}</b></h4>
            <p class="center-text">${course.data.campus}</p>
            <p class="center-text">${course.data.term}</p>
            <p class="center-text"><b>Section: ${course.section}</b></p>
        </div>
        `
    }

    obj.searchCourseItem = function (course) {
        return `
        <div class="course-item accent-bg primary-bg-hover text-on-primary" onclick="addCourse('${course.id}');">
            <p class="center-text">
              <b>${course.code}</b>
              &nbsp ${course.campus}-${course.term}</p>
        </div>
        `
    }

    obj.sectionItem = function (section) {
        if (section.data) {
            return `
            <div class="text-on-primary course-item section-item ${section.selected ? 'section-item-selected' : ''} accent-bg primary-bg-hover" onclick="changeSection('${section.courseID}', '${section.data.code}'); courseSelector.refreshCourseEdit()">
                <h4 class="center-text"><b>${section.data.code}</b></h4>
                <p class="center-text">${section.data.readableTime}</p>
            </div>
            `
        }
        else { // the delete button
            return `
            <div class="course-item section-item-remove" onclick="removeCourse('${section.courseID}'); courseSelector.navBack()">
                <h4 class="center-text"><b>(Remove)</b></h4>
            </div>
            `
        }
    }

    obj.editCourse = function (courseData) {
        obj.editingCourse = courseData
        obj.sectionsTitle.text(courseData.data.code)
        var sectionData = [{
            courseID: courseData.data.id,
            data: null
        }]
        var sections = courseData.data.meeting_sections
        for (var i = 0, len = sections.length; i < len; i++) {
            sectionData.push({
                courseID: courseData.data.id,
                selected: courseData.section == sections[i].code,
                data: sections[i]
            })
        }
        obj.loadList(sectionData, obj.sectionsList, obj.sectionsData, obj.sectionItem)
    }

    obj.refreshCourseEdit = function () {
        if (obj.editingCourse) {
            obj.editCourse(obj.editingCourse)
        }
    }

    var appendCourse = function (course, coursesList, itemDelegate) {
        coursesList.append(itemDelegate(course))
    }

    obj.loadList = function (courses, coursesList, coursesDataList, itemDelegate) {
        obj.clearCourses(coursesList)

        if (coursesDataList) {
            coursesDataList.length = 0
        }

        if (!courses) {
            obj.showText(coursesList, 'Error Loading Results')
            return
        }

        if (courses instanceof Array) {
            if (courses.length == 0) {
                obj.showText(coursesList, 'No Results')
                return
            }

            for (var i = 0, len = courses.length; i < len; i++) {
                var course = courses[i]
                appendCourse(course, coursesList, itemDelegate)
                if (coursesDataList) {
                    coursesDataList.push(course)
                }
            }
        }
        else {
            var i = 0
            for (var courseID in courses) {
                var course = courses[courseID]
                appendCourse(course, coursesList, itemDelegate)
                if (coursesDataList) {
                    coursesDataList.push(course)
                }
                i += 1
            }
            if (i == 0){
              obj.showText(coursesList, 'No Courses Selected')
            }
        }

    }

    obj.getCourseInList = function (courseID, coursesDataList) {
        var result = null

        for (var i = 0, len = coursesDataList.length; i < len; i++) {
            if (courseID == coursesDataList[i].id) {
                result = coursesDataList[i]
                break
            }
        }

        return result
    }

    function onDataChanged(data) {
        obj.loadList(data.data.courses, obj.userCoursesList, obj.userCoursesData, obj.userCourseItem)
    }
    
    function onUserChanged(userID) {
        obj.navHome()
    }

    userData.addObserver(onDataChanged)
    fbInterface.addObserver(onUserChanged)
    
    obj.searchCoursesList.slideUp();

    return obj
})()

var cobaltAPI = (function () {
    var obj = {}

    var fetching = false
    var queued = null

    var entries = 25

    function dayOfWeek(name) {
        switch (name) {
            case 'MONDAY':    return 1
            case 'TUESDAY':   return 2
            case 'WEDNESDAY': return 3
            case 'THURSDAY':  return 4
            case 'FRIDAY':    return 5
            case 'SATURDAY':  return 6
            case 'SUNDAY':    return 7
        }
        return 0
    }

    function dayOfWeekShort(name) {
        switch (name) {
            case 'MONDAY':    return 'Mon'
            case 'TUESDAY':   return 'Tue'
            case 'WEDNESDAY': return 'Wed'
            case 'THURSDAY':  return 'Thu'
            case 'FRIDAY':    return 'Fri'
            case 'SATURDAY':  return 'Sat'
            case 'SUNDAY':    return 'Sun'
        }
        return 0
    }

    function secondsToTime(seconds) {
        seconds = Math.floor(seconds)
        var hours = Math.floor(seconds / 3600)
        seconds -= hours * 3600
        var minutes = Math.floor(seconds / 60)
        seconds -= minutes * 60

        hours   = hours + ''
        minutes = minutes + ''
        seconds = seconds + ''
        if (hours.length < 2) hours = '0' + hours
        if (minutes.length < 2) minutes = '0' + minutes
        if (seconds.length < 2) seconds = '0' + seconds

        return hours + ':' + minutes + ':' + seconds
    }

    function readableSectionTime(rawSection) {
        var result = ''
        for (var i = 0, len = rawSection.times.length; i < len; i++) {
            if (i > 0) result += '  '
            result += dayOfWeekShort(rawSection.times[i].day)
            result += Math.floor(rawSection.times[i].start/3600) + '-' + Math.floor(rawSection.times[i].end/3600)
        }
        return result
    }

    obj.getCourses = function (query, terms, callback) {
        if (fetching) {
            queued = {
                query: query,
                terms: terms,
                callback: callback
            }
            return
        }

        queued = null

        fetching = true

        var filterString = ''

        var count = 0
        for (var i = 0; i < terms.length; ++i) {
            if (count > 0) {
                filterString += ' OR '
            }
            filterString += `term:"${terms[i]}"`
            count++
        }
        if (query.length > 0) {
            if (count > 0) {
                filterString += ' AND '
            }
            filterString += `code:"${query}"`
        }

        var url = {
            url: '/courses/filter',
            qs: {
                q: filterString,
                limit: entries
            }
        }

        requestPromise(url)
        .then(function (data) {
            fetching = false

            if (data) {
            for (var i = 0, len = data.length; i < len; i++) {
                var sections = data[i].meeting_sections
                for (var j = 0; j < sections.length; j++) {
                    var section = sections[j]
                    // TODO filter out tutorial. make this better
                    if (section.code.charAt(0) != 'L') {
                        sections.splice(j, 1)
                        j--
                        continue
                    }
                    // filter out section with no time
                    if (section.times.length == 0) {
                        sections.splice(j, 1)
                        j--
                        continue
                    }
                    section.readableTime = readableSectionTime(section)
                    for (var k = 0, len3 = section.times.length; k < len3; k++) {
                        section.times[k].day   = dayOfWeek(section.times[k].day)
                        section.times[k].startStr = secondsToTime(section.times[k].start)
                        section.times[k].endStr   = secondsToTime(section.times[k].end)
                    }
                }
            }
            }

            callback(data)

            if (queued) {
                obj.getCourses(queued.query, queued.terms, queued.callback)
            }
        })
        .catch(function (err) {
            fetching = false

            console.log('data fetch failed.');
            console.log(err)

            callback(null)

            if (queued) {
                obj.getCourses(queued.query, queued.terms, queued.callback)
            }
        })

    }

    return obj
})()

function closeSearchList() {
    courseSelector.searchCoursesList.slideUp(500);
}

function openSearchList() {
    courseSelector.searchCoursesList.slideDown(500);
}

function isKeyCodeAlnum(code) {
    return (48 <= code && code <= 57)|| (65 <= code && code <= 90) || (97 <= code && code <= 122)
}

$('#course-search-box').keydown(function (e) {
    var code = e.keyCode || e.which
    // if (code == 13){ // enter
        // findCourse();
    // }
    if (code == 27){ //escape character
        closeSearchList()
    }
})
$('#course-search-box').keyup(function (e) {
    var code = e.keyCode || e.which
    if (isKeyCodeAlnum(code) || code == 13 || code == 8) {
        // alnum, enter, backspace
        findCourse()
    }
})

var currentTerms = ['2018 Winter']

function findCourse(){
    var code = $('#course-search-box').val()
    courseSelector.showText(courseSelector.searchCoursesList, 'Loading')
    cobaltAPI.getCourses(code, currentTerms, function (courses) {
        courseSelector.loadList(courses, courseSelector.searchCoursesList, courseSelector.searchCoursesData, courseSelector.searchCourseItem)
        courseSelector.searchCoursesList.slideDown(500);
    })
}

function addCourse(courseID) {
    var course = courseSelector.getCourseInList(courseID, courseSelector.searchCoursesData)
    if (course) {
        userData.addCourse(course)
    }
}

function removeCourse(courseID) {
    userData.removeCourse(courseID)
}

function editCourse(courseID) {
    courseSelector.navHome()
    courseSelector.navToPage('sections')
    var courseData = userData.getCourseData(courseID)
    courseSelector.editCourse(courseData)
}

function changeSection(courseID, sectionCode) {
    userData.changeSection(courseID, sectionCode)
}
