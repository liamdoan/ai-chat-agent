import "./Homepage.css"
import { Link } from 'react-router-dom'

const Homepage = () => {
    return (
        <div className='homepage'>
            <img src="/spiral.png" alt="" className='background-img'/>
            <div className="left">
                <h1>Welcome to LD AI Agent</h1>
                <h2>Talk to AI. Discover knowledge. Create smarter.</h2>
                <Link className='get-started-btn' to="/dashboard">Get Started</Link>
            </div>
            <div className="right">
                <div className="imgContainter">
                    <div className="bg"></div>
                </div>
                <img src="/ai-robot.png" alt="" className='img-ai-robot'/>
            </div>
        </div>
    )
}

export default Homepage
