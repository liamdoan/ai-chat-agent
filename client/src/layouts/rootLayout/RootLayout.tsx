
import './rootLayout.css'
import { Link, Outlet, useLocation } from 'react-router-dom'

const RootLayout = () => {
    const location = useLocation();
    const isDashboardPath = location.pathname.startsWith('/dashboard');

    return (
        <div className='rootLayout'>
            <header className='header'>
                {isDashboardPath ? (
                    <div>MODEL_OPTIONS</div>
                ) : (
                    <Link className='logo-link' to="/explore">
                        <img className='logo' src="/ai-chat-icon.png" alt="logo" />
                        <span>LD AI Agent</span>
                    </Link>
                )}
                <div className="user">
                    USER_PROFILE
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default RootLayout
