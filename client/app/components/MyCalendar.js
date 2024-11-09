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
                console.log(response.data.data.userPlans);
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
            });

    }, [router]);

    const events = plans.map(plan => {
        // console.log(plan);
        const [year, month, day] = plan.date.split('-');
        const [hour, minute] = plan.time.split(':');
        const startDate = new Date(year, month - 1, day, hour, minute);
        if(plan.eventType ==='Self Event'){
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);

            return {
                title: plan.Restaurant.dba,
                start: startDate,
                end: endDate,
                allDay: false,
                camis: plan.camis,
                id: plan.id,
                eventType: plan.eventType,
            }
        }
        else {
            const [e_year, e_month, e_day] = plan.endDate.split('-');
            const [e_hour, e_minute] = plan.endTime.split(':');
            const endDate = new Date(e_year, e_month - 1, e_day, e_hour, e_minute);

            return {
                title: plan.eventName,
                start: startDate,
                end: endDate,
                allDay: false,
                id: plan.id,
                eventType: plan.eventType,
            }
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
        if(camis && start && end && id) {
            setSelectedPlan({camis, start, end, id});
        }
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
        else if(event.eventType ==='NYC Event' && view !== 'agenda') {
            return {
                style: {
                    backgroundColor: '#db8000', // Highlight color for NYC events
                    color: 'white',
                    borderRadius: '5px',
                    border: 'none',
                    padding: '2px 5px'
                }
            };
        }
    };

    return (
        <div>
            <div className="key-div">
                <h2>Key</h2>
                <span className="key-element"> 
                    <div className="box"  style={{backgroundColor: '#db8000'}}> </div>
                    <p className="event">NYC Events</p>
                </span>
                <span className="key-element"> 
                    <div className="box"  style={{backgroundColor: 'var(--accent-color)'}}> </div>
                    <p className="event">Restaurants</p>
                </span>
            </div>
            <div className="calendar-container">
                <h2>My Planner</h2>
                <div>
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
                </div>
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
        </div>
    );

}

export default MyCalendar;