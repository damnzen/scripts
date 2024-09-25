function formatDate(date) {
    var year = date.getUTCFullYear();
    var month = String(date.getUTCMonth() + 1).padStart(2, '0');
    var day = String(date.getUTCDate()).padStart(2, '0');
    var hours = String(date.getUTCHours()).padStart(2, '0');
    var minutes = String(date.getUTCMinutes()).padStart(2, '0');
    var seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return {
        datetime: year + month + day + 'T' + hours + minutes + seconds + 'Z', // 'YYYYMMDDTHHMMSSZ'形式
        date: year + month + day // 'YYYYMMDD'形式
    };
}

function createICalEvent(event) {
    var summary = event.summary;
    var description = event.description;
    var location = event.location || '';
    var start = event.start instanceof Date ? formatDate(event.start).datetime : event.start;
    var end = event.end instanceof Date ? formatDate(event.end).datetime : event.end;
    var isAllDay = event.isAllDay || false;

    var startLine = isAllDay ? 'DTSTART;VALUE=DATE:' + formatDate(event.start).date : 'DTSTART:' + start;
    var endLine = isAllDay ? 'DTEND;VALUE=DATE:' + formatDate(event.end).date : 'DTEND:' + end;
    var locationLine = location ? 'LOCATION:' + location : '';

    return [
        'BEGIN:VEVENT',
        'SUMMARY:' + summary,
        'DESCRIPTION:' + description,
        locationLine,
        startLine,
        endLine,
        'END:VEVENT'
    ].filter(function(line) {
        return line; // 空行をフィルタリング
    }).join('\n');
}

function createICal() {
    var events = [];

    return {
        addEvent: function(event) {
            events.push(event);
        },
        toString: function() {
            var header = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Your Organization//Your Product//EN'
            ];
            var eventStrings = events.map(function(event) {
                return createICalEvent(event);
            });
            return header.concat(eventStrings, 'END:VCALENDAR').join('\n');
        },
        generateFile: function() {
            var icalString = this.toString();
            var blob = new Blob([icalString], { type: 'text/calendar' });
            return URL.createObjectURL(blob);
        }
    };
}