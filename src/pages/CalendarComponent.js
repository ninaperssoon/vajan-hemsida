import React, { useState, useEffect } from 'react';
import { getDocs, collection, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase-config";

function CalendarComponent({ initialYear, isAuth }) {

    function generateCalendar(year) {
        const months = [
          'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
          'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
        ];
        
        const daysOfWeek = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
      
        const calendar = [];
      
        for (let month = 0; month < 12; month++) {
          // Beräkna antalet dagar i månaden
          const daysInMonth = new Date(year, month + 1, 0).getDate(); // Detta ger det rätta antalet dagar i månaden
      
          const monthData = { name: months[month], days: [] };
      
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            let dayOfWeek = date.getDay();
            dayOfWeek = (dayOfWeek + 6) % 7; // Justerar så att veckan börjar på måndag
      
            monthData.days.push({
              date: day,
              dayOfWeek: daysOfWeek[dayOfWeek],
            });
          }
      
          calendar.push(monthData);
        }
      
        return calendar;
    };
    
    const [currentYear, setCurrentYear] = useState(initialYear);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());

    const months = generateCalendar(currentYear);
    const currentMonthData = months[currentMonthIndex];
    const [events, setEvents] = useState([]);

    const handlePrevMonth = () => {
        if (currentMonthIndex === 0) {
        setCurrentMonthIndex(11);
        setCurrentYear(prevYear => prevYear - 1);
        } else {
        setCurrentMonthIndex(prevIndex => prevIndex - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonthIndex === 11) {
        setCurrentMonthIndex(0);
        setCurrentYear(prevYear => prevYear + 1);
        } else {
        setCurrentMonthIndex(prevIndex => prevIndex + 1);
        }
    };

    const firstDayOfWeek = currentMonthData.days[0].dayOfWeek;
    const daysOfWeek = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    const emptyDays = Array(daysOfWeek.indexOf(firstDayOfWeek)).fill(null);

    const getEvents = async () => {
        let collectionBSnapshot = '';
        let monthYear = '';
    
        if (String(currentMonthIndex + 1).length === 1) {
            const month = '0' + String(currentMonthIndex + 1);
            monthYear = String(currentYear) + '-' + month;
        } else {
            monthYear = String(currentYear) + '-' + String(currentMonthIndex + 1);
        }
    
        const docRef = collection(db, 'events', monthYear, 'eventList');
        collectionBSnapshot = await getDocs(docRef);
    
        const eventsData = collectionBSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    
        setEvents(eventsData);
    };

    // Funktion för att hantera borttagning av ett event
    const deleteEvent = async (eventId) => {
        try {
            const monthYear = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
            const eventRef = doc(db, 'events', monthYear, 'eventList', eventId);
            await deleteDoc(eventRef);
            // Uppdatera eventlistan efter borttagningen
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        } catch (error) {
            console.error("Error removing document: ", error);
        }
    };
    
    useEffect(() => {
        getEvents();
    }, [currentMonthIndex, currentYear]); // Ladda om eventen när månad eller år ändras
    

    return (
        <div className='calendar'>
            <div className='month-nav'>
                <button onClick={handlePrevMonth} className='month-btn'>&#8249;</button>
                <h3 className='mx-3'>{currentMonthData.name} {currentYear}</h3>
                <button onClick={handleNextMonth} className='month-btn'>&#8250;</button>
            </div>
            <div className='days-grid'>
                {daysOfWeek.map((day, index) => (
                    <div key={index} className='day-header'>
                        {day}
                    </div>
                ))}
    
                {emptyDays.map((_, index) => (
                    <div key={index} className='day-box empty'></div>
                ))}
    
                {currentMonthData.days.map((day, dayIndex) => {
                    const dayEvents = events.filter(event => new Date(event.date).getDate() === day.date);
    
                    return (
                        <div key={dayIndex} className='day-box px-3 py-2'>
                            <div className='justify-content-end row'>
                                <div className='day-date col-2'>
                                    {day.date}
                                </div>
                            </div>
                            <div className='row'>
                                {dayEvents.map(event => {
                                    let eventClass = '';
                                    switch (event.type) {
                                        case 'Vajans egna event':
                                            eventClass = 'event-type-vajans';
                                            break;
                                        case 'Samsittning':
                                            eventClass = 'event-type-samsittning';
                                            break;
                                        case 'Nationens event':
                                            eventClass = 'event-type-nationen';
                                            break;
                                        case 'Andra föreningars event':
                                            eventClass = 'event-type-andra';
                                            break;
                                        case 'Special event':
                                            eventClass = 'event-type-special';
                                            break;
                                        default:
                                            eventClass = '';
                                    }
    
                                    return (
                                        <div key={event.id} className={`event-name ${eventClass}`}>
                                            {event.title}
                                            {isAuth && (
                                                <button
                                                    className='btn btn-danger btn-sm mx-1 remove-btn'
                                                    onClick={() => deleteEvent(event.id)}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    }

export default CalendarComponent;
