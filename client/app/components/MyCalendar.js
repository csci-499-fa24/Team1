import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import PlaceDetails from '../components/PlaceDetailsCalendar';
import EditTimeWindow from "./EditTimeWindow";
import { createEvents } from 'ics';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../styles/mycalendar.css";

const MyCalendar = () => {
    const localizer = momentLocalizer(moment);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [overlappingEvents, setOverlappingEvents] = useState([]);
    const [isUpdatePlan, setIsUpdatePlan] = useState(false);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [error, setError] = useState('');
    const router = useRouter();
    

    // State for sidebar
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle Sidebar Click
    const handleSidebarClick = () => {
        setIsSidebarExpanded((prev) => !prev); // Toggle expand/collapse
    };

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
    
            if (plan.eventType === 'Self Event') {
                const endDate = new Date(startDate);
                if (plan.endDate !== null && plan.endTime !== null) {
                    const [e_year, e_month, e_day] = plan.endDate.split('-');
                    const [e_hour, e_minute] = plan.endTime.split(':');
                    endDate.setFullYear(e_year, e_month - 1, e_day);
                    endDate.setHours(e_hour, e_minute);
                } else {
                    endDate.setHours(endDate.getHours() + 1); // Default duration to 1 hour if no end time specified
                }
    
                return {
                    title: plan.Restaurant ? plan.Restaurant.dba : "No Restaurant Info",
                    start: startDate,
                    end: endDate,
                    allDay: false,
                    camis: plan.camis,
                    id: plan.id,
                    eventType: plan.eventType,
                };
            } else {
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


    const handleEditPlanClick = () => {
        setIsUpdatePlan(true);
    }

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
        const eventType = event.eventType;
        // restaurant
        const camis = event.camis;
        // nyc event
        const title = event.title;
        console.log(name);

        if(event.eventType === 'Self Event') {
            setSelectedEvent(null);
            setIsUpdatePlan(false);
            setSelectedPlan({camis, start, end, id, eventType});
        }
        else if (event.eventType === 'NYC Event'){
            setSelectedPlan(null);
            setIsUpdatePlan(false);
            setSelectedEvent({title, start, end, id, eventType});
        }
    };
    const closePlanDetails = () => {
        setSelectedPlan(null);
    };
    const closeEventDetails = () => {
        setSelectedEvent(null);
    };
    const closeEditDetails = () => {
        setIsUpdatePlan(false);
    };

    // Custom styling for events
    const eventPropGetter = (event) => {
        const isPast = moment(event.end).isBefore(moment(), 'day');
        const isConflicting = overlappingEvents.some(([prevEvent, currEvent]) =>
            prevEvent.id === event.id || currEvent.id === event.id
        );
    
        let className = '';
    
        if (isConflicting && !isPast) {
            className += 'conflicting-event ';
        }
        if (isPast) {
            className += 'past-event ';
        } else if (event.eventType === 'NYC Event') {
            className += 'nyc-event ';
        } else {
            className += 'self-event ';
        }
    
        return {
            className: className.trim(),
        };
    };
    

     // Update the `plans` state to reflect the new start and end times
    const onUpdateEventTime = (id, newStart, newEnd) => {
        setPlans(prevPlans =>
            prevPlans.map(plan =>
                plan.id === id
                    ? {
                          ...plan,
                          date: `${newStart.getFullYear()}-${String(newStart.getMonth() + 1).padStart(2, '0')}-${String(newStart.getDate()).padStart(2, '0')}`,
                          time: `${String(newStart.getHours()).padStart(2, '0')}:${String(newStart.getMinutes()).padStart(2, '0')}`,
                          endDate: `${newEnd.getFullYear()}-${String(newEnd.getMonth() + 1).padStart(2, '0')}-${String(newEnd.getDate()).padStart(2, '0')}`,
                          endTime: `${String(newEnd.getHours()).padStart(2, '0')}:${String(newEnd.getMinutes()).padStart(2, '0')}`
                      }
                    : plan
            )
        );
    
        // Optionally, close any edit modes or dialogs
        setIsUpdatePlan(false);
    };

    //handle deleted plans
    const handleDelete = (deletedPlanId) => {
        setPlans((prevPlans) => prevPlans.filter(plan => plan.id !== deletedPlanId));
    };


    // ICS = standardized file that stores calendar information; opens with Calendar
    const exportToICS = () => {
        const formattedEvents = plans.map(plan => {
            const [year, month, day] = plan.date.split('-');
            const [hour, minute] = plan.time.split(':');
            const startDate = new Date(year, month - 1, day, hour, minute);
            const duration = plan.duration || 1;
            const endDate = new Date(startDate);
            endDate.setHours(startDate.getHours() + duration);
        
            return {
                title: plan.Restaurant ? plan.Restaurant.dba : "No Restaurant Info",
                start: [parseInt(year), parseInt(month), parseInt(day), parseInt(hour), parseInt(minute)],
                end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()],
                description: plan.Restaurant ? `Planned event at ${plan.Restaurant.dba}` : "Planned event",
                location: plan.Restaurant ? plan.Restaurant.location : "No location available",
            };
        });
        

        createEvents(formattedEvents, (error, value) => {
            if (!error) {
                const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
                saveAs(blob, 'my_calendar.ics');
            } else {
                console.error("ICS Generation Error:", error);
            }
        });
    };

    return (
        <div className='whole-calendar-container'>
            
            {/* Sidebar */}
            <div
                className={`key-div ${isSidebarExpanded ? "expanded" : ""}`}
                onClick={handleSidebarClick}
            >
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
                
                <div>
                    <hr style={{margin: '5px 0px 5px 0px'}}></hr>
                    <span className="key-element"> 
                        <div className="box"  style={{borderColor: 'red'}}> </div>
                        <p className="event">Conflicting Plans</p>
                    </span>
                </div>
            
            </div>

            <div className={`calendar-container ${isSidebarExpanded ? "sidebar-expanded" : ""}`}>
            
                <div class="header-container">
                    <FontAwesomeIcon
                        icon={faBars}
                        onClick={handleSidebarClick} // Attach the click handler
                        className="toggle-sidebar-icon"
                    />
                    <button onClick={exportToICS} className="export-button">Export to .ics</button>
                </div>
                
                <Calendar
                    style={{ height: 700, width: '100%' }}
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
                {(selectedPlan || selectedEvent) && (
                    <div>
                        <PlaceDetails
                            camis={selectedPlan ? selectedPlan.camis : null}
                            eventTitle={selectedEvent ? selectedEvent.title : selectedPlan?.title}
                            onClose={selectedPlan ? closePlanDetails : closeEventDetails}
                            start={selectedPlan ? selectedPlan.start : selectedEvent?.start}
                            end={selectedPlan ? selectedPlan.end : selectedEvent?.end}
                            id={selectedPlan ? selectedPlan.id : selectedEvent?.id}
                            eventType={selectedPlan ? selectedPlan.eventType : null}
                            isEvent={!!selectedEvent} // Boolean to indicate if it's an event
                            onEditClick={selectedPlan ? handleEditPlanClick : null}
                            onUpdate={selectedPlan ? onUpdateEventTime : null}
                            //onDelete={selectedPlan ? handleDelete : null}
                            onDelete={selectedPlan || selectedEvent ? handleDelete : null}
                        />
                    </div>
                )}           
            </div>
        </div>
    );

}

export default MyCalendar;
