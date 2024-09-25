function createICalEvent(event) {
    var summary = event.summary;
    var description = event.description;
    var location = event.location || '';
    var start = event.start;
    var end = event.end;
    var isAllDay = event.isAllDay || false;

    var startLine = isAllDay ? 'DTSTART;VALUE=DATE:' + start : 'DTSTART:' + start;
    var endLine = isAllDay ? 'DTEND;VALUE=DATE:' + end : 'DTEND:' + end;
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