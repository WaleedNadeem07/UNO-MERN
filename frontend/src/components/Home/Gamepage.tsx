import { useEffect, useState } from "react";
import { Socket } from 'socket.io-client';

interface GamepageProps {
socket: Socket;
}

function Gamepage({ socket }: GamepageProps) {
const [playerCards, setPlayerCards] = useState<string[]>([]);
const [userList, setUserList] = useState<string[]>([]);
const [turn, setTurn] = useState(false);
const [can_pass, setCan_pass] = useState(false);
const [can_pick, setCan_pick] = useState(true);
const [draw2, setDraw2] = useState(2);
const [draw4, setDraw4] = useState(4);
const [deck_card, setDeck_card] = useState<string>('');
const [msg_l, setMsg_l] = useState<string>('');


useEffect(() => {
    setDraw2(2);
    setDraw4(4);
    socket.emit("cards", true);
    socket.on("cards",(cards: string[]) => {setPlayerCards(cards)});

    socket.on("won", (msg:any) =>{
        console.log("WON");
        alert(msg);
        socket.emit("disconnected");
    })

    socket.on("draw", (msg:any) =>{
        console.log("DRAW")
        alert(msg);
        socket.emit("disconnected");
    })

    socket.on("msg", (content:any) => {
        setMsg_l(content);
    })

    socket.emit("users_req", true);
    socket.on("users_list", (users: string[]) => {
        setUserList(users);
    })

    socket.emit("deck", true);
    socket.on("deck", (card: string) => {setDeck_card(card)})

    socket.on("draw2", (y:any) => {
        console.log("HAVE TO DRAW 2");
        //alert("You have to draw 2 cards as the player before you played a draw-2 card");
        setDraw2(0);
    })

    socket.on("draw4", (y:any) => {
        console.log("HAVE TO DRAW 4");
        //alert("You have to draw 2 cards as the player before you played a draw-2 card");
        setDraw4(0);
    })

    setCan_pass(false);
    setCan_pick(true);
    socket.emit("initGameState", 0)
    socket.on("Your turn",(bool: any) => {setTurn(bool)})
    
},[]);

if(deck_card !== '')
{
    console.log("DECK CARD:", deck_card);
}

if(turn)
{
    console.log("MY TURN")
}
console.log(playerCards);

// Clean up the event listener on unmount
// return () => {
// socket.off("cards");
// };
// }, [socket]);

return (
    <>
    <meta charSet="UTF-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Uno</title>
    <link rel="stylesheet" href="uno.css" />
    <link rel="stylesheet" href="uno-cards.css" />
    <div className="main-container">
    <div className="game-container">
    <div className={`heading-container ${turn ? "your-turn" : ""}`}>
        <h1>UNO</h1>
        {turn && <p> (Your turn) </p>}
    </div>
    <div className="game-table-container">
        <div className="game-table">
        <div className="card-area">
            <div className="card discard-pile black">
            <span className="inner">
                <span className="mark">U</span>
            </span>
            </div>
            {deck_card !== '' && (deck_card[0].split(' ')[0] === "draw" || deck_card[0].split(' ')[0] === "skip" || deck_card[0].split(' ')[0] === "reverse" || deck_card[0].split(' ')[0] === "draw-4") ? (
            <div className={`card ${deck_card[0].split(' ')[0]} ${deck_card[0].split(' ')[1]}`}>
            <span className="inner">
                <span className="mark"></span>
            </span>
            </div>
            ) : deck_card !== ''? (
                <div className={`card ${deck_card[0].split(' ')[0]} ${deck_card[0].split(' ')[1]}`}>
                    <span className="inner">
                        <span className="mark">{deck_card[0][4]}</span>
                    </span>
                </div>
            ) : (
                <div className={`card num-2 blue`}>
                    <span className="inner">
                        <span className="mark">NO</span>
                    </span>
                </div>
            )}
    </div>
    <div className="game-players-container">
        <div className="player-tag player-one">{userList[0]}</div>
    </div>
    <div className="game-players-container">
        <div className="player-tag player-two">{userList[1]}</div>
    </div>
    <div className="game-players-container">
        <div className="player-tag player-three">{userList[2]}</div>
    </div>
    <div className="game-players-container">
        <div className="player-tag player-four">{userList[3]}</div>
    </div>
    </div>
    </div>
    <div className="select-rang-container">
    <button className="button-select-rang" onClick={() =>{
        if(!turn)
        {
            alert("Not your turn");
        }
        else if(draw2 === 0)
        {
            socket.emit('pick card', playerCards);
            socket.emit("msg", "picked");
            console.log("Draw2 is 0");
            setDraw2(1);
        }
        else if(draw2 === 1)
        {
            socket.emit('pick card', playerCards);
            socket.emit("msg", "picked");
            console.log("Draw2 is 1");
            setCan_pass(true);
            setCan_pick(false);
            setDraw2(2);
        }
        else if(draw4 === 0 || draw4 === 1 || draw4 === 2)
        {
            socket.emit('pick card', playerCards);
            socket.emit("msg", "picked");
            console.log("Draw4 is here", draw4);
            let u = draw4 + 1;
            setDraw4(u);
        }
        else if(draw4 === 3)
        {
            socket.emit('pick card', playerCards);
            socket.emit("msg", "picked");
            console.log("Draw4 is done");
            socket.emit("next turn", true);
            setTurn(false);
            setCan_pass(false);
            setCan_pick(true);
            setDraw4(4);
            alert("Required cards picked. Turn moved to next player");
            
            
        }
        else if(can_pick && draw2 === 2)
        {
            socket.emit('pick card', playerCards);
            socket.emit("msg", "picked");
            setCan_pass(true);
            setCan_pick(false);
        }
        else
        {
            alert("You've already picked a card from the deck");
        }
    }}>Pick from deck</button>
    <button className="button-select-rang" onClick={() => {
        if(!turn)
        {
            alert("Not your turn");
        }
        else if(can_pass)
        {
            setTurn(false);
            setCan_pass(false);
            setCan_pick(true);
            socket.emit("next turn", true);
            socket.emit("msg", "Passed");
            alert("PASSED");

            //socket.emit("pick card", playerCards);
        }
        else
        {
            alert("You must pick a card from deck first");
        }
        }}>Pass</button>
    </div>
    </div>
    <div className="messages-and-cards-container">
    <div className="right-side-container messages-container">
        <h1>Messages</h1>
        <div className="message-box">
        <div className="message-content-container">
            {msg_l}
    </div>
    </div>
    </div>
    <div className="right-side-container my-cards-container">
        <h1>My Cards</h1>
        <div className="my-cards-inner-container">
        <div>
        {playerCards.map((card, index) => {
        const [value, color] = card.split(' ');

        if (value === "draw" || value === "skip" || value === "reverse" || value === "draw-4") {
            return (
            <a key={index} onClick={() => {
                if(!turn)
                {
                    alert("Not your turn");
                }

                else if(draw4 !== 4 || draw2 !== 2)
                {
                    alert("Invalid move");
                }

                else if(deck_card[0].split(' ')[0] === "draw" || deck_card[0].split(' ')[0] === "draw-4")
                {
                    if(value === "draw-4")
                    {
                        if (playerCards.length === 1) {
                            console.log("ZERO CARDS");
                            socket.emit("won", true);
                        }
                        alert("CARD PLAYED");
                        setTurn(false);
                        socket.emit("next turn", true);
                        console.log("Card value matches deck value");
                        console.log("SELECTED CARD:", color);
                        console.log("DECK:", deck_card[0].split(' ')[1]);
                        //socket.emit("Update deck", value + " " + color);
                        socket.emit("draw4", true);
                        setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                    }
                    else if (value === "skip")
                    {
                        if (playerCards.length === 1) {
                            console.log("ZERO CARDS");
                            socket.emit("won", true);
                        }
                        alert("CARD PLAYED");
                        setTurn(false);
                        socket.emit("skip", true);
                        //socket.emit("Update deck", value + " " + color);
                        setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                    }
                    else if (value === "reverse")
                    {
                        if (playerCards.length === 1) {
                            console.log("ZERO CARDS");
                            socket.emit("won", true);
                        }
                        alert("CARD PLAYED");
                        setTurn(false);
                        socket.emit("reverse", true);
                        //socket.emit("Update deck", value + " " + color);
                        setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                    }
                    else
                    {
                        if (playerCards.length === 1) {
                            console.log("ZERO CARDS");
                            socket.emit("won", true);
                        }
                        alert("CARD PLAYED");
                        setTurn(false);
                        socket.emit("next turn", true);
                        console.log("Card value matches deck value");
                        console.log("SELECTED CARD:", color);
                        console.log("DECK:", deck_card[0].split(' ')[1]);
                        //socket.emit("Update deck", value + " " + color);
                        socket.emit("draw2", true);
                        setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                    }
                }
                
                else if (deck_card !== '' ) {
                    if(value === "draw-4")
                    {
                        const clickedCard = card;
                        if (playerCards.filter((c) => c !== clickedCard).some((c) => c.split(' ')[1] === deck_card[0].split(' ')[1])) 
                        {
                            alert("Invalid move. You have a card that matches the color of the card in the deck");
                        }
                        else
                        {
                            if (playerCards.length === 1) {
                                console.log("ZERO CARDS");
                                socket.emit("won", true);
                            }
                            alert("CARD PLAYED");
                            setTurn(false);
                            socket.emit("next turn", true);
                            console.log("Card value matches deck value");
                            console.log("SELECTED CARD:", color);
                            console.log("DECK:", deck_card[0].split(' ')[1]);
                            //socket.emit("Update deck", value + " " + color);
                            socket.emit("draw4", true);
                            setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                        }
                    }
                    else if (value === "skip")
                    {
                        if (color === deck_card[0].split(' ')[1])
                        {
                            if (playerCards.length === 1) {
                                console.log("ZERO CARDS");
                                socket.emit("won", true);
                            }
                            alert("CARD PLAYED");
                            setTurn(false);
                            socket.emit("skip", true);
                            //socket.emit("Update deck", value + " " + color);
                            setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                        }
                        else
                        {
                            alert("Invalid move");
                        }
                    }
                    else if (value === "reverse")
                    {
                        if (color === deck_card[0].split(' ')[1])
                        {
                            if (playerCards.length === 1) {
                                console.log("ZERO CARDS");
                                socket.emit("won", true);
                            }
                            alert("CARD PLAYED");
                            setTurn(false);
                            socket.emit("reverse", true);
                            //socket.emit("Update deck", value + " " + color);
                            setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                        }
                        else
                        {
                            alert("Invalid move");
                        }
                    }
                    else
                    {
                        if (color === deck_card[0].split(' ')[1])
                        {
                            if (playerCards.length === 1) {
                                console.log("ZERO CARDS");
                                socket.emit("won", true);
                            }
                            alert("CARD PLAYED");
                            setTurn(false);
                            socket.emit("next turn", true);
                            console.log("Card value matches deck value");
                            console.log("SELECTED CARD:", color);
                            console.log("DECK:", deck_card[0].split(' ')[1]);
                            //socket.emit("Update deck", value + " " + color);
                            socket.emit("draw2", true);
                            setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                        }
                        else
                        {
                            alert("Invalid move");
                        }
                        
                    }
                    //setTurn(false);
                } else {
                    console.log("Card value does not match deck value");
                    alert("Invalid move. Please try again");
                    console.log("SELECTED CARD:", color);
                    console.log("DECK:", deck_card[0].split(' ')[1]);
                }
                }}>
            <div key={index} className={`card ${value} ${color}`}>
                <span className="inner">
                <span className="mark"></span>
                </span>
            </div>
            </a>
            );
        }
        return (
            <a key={index} onClick={() => {
                if(!turn)
                {
                    alert("Not your turn");
                }
                else if (playerCards.length === 0) {
                    socket.emit("won", true);
                }
                else if (deck_card !== '' && (color === deck_card[0].split(' ')[1] || value === deck_card[0].split(' ')[0] || deck_card[0].split(' ')[1] === "black" || deck_card[0].split(' ')[0] === "draw") && draw2 === 2 && draw4 === 4) {
                    if (playerCards.length === 1) {
                        console.log("ZERO CARDS");
                        socket.emit("won", true);
                    }
                    console.log("Card value matches deck value");
                    setTurn(false);
                    socket.emit("next turn", true);
                    socket.emit("msg", "played " + card);
                    alert("CARD PLAYED");
                    socket.emit("Update deck", value + " " + color);
                    setPlayerCards((playerCards) =>playerCards.filter((c) => c !== card));
                    //setDeck_card(value + " " + color);
                } else {
                    console.log("Card value does not match deck value");
                    alert("Invalid move. Please try again");
                    console.log("SELECTED CARD:", color);
                    console.log("DECK:", deck_card[0].split(' ')[1]);
                }
                
                }}>
            <div key={index} className={`card ${value} ${color}`}>
            <span className="inner">
            <span className="mark">{value[4]}</span>
            </span>
            </div>
            </a>
        );
        })}
    </div>
    </div>
    </div>
    </div>
    </div>
    </>
);
}

export default Gamepage;
