import React, { useState } from 'react';
import './App.css';
import CallInterface from './components/CallInterface';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [callStatus, setCallStatus] = useState<string>('');

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <CallInterface onCallStatusChange={setCallStatus} />
      </main>
      <Footer />
    </div>
  );
}

export default App;