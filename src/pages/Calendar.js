import CalendarComponent from "./CalendarComponent";

function Calendar () {

    const currentYear = new Date().getFullYear();

    return (
        <div className="image-archive-page">
            {/* <div>
                <h1>Kalendarium</h1>
            </div> */}
            <div className="calendar-container">
                <CalendarComponent initialYear={currentYear} />

            </div>
        </div>
    )
}

export default Calendar;