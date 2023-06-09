import { Socket } from "socket.io-client" 
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import Gamepage from './Gamepage';
import { useEffect, useState } from "react";
import './Home.css'
import { disconnect } from "process";

interface HomePageProps {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> 
}

function HomePage({socket}:HomePageProps){
    const [waitingForPlayers, setWaitingForPlayers] = useState(false); // state to keep track of waiting for players
    const [username, setUsername] = useState(""); // state to store the username
    const [disconnected, setDisconnected] = useState(false); // state to keep track of socket disconnection
    const [gamestart, setGamestart] = useState(false);

    const handleClick = (socket: Socket) => {
        if (username && !disconnected && !gamestart) { // only send the message if a username is provided and socket is not disconnected
            console.log('Socket ID:', socket.id);
            socket.emit('username', username); // send the username to the server
            setWaitingForPlayers(true); // show "waiting for other players" message
            setUsername(""); // clear the input field
        }
    };

    socket.on("gamestart", () => {
        setGamestart(true);
    })

    socket.on("connected", () => {
        console.log("CONNECTED");
    })

    socket.on("disconnect",()=>{
        console.log("Cannot connect");
        setDisconnected(true); // set the disconnected state to true
        setWaitingForPlayers(false); // set the waitingForPlayers state to false
    })
    return(
        <>
        {!disconnected && !gamestart ? ( // display the content if the socket is not disconnected and the game has not started
            <div className="sampleHomePage">
                <h1 className="sampleTitle">My Game</h1>
                {waitingForPlayers ? ( // hide the input message field if waitingForPlayers state is true
                    <div className="sampleMessage">
                        <p>Waiting for other players...</p> {/* show "waiting for other players" message if waitingForPlayers state is true */}
                    </div>
                ) : (
                    <div className="sampleMessage">
                        <input 
                            placeholder="Enter your username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />
                        <button onClick={() => handleClick(socket)}>Click me to send a message to server...</button>
                    </div>
                )}
            </div>
        ) : gamestart ? (
            <Gamepage socket={socket} /> // Pass the socket object to the Gamepage component
          ) : disconnected ? (
            <div className="disconnected-message">Disconnected, Room full</div> // display "Disconnected" message when disconnected is true
          ):(<div className="disconnected-message">Disconnected, Room full</div>)
          }
        </>
    )
    
    
}

export default HomePage
