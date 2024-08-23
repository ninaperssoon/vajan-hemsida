import CalendarComponent from "./CalendarComponent";

function Calendar ({isAuth}) {

    const currentYear = new Date().getFullYear();

    return (
        <div className="calendar-page">
            
            <div className="calendar-container">
                <CalendarComponent initialYear={currentYear} isAuth={isAuth} />

            </div>
        </div>
    )
}

export default Calendar;