var calendarPage = (function () {
    var obj = {}
    var calendar = $('#calendar')
    var coursesList = $('#courses-list')

    var calendarEvents = []

    calendar.fullCalendar({
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
        eventSources: [
            {
                events: function(start, end, timezone, callback) {
                    callback(calendarEvents)
                }
            }
        ]
    })

    // for each session:
    // int day: day of week, 1, 2, 3, 4, 5
    // int start: start hour of day
    // int end: end hour of day
    obj.setSessions = function (sessions) {
        calendarEvents.length = 0
        for (var i = 0, len = sessions.length; i < len; i++) {
            calendarEvents.push(sessions[i])
        }
        calendar.fullCalendar('refetchEvents')
    }

    obj.clearCourses = function () {
        coursesList.empty()
    }

    obj.showLoading = function () {
        obj.clearCourses()
        coursesList.append(`
        <h4 class="center-text"><b>Loading...</b></h4>
        `)
    }

    obj.showEmpty = function () {
        obj.clearCourses()
        coursesList.append(`
        <h4 class="center-text"><b>No Matches</b></h4>
        `)
    }

    obj.showError = function () {
        obj.clearCourses()
        coursesList.append(`
        <h4 class="center-text"><b>Error</b></h4>
        `)
    }

    obj.loadCourses = function (courses, fetchSucceeded) {
        obj.clearCourses()

        if (!fetchSucceeded) {
            obj.showError()
            return
        }

        if (courses.length == 0) {
            obj.showEmpty()
            return
        }

        for (var i = 0, len = courses.length; i < len; i++) {
            var course = courses[i]

            obj.appendCourse({
                title: course.code,
                campus: course.campus,
                term: course.term
            })
        }
    }

    obj.appendCourse = function (course) {
        coursesList.append(`
        <div class="course-item">
            <h4 class="center-text"><b>${course.title}</b></h4>
            <p class="center-text">${course.campus}</p>
            <p class="center-text">${course.term}</p>
        </div>
        `)
    }

    var sessions = [
        {
            title: 'test',
            start:'2017-05-01T12:00:00',
            end:'2017-05-01T14:00:00',
            color: '#ff8800'
        },
        {
            title: 'test2',
            start:'2017-05-01T12:00:00',
            end:'2017-05-01T14:00:00'
        }
    ]
    obj.setSessions(sessions)

    return obj
})()

var cobaltAPI = (function () {
    var obj = {}

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


    function requestPromise(url) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'GET',
                dataType: 'json',
                data: {},
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

    var fetching = false

    var apiKey = 'yOm6EunUkWMKPJw2NBCYtbclohWSkHqp'
    var entries = 25

    obj.getCourses = function (query, terms, callback) {
        if (fetching) return

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
            url: 'https://cobalt.qas.im/api/1.0/courses/filter',
            qs: {
                q: filterString,
                limit: entries,
                key: apiKey
            }
        }

        requestPromise(url)
        .then(function (data) {
            fetching = false

            callback(data, true)
        })
        .catch(function (err) {
            fetching = false

            console.log('data fetch failed.');
            console.log(err)
            alert('Data fetching failed.\nTry \'chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security\' to bypass Same Origin Policy.')

            callback([], false)
        })

    }

    return obj
})()

$('#course-search-box').keydown(function (e) {
    var code = e.keyCode || e.which
    if (code == 13) { // enter pressed
        findCourse()
    }
})

var currentTerms = ['2018 Winter']

function findCourse(){
    var code = $('#course-search-box').val()
    calendarPage.showLoading()
    cobaltAPI.getCourses(code, currentTerms, calendarPage.loadCourses)
}

findCourse()
