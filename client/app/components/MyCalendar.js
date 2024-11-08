import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import PlaceDetails from '../components/PlaceDetailsCalendar';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../styles/mycalendar.css";

const MyCalendar = () => {
    const localizer = momentLocalizer(moment);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');
    const router = useRouter();

    useEffect (() => {
        const token = Cookies.get("token");
        if (!token) {
            console.log("Please log in.");
            router.push("/login");
            return;
        }

        axios
            .get(process.env.NEXT_PUBLIC_SERVER_URL + '/api/v1/user-plans/plan-data', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setPlans(response.data.data.userPlans);
                // console.log(response.data.data.userPlans);
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
            });

    }, [router]);

    const events = plans.map(plan => {
        const [year, month, day] = plan.date.split('-');
        const [hour, minute] = plan.time.split(':');
        const startDate = new Date(year, month - 1, day, hour, minute);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        return {
            title: plan.Restaurant.dba,
            start: startDate,
            end: endDate,
            allDay: false,
            camis: plan.camis,
            id: plan.id,
        }
    })

    const handleDate = (date) => {
        setDate(date);
    };
    const handleView = (view) => {
        setView(view);
    };

    const handleEventClick = (event) => {
        const camis = event.camis;
        const start = event.start;
        const end = event.end;
        const id = event.id;
        setSelectedPlan({camis, start, end, id});
    };
    const closePlanDetails = () => {
        setSelectedPlan(null);
    };

    // Custom styling for events
    const eventPropGetter = (event) => {
        const isToday = moment(event.start).isSame(moment(), 'day');
        const isPast = moment(event.start).isBefore(moment(), 'day');
        if(isToday && view !== 'agenda') {
            return {
                style: {
                    backgroundColor: '#2e7a40', // Highlight color for today
                    color: 'white',
                    borderRadius: '5px',
                    border: 'none',
                    padding: '2px 5px'
                }
            };
        }
        else if(isPast && view !== 'agenda') {
            return {
                style: {
                    backgroundColor: '#c7c7c7', // Highlight color for today
                    color: 'white',
                    borderRadius: '5px',
                    border: 'none',
                    padding: '2px 5px'
                }
            };
        }
    };

    return (
        <div className="calendar-container">
            <h2>My Planner</h2>
            <Calendar
                style={{ height: 700, width: 1000}}
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                date={date}
                view={view}
                onNavigate={handleDate}
                onView={handleView}
                onSelectEvent={handleEventClick}
                eventPropGetter={eventPropGetter} // Apply custom styles to events
                />
            {selectedPlan && (
                <PlaceDetails
                    camis={selectedPlan.camis}
                    onClose={closePlanDetails}
                    start={selectedPlan.start}
                    end={selectedPlan.end}
                    id={selectedPlan.id}
                />
            )}    
        </div>
    );

}

export default MyCalendar;