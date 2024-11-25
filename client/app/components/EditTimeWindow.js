import { useState, useEffect} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";

const EditTimeWindow = ({ onClose, id , start, end, eventType, onTimeUpdate }) => { 
    const [updatePlanFrom, setUpdatePlanForm] = useState({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        eventType: eventType,
    });


    useEffect(() => {
        if (start && end) {
            const startDate = start.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
            const endDate = end.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
            const startTime = start
                ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
            const endTime = end
                ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''; 

            const formattedStartDate = new Date(startDate).toLocaleDateString('en-CA');
            const formattedEndDate = new Date(endDate).toLocaleDateString('en-CA');

            const convertTo24HourFormat = (time) => {
                const [timePart, modifier] = time.split(" ");
                let [hours, minutes] = timePart.split(":");
                if (modifier === "PM" && hours !== "12") {
                    hours = parseInt(hours, 10) + 12;
                } else if (modifier === "AM" && hours === "12") {
                    hours = "00";
                }
                return `${hours}:${minutes}`;
            };
            const formattedStartTime = convertTo24HourFormat(startTime);
            const formattedEndTime = convertTo24HourFormat(endTime);

            console.log(formattedStartDate, formattedStartTime, formattedEndDate, formattedEndTime)
            setUpdatePlanForm({
                startDate: formattedStartDate,
                startTime: formattedStartTime,
                endDate: formattedEndDate,
                endTime: formattedEndTime,
            });
        }

    }, [start, end])
        
    const handleChange = (e) => {
        if (e && e.target) { // Ensure e.target exists
            const { name, value } = e.target;
            setUpdatePlanForm((prevForm) => ({
                ...prevForm,
                [name]: value,
            }));
        } else {
            console.error("handleChange received an invalid event:", e);
        }
    };

    const handleSubmit = (formData) => {
        
        if(!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime ){
            toast.warn("Fill in all date and time fields");
            return;
        }

        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        if (startDateTime > endDateTime) {
            toast.warn("Start time cannot be after end time. Please adjust the times.");
            return;
        }

        const requestData = {
            date: formData.startDate,
            time: formData.startTime,
            endDate: formData.endDate,
            endTime: formData.endTime,
            eventType: "Self Event"
        }

        const token = Cookies.get("token");
        axios
            .put(process.env.NEXT_PUBLIC_SERVER_URL + `/api/v1/user-plans/update?id=${id}`, 
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {
                if(response.data.status === 'success'){
                    toast.success('successfully updated');          
                    onTimeUpdate(startDateTime, endDateTime); 
                    onClose(); // Close the EditTimeWindow
                }
               
            })
            .catch((err) => {
                console.error("Error", err);
            });

    }
    return(
        <div className="info-window-content">
        <button className="close-button" onClick={onClose}>X</button>
        <div className='save-change'>
        <FontAwesomeIcon
                icon={faSave}
                className='save-icon'
                onClick={ () => handleSubmit(updatePlanFrom) }
            />
        <h3>{'Edit time'}</h3>
        </div>
        {/* Date and time */}
            <p>start time</p>
            <div className="date-time-container">
                <br />
                <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={updatePlanFrom.startDate}
                    onChange={handleChange}
                />
                <input
                    type="time"
                    name="startTime"
                    id="startTime"
                    value={updatePlanFrom.startTime}
                    onChange={handleChange}
                />
            </div>
            <br />
            <p>end time</p>
            <div className="date-time-container">
                <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={updatePlanFrom.endDate}
                    onChange={handleChange}
                />
                <input
                    type="time"
                    name="endTime"
                    id="endTime"
                    value={updatePlanFrom.endTime}
                    onChange={handleChange}
                />
            </div>
            <br />
        </div>
    )
}

export default EditTimeWindow;