import { useEffect, useRef, useState } from 'react';
import './style.css'
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';

function App() {
    const [gameState, setGameState] = useState('menu');
    const [gamesList, setGamesList] = useState([]);
    const [username, setUsername] = useState('');
    const [telegramId, setTelegramId] = useState(null);
    const phaserRef = useRef();

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            console.log('Telegram WebApp доступен:', tg);
            console.log('initData:', tg.initData);
            console.log('initDataUnsafe:', tg.initDataUnsafe);
    
            const telegramId = tg.initDataUnsafe?.user?.id || null;
            const username = tg.initDataUnsafe?.user?.username || 'unknown';

            console.log('Telegram initData:', window.Telegram.WebApp.initData);

            setTelegramId(telegramId)
            setUsername(username);
    
            fetch('https://cbce-139-162-146-232.ngrok-free.app/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: telegramId, username }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log('Регистрация прошла успешно:', data);
                })
                .catch((err) => {
                    console.error('Ошибка регистрации:', err);
                });
        } else {
            console.error('Telegram WebApp API недоступен');
            console.log(window.Telegram.WebApp.initData)
        }
    }, []);

    

    useEffect(() => {
        const fetchGames = async () => {
            const response = await fetch('https://cbce-139-162-146-232.ngrok-free.app/games');
            const games = await response.json();
            setGamesList(games); // setGamesList — состояние списка игр
        };
    
        fetchGames();
    }, []);

    const createGame = async () => {
        const response = await fetch('https://cbce-139-162-146-232.ngrok-free.app/create-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId: telegramId }),
        });

        const game = await response.json();
        if (game.success) {
            setGameState('game');
        }
    };
    
    const joinGame = async (gameId) => {
        const response = await fetch(`https://cbce-139-162-146-232.ngrok-free.app/join-game/${gameId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId: 1 })
        });
        const game = await response.json();
        if (game.success) {
            setGameState('game');
        }
    };

    const startGame = () => {
        setGameState('game');
        if (phaserRef.current?.scene) {
            phaserRef.current.scene.startGame(); 
        }
    };

    return (
        <div className="app">
            {gameState === 'menu' && (
                <div className="game-selection">
                    <div>{username}</div>
                    <button onClick={createGame}>Создать игру</button>
                    <div className="games-list">
                        {gamesList.map((game) => (
                            <div key={game.id}>
                                <span>Игра {game.id}</span>
                                <button onClick={() => joinGame(game.id)}>Присоединиться</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {gameState === 'game' && (
                <div>
                    <PhaserGame ref={phaserRef} />
                </div>
            )}
        </div>
    );
}

export default App


