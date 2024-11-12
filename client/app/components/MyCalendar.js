import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import PlaceDetails from '../components/PlaceDetailsCalendar';
import NYCEventDetails from '../components/NYCEventDetails';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../styles/mycalendar.css";

const MyCalendar = () => {
    const localizer = momentLocalizer(moment);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [overlappingEvents, setOverlappingEvents] = useState([]);
    const [isUpdatePlan, setIsUpdatePlan] = useState(false);
    const [updatePlanFrom, setUpdatePlanForm] = useState({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
    });
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

    const events = useMemo(() => {
        return plans.map(plan => {
            const [year, month, day] = plan.date.split('-');
            const [hour, minute] = plan.time.split(':');
            const startDate = new Date(year, month - 1, day, hour, minute);
            if(plan.eventType ==='Self Event'){
                if( plan.endDate !== null || plan.endTime !== null){
                    const [e_year, e_month, e_day] = plan.endDate.split('-');
                    const [e_hour, e_minute] = plan.endTime.split(':');
                    const endDate = new Date(e_year, e_month - 1, e_day, e_hour, e_minute);

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
                };
            }
        });
    }, [plans]);

    useEffect (() => {
        const findOverlap = (events) => {
            events.sort((a, b) => new Date(a.start) - new Date(b.start));
            const overlap = [];

            let prevEvent = events[0];
            for(let i = 1; i < events.length; i++){
                const currEvent = events[i];
                if (new Date(prevEvent.end) > new Date(currEvent.start)){
                    overlap.push([prevEvent, currEvent]);
                }

                prevEvent = currEvent;
            }
            if(events.length > 1) {
                setOverlappingEvents(overlap);
            }
        }
        findOverlap(events);
    }, [events]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatePlanForm((prevForm) => ({
          ...prevForm,
          [name]: value,
        }));
      };

    const handleDate = (date) => {
        setDate(date);
    };
    const handleView = (view) => {
        setView(view);
    };

    const handleEventClick = (event) => {
        const start = event.start;
        const end = event.end;
        const id = event.id;

        // restaurant
        const camis = event.camis;
        // nyc event
        const title = event.title;
        console.log(name);

        if(event.eventType === 'Self Event') {
            setSelectedEvent(null);
            setSelectedPlan({camis, start, end, id});
        }
        else if (event.eventType === 'NYC Event'){
            setSelectedPlan(null);
            setSelectedEvent({title, start, end, id});
        }
    };
    const closePlanDetails = () => {
        setSelectedPlan(null);
    };
    const closeEventDetails = () => {
        setSelectedEvent(null);
    };

    // Custom styling for events
    const eventPropGetter = (event) => {
        // const isToday = moment(event.start).isSame(moment(), 'day');
        const isPast = moment(event.end).isBefore(moment(), 'day');
        const isConflicting = overlappingEvents.some(([prevEvent, currEvent]) => 
            prevEvent.id === event.id || currEvent.id === event.id
        );

        let className = '';

        if(isConflicting && !isPast){
            className += 'conflicting-event ';
        }

        if(view !== 'agenda'){
            if(isConflicting && !isPast){
                className += 'conflicting-event ';
            }
            if(isPast) {
                className += 'past-event ';
            }
            else if(event.eventType ==='NYC Event') {
                className += 'nyc-event ';
            }
            else{
                className += 'self-event ';
            }
        }
        return {
            className: className.trim(),
        }
    };

    return (
        <div className='whole-calendar-container'>
            <div className="key-div">
                <h2>Key</h2>
                <span className="key-element"> 
                    <div className="box"  style={{backgroundColor: '#db8000'}}> </div>
                    <p className="event">NYC Events</p>
                </span>
                <span className="key-element"> 
                    <div className="box"  style={{backgroundColor: 'var(--accent-color)'}}> </div>
                    <p className="event">Restaurants & Bars</p>
                </span>
                <span className="key-element"> 
                    <div className="box"  style={{backgroundColor: '#c7c7c7'}}> </div>
                    <p className="event">Past Plans</p>
                </span>
                { overlappingEvents.length > 0 &&
                    <div>
                        <hr style={{margin: '5px 0px 5px 0px'}}></hr>
                        <span className="key-element"> 
                            <div className="box"  style={{borderColor: 'red'}}> </div>
                            <p className="event">Conflicting Plans</p>
                        </span>
                    </div>
                }
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
                {selectedEvent && (
                    <NYCEventDetails
                        title={selectedEvent.title}
                        onClose={closeEventDetails}
                        start={selectedEvent.start}
                        end={selectedEvent.end}
                        id={selectedEvent.id}
                    />
                )}
                {false && (
                    <div className="info-window-content">
                        <h3>{'Edit time'}</h3>

                        {/* Date and time */}
                            <p>start time</p>
                        <div className="date-time-container">
                            <br />
                            <input
                                type="date"
                                name="startDate"
                                id="startDate"
                                // value={selectedDate}
                                // onChange={(e) => handleChange(e.target.value)}
                            />
                            <input
                                type="time"
                                name="startTime"
                                id="startTime"
                                // value={selectedTime}
                                // onChange={(e) => handleChange(e.target.value)}
                            />
                        </div>
                        <br />
                        <p>end time</p>
                        <div className="date-time-container">
                            <input
                                type="date"
                                name="endDate"
                                id="endDate"
                                // value={selectedDate}
                                // onChange={(e) => handleChange(e.target.value)}
                            />
                            <input
                                type="time"
                                name="endTime"
                                id="endTime"
                                // value={selectedTime}
                                // onChange={(e) => handleChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );

}

export default MyCalendar;