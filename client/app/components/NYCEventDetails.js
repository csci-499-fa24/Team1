
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useDraggableCard } from './useDraggableCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


export default function PlaceDetails({ onClose , title, start, end, id}) {
    // Set dynamic initial position based on screen width
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const initialPosition = isMobile ? { x: 10, y: 80 } : { x: 1000, y: 200 };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cardPosition, handleDragStart } = useDraggableCard(initialPosition);

    useEffect(() => {
        setLoading(false);
    }, []);

    const deleteFromPlan = async (id) => {
        const token = Cookies.get("token");

        axios
            .delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/user-plans/remove/`, {
                params: { id },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                if(response.data.status === 'success'){
                    alert('successfully removed event from plan');
                }
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
            });
    };

    useEffect(() => { // close upon 'esc' key press
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    const handleRemovePlanClick = (id) => {
        if (!id) {
            alert('No ID for plan selected to remove');
        } else {
            deleteFromPlan(id);
        }
    };

    if (loading) return <div>Loading event details...</div>;
    if (error) return <div>{error}</div>;

    const startDate = start.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
    const endDate = end.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });

    const startTime = start
        ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
    const endTime = end
        ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div
            className="place-details"
            style={{ top: `${cardPosition.y}px`, left: `${cardPosition.x}px`, position: 'absolute' }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <button className="close-button" onClick={onClose}>X</button>
            <div className="icon-name-container">
                <FontAwesomeIcon
                    icon={faTrash}
                    className='remove-from-plan-icon'
                    style={{ cursor: 'pointer', color: '#db0909', height:'30px' }} 
                    onClick={() => handleRemovePlanClick(id)}
                />
                <h2>{title}</h2>
            </div>
            {startDate!='' && endDate!='' && startDate != endDate && <h2>{startDate} - {endDate}</h2>}
            {startTime!='' && endTime!='' && <h2>{startTime} - {endTime}</h2>}  {/* render the time interval if given */}

        </div>
    );
}

