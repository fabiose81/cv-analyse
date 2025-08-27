import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import NavigationComponent from './components/NavigationComponent';
import CV from './pages/CV';
import Job from './pages/Job';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <React.Fragment>
        <NavigationComponent />
        <main className='main-content'>
          <Routes>
            <Route path='/' element={<Navigate replace to="/cv" />} exact />
            <Route path='/cv' element={<CV />} />
            <Route path='/job' element={<Job />} />
          </Routes>
        </main>
      </React.Fragment>
    </BrowserRouter>
  );
}

export default App;
