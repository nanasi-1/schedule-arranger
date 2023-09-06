'use strict'

import $ from "jquery";

console.log('予定調整くんへようこそ！');
$('.ava-toggle-btn').each((i, e) => {
    const button = $(e); // button = JQuery式オブジェクト、e = DOMElement
    button.on('click', () => {
        const scheduleId = button.data('schedule-id');
        const candidateId = button.data('candidate-id');
        const availability = parseInt(button.data('availability'));
        const nextAvailability = (availability + 1) % 3;
        $.post(`/schedules/${scheduleId}/candidates/${candidateId}`,
            { availability: nextAvailability },
            (data) => {
                button.data('availability', data.availability);
                const availabilityLabels = ['欠席', '？', '出席'];
                button.text(availabilityLabels[data.availability]);
            }
        );
    });
});