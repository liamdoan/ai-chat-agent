import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './pages/homepage/Homepage.tsx';
import DashboardLayout from './layouts/dashboardLayout/DashboardLayout.tsx';
import DashboardPage from './pages/dashboardPage/DashboardPage.tsx';
import ChatPage from './pages/chatPage/ChatPage.tsx';
import RootLayout from './layouts/rootLayout/RootLayout.tsx';
import SignupPage from './pages/signupPage/SignupPage.tsx';
import { FetchChatListProvider } from './core/context/fetchChatListContext.tsx';

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <Homepage />,
            },
            {
                path: "/sign-up/*",
                element: <SignupPage />,
            },
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: "/dashboard",
                        element: <DashboardPage />,
                    },
                    {
                        path: "/dashboard/chats/:id",
                        element: <ChatPage />,
                    },
                ],
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <FetchChatListProvider>
            <RouterProvider router={router} />
        </FetchChatListProvider>
    </StrictMode>,
)
