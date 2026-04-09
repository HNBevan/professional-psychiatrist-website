// Booking System JavaScript
const BookingSystem = (() => {
    // State
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    let selectedService = null;

    // Available time slots (office hours)
    const timeSlots = {
        weekday: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'],
        friday: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM']
    };

    // Service names mapping
    const serviceNames = {
        'evaluation': 'Psychiatric Evaluation',
        'medication': 'Medication Management',
        'therapy': 'Psychotherapy',
        'telepsychiatry': 'Telepsychiatry',
        'couples': 'Couples Counseling',
        'group': 'Group Therapy'
    };

    // Initialize mock booked appointments (for demo)
    const initMockBookings = () => {
        const existingBookings = localStorage.getItem('bookings');
        if (!existingBookings) {
            const today = new Date();
            const mockBookings = [];

            // Add some mock bookings for the next few weeks
            for (let i = 1; i <= 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                // Skip weekends
                if (date.getDay() === 0 || date.getDay() === 6) continue;

                // Add 2-4 random bookings per day
                const numBookings = Math.floor(Math.random() * 3) + 2;
                const daySlots = date.getDay() === 5 ? [...timeSlots.friday] : [...timeSlots.weekday];

                for (let j = 0; j < numBookings && daySlots.length > 0; j++) {
                    const randomIndex = Math.floor(Math.random() * daySlots.length);
                    const slot = daySlots.splice(randomIndex, 1)[0];
                    mockBookings.push({
                        date: date.toDateString(),
                        time: slot,
                        service: Object.keys(serviceNames)[Math.floor(Math.random() * 4)]
                    });
                }
            }

            localStorage.setItem('bookings', JSON.stringify(mockBookings));
        }
    };

    // Get booked slots for a specific date
    const getBookedSlots = (date) => {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        return bookings
            .filter(b => b.date === date.toDateString())
            .map(b => b.time);
    };

    // Save a new booking
    const saveBooking = (booking) => {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
    };

    // Render calendar
    const renderCalendar = () => {
        const calendarDays = document.getElementById('calendarDays');
        const currentMonth = document.getElementById('currentMonth');

        if (!calendarDays || !currentMonth) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonth.textContent = new Date(year, month).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let html = '';

        // Empty cells for days before the first day
        for (let i = 0; i < startingDay; i++) {
            html += '<span class="calendar-day empty"></span>';
        }

        // Days of the month
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const isPast = date < today;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();

            let classes = 'calendar-day';
            if (isPast) classes += ' past';
            if (isWeekend) classes += ' weekend';
            if (isSelected) classes += ' selected';
            if (isToday) classes += ' today';
            if (!isPast && !isWeekend) classes += ' available';

            html += `<span class="${classes}" data-date="${date.toISOString()}">${day}</span>`;
        }

        calendarDays.innerHTML = html;

        // Add click handlers
        document.querySelectorAll('.calendar-day.available').forEach(day => {
            day.addEventListener('click', () => selectDate(new Date(day.dataset.date)));
        });
    };

    // Select a date
    const selectDate = (date) => {
        selectedDate = date;
        selectedTime = null;

        // Update calendar display
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        document.querySelector(`[data-date="${date.toISOString()}"]`)?.classList.add('selected');

        // Update time slots
        renderTimeSlots();

        // Update button state
        updateStep2Button();
    };

    // Render time slots
    const renderTimeSlots = () => {
        const container = document.getElementById('timeslots');
        const label = document.getElementById('selectedDateLabel');

        if (!container || !label || !selectedDate) return;

        const dayOfWeek = selectedDate.getDay();
        const slots = dayOfWeek === 5 ? timeSlots.friday : timeSlots.weekday;
        const bookedSlots = getBookedSlots(selectedDate);

        label.textContent = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });

        let html = '<div class="timeslots-grid">';

        slots.forEach(slot => {
            const isBooked = bookedSlots.includes(slot);
            const isSelected = selectedTime === slot;

            let classes = 'timeslot';
            if (isBooked) classes += ' booked';
            if (isSelected) classes += ' selected';
            if (!isBooked) classes += ' available';

            html += `
                <button class="${classes}" data-time="${slot}" ${isBooked ? 'disabled' : ''}>
                    ${slot}
                    ${isBooked ? '<span class="booked-label">Booked</span>' : ''}
                </button>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Add click handlers
        document.querySelectorAll('.timeslot.available').forEach(slot => {
            slot.addEventListener('click', () => selectTime(slot.dataset.time));
        });
    };

    // Select a time
    const selectTime = (time) => {
        selectedTime = time;

        document.querySelectorAll('.timeslot').forEach(s => s.classList.remove('selected'));
        document.querySelector(`[data-time="${time}"]`)?.classList.add('selected');

        updateStep2Button();
    };

    // Update step 2 continue button state
    const updateStep2Button = () => {
        const btn = document.getElementById('toStep3');
        if (btn) {
            btn.disabled = !selectedDate || !selectedTime;
        }
    };

    // Navigate steps
    const goToStep = (stepNum) => {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index < stepNum);
            step.classList.toggle('completed', index < stepNum - 1);
        });

        // Show/hide step content
        document.querySelectorAll('.booking-step-content').forEach((content, index) => {
            content.classList.toggle('hidden', index !== stepNum - 1);
        });

        // Update summary if going to step 3
        if (stepNum === 3) {
            updateSummary();
        }
    };

    // Update booking summary
    const updateSummary = () => {
        document.getElementById('summaryService').textContent = serviceNames[selectedService] || '-';
        document.getElementById('summaryDate').textContent = selectedDate ?
            selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '-';
        document.getElementById('summaryTime').textContent = selectedTime || '-';
    };

    // Confirm booking
    const confirmBooking = () => {
        const form = document.getElementById('bookingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Save the booking
        saveBooking({
            date: selectedDate.toDateString(),
            time: selectedTime,
            service: selectedService,
            firstName: document.getElementById('bookFirstName').value,
            lastName: document.getElementById('bookLastName').value,
            email: document.getElementById('bookEmail').value,
            phone: document.getElementById('bookPhone').value
        });

        // Show confirmation modal
        const modal = document.getElementById('confirmationModal');
        document.getElementById('modalService').textContent = serviceNames[selectedService];
        document.getElementById('modalDate').textContent = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
        document.getElementById('modalTime').textContent = selectedTime;
        modal.classList.remove('hidden');
    };

    // Initialize
    const init = () => {
        initMockBookings();
        renderCalendar();

        // Service selection
        document.querySelectorAll('input[name="service"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                selectedService = e.target.value;
                document.getElementById('toStep2').disabled = false;
            });
        });

        // Step navigation
        document.getElementById('toStep2')?.addEventListener('click', () => goToStep(2));
        document.getElementById('backToStep1')?.addEventListener('click', () => goToStep(1));
        document.getElementById('toStep3')?.addEventListener('click', () => goToStep(3));
        document.getElementById('backToStep2')?.addEventListener('click', () => goToStep(2));

        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // Confirm booking
        document.getElementById('confirmBooking')?.addEventListener('click', confirmBooking);

        // Close modal
        document.getElementById('closeModal')?.addEventListener('click', () => {
            document.getElementById('confirmationModal').classList.add('hidden');
            // Reset and go back to step 1
            selectedDate = null;
            selectedTime = null;
            selectedService = null;
            document.querySelectorAll('input[name="service"]').forEach(r => r.checked = false);
            document.getElementById('bookingForm').reset();
            document.getElementById('toStep2').disabled = true;
            goToStep(1);
            renderCalendar();
        });
    };

    return { init };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', BookingSystem.init);
