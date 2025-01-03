import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase-config';

function AddEvents() {
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(null);
  const [eventType, setEventType] = useState('Typ av event');

  const handleSelect = (eventKey) => {
    setEventType(eventKey);
  };

  const handleAddEvent = () => {
    if (!eventTitle || !eventDate || eventType === 'Typ av event') {
      alert('Vänligen fyll i alla fält.');
      return;
    }

    const newEvent = {
      title: eventTitle,
      date: eventDate,
      type: eventType,
    };

    setEvents([...events, newEvent]);

    // Rensa fälten efter att ha lagt till eventet
    setEventTitle('');
    setEventDate(null);
    setEventType('Typ av event');
  };

  const handleDeleteEvent = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    setEvents(updatedEvents);
  };

  const handleUpload = async () => {
    if (events.length < 1) {
      alert('Vänligen lägg till ett event.');
      return;
    }

    try {
      for (const event of events) {
        // Hämta år och månad från eventDate
        const eventDate = new Date(event.date);
        const year = eventDate.getFullYear();
        const month = ('0' + (eventDate.getMonth() + 1)).slice(-2); // Lägg till 1 då månader är 0-indexerade
        
        // Skapa en referens till subcollection baserat på år och månad
        const monthYearRef = collection(db, `events/${year}-${month}/eventList`);

        // Lägg till eventet i rätt subcollection
        await addDoc(monthYearRef, {
          title: event.title,
          date: event.date,
          type: event.type,
        });
      }

      alert('Eventen har publicerats!');

      // Rensa eventlistan efter uppladdning
      setEvents([]);

    } catch (error) {
      console.error('Fel vid uppladdning av event:', error);
      alert('Det gick inte att publicera eventen. Försök igen senare.');
    }
  };

  return (
    <div className='createPostPage my-3'>
      <div className='create-container aeContainer'>
        <h2>Skapa event</h2>
        <div>
          <label className='create-label my-2'>Eventnamn:</label>
          <input 
            placeholder='Titel...' 
            type='text'
            value={eventTitle}
            onChange={(event) => setEventTitle(event.target.value)}
            className='form-control'
          />
        </div>
        <div >
          <label className='create-label my-2'>Datum:</label>
          <input 
            type="date" 
            value={eventDate || ''} // Hantera null-värde för eventDate
            onChange={(event) => setEventDate(event.target.value)}
            className='form-control'
          />
        </div>

        <div className='inputGp'>
          <Dropdown onSelect={handleSelect}>
            <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
              {eventType}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey='Vajans egna event'>
                Vajans egna event
              </Dropdown.Item>
              <Dropdown.Item eventKey='Samsittning'>
                Samsittning
              </Dropdown.Item>
              <Dropdown.Item eventKey='Nationens event'>
                Nationens event
              </Dropdown.Item>
              <Dropdown.Item eventKey='Andra föreningars event'>
                Andra föreningars event
              </Dropdown.Item>
              <Dropdown.Item eventKey='Special event'>
                Special event
              </Dropdown.Item>
            </Dropdown.Menu>

          </Dropdown>
        </div>
        
        <button onClick={handleAddEvent}>Lägg till</button>
        
      </div>
      <div className='event-list create-container aeContainer mt-3'>
        <h2 >Eventlista</h2>
        <ul>
          {events.map((event, index) => (
              <li key={index} >
                  {event.title} - {event.date} - {event.type}

                  <button 
                    onClick={() => handleDeleteEvent(index)} 
                    className='btn btn-sm mx-2 btn-danger mt-0'
                  >
                    X
                  </button>
                
              </li>
            
          ))}
        </ul>
        <button onClick={handleUpload}>Publicera</button>
      </div>
    </div>
  );
}

export default AddEvents;
