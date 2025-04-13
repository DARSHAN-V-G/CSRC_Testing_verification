import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage.jsx';


import ProtectedRoute from './components/ProtectedRoute.jsx';
//refer protectedRoute from codopoly admin portal
const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage/>}/>
             </Routes>
        </Router>
    );
};

export default AppRouter;
