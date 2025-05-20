
import './rootLayout.css'
import { Link, Outlet } from 'react-router-dom'

const RootLayout = () => {
    return (
      <div className='rootLayout'>
            <header className='header'>
                <Link to="/">My LOGO</Link>
                <div className="user">
                    USER
                </div>
            </header>
            <main>
                <Outlet />
            </main>
      </div>
    )
}

export default RootLayout