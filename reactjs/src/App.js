import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import NavigationComponent from './components/NavigationComponent';
import CV from './pages/cv/CV';
import Selected from './pages/cv/Selected';
import Job from './pages/job/Job';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <React.Fragment>
        <NavigationComponent />
        <main className='main-content'>
          <Routes>
            <Route path='/' element={<Navigate replace to="/job" />} exact />
            <Route path='/job' element={<Job />} />
            <Route path='/cv' element={<CV />} />
            <Route path='/selected' element={<Selected />} />
          </Routes>
        </main>
      </React.Fragment>
    </BrowserRouter>
  );
}

export default App;
