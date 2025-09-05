import logo from '../images/v-logo-vit.png'
import './header.css'

function Header() {
    return (
        <div id='song-header-container'>
            <img src={logo} ></img>
            <h1>Vajans lilla röda</h1>
        </div>
    )
}

export default Header