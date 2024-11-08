import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../styles/mycalendar.css";

const MyCalendar = () => {
    const localizer = momentLocalizer(moment);

    return (
        <div className="calendar-container">
            <Calendar
                localizer={localizer}
                events={[]}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 750, width: 1000}}
                />
        </div>
    );

}

export default MyCalendar;