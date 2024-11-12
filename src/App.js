import React from 'react';
import './App.css';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers';
import Swap from './components/Swap';

function App() {
  return (
    <DappProvider>
      <div className="App">
        <Swap />
      </div>
    </DappProvider>
  );
}

export default App;