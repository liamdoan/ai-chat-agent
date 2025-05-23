
import './RootLayout.css'
import { Link, Outlet, useLocation } from 'react-router-dom'

const RootLayout = () => {
    const location = useLocation();
    const isDashboardPath = location.pathname.startsWith('/dashboard');

    return (
        <div className='rootLayout'>
            <header className='header'>
                {isDashboardPath ? (
                    <div ><em>MODEL_OPTIONS</em></div>
                ) : (
                    <Link className='logo-link' to="/explore">
                        <img className='logo' src="/ai-chat-icon.png" alt="logo" />
                        <span>LD AI Agent</span>
                    </Link>
                )}
                <div className="user">
                    <em>USER_PROFILE</em>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default RootLayout
