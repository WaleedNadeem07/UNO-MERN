const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
import { Socket } from "socket.io";
import cardList from "./cards";
import { send } from "process";

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

function shuffleCards(cards: string[]) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

server.listen(3001, () => {
  console.log("SERVER IS LISTENING ON PORT 3001");
});

let numOfPlayers = 0;
let start = 0;
let rev = 0;
let list_players:any = [];
let list_id:any = [];
let list_id_sent:any = [];
let sock_list:any = [];
let deck_sent: any = false;

io.on("connection", (socket:any) => {
  console.log("user connected with a socket id", socket.id);

  socket.on("username", (username:any) => {
    if (numOfPlayers > 4) {
      socket.disconnect();
      console.log("Too many players, disconnected socket with id", socket.id);
      return;
    }
    console.log("PLAYERS:", numOfPlayers);
    
    console.log("user", username, "connected with a socket id", socket.id);
    list_players.push(username);
    list_id.push(socket.id);
    numOfPlayers++;
    console.log("COMPLETED", list_players);

    socket.username = username;
    sock_list.push(socket);
    socket.emit("connected", `Username ${username} connected`);
    console.log("SERVER EMITTED");
    if(numOfPlayers === 4)
    {
        console.log("COMPLETED");
        console.log("COMPLETED", list_players);
        io.emit("gamestart");
        
    }

    socket.on("myEvent", (myData:any) => {
      console.log(`${socket.username} sent a message: ${myData.data}`);
    });


    socket.on("won", (o:any) => {
      console.log("WON RECEIVED");
      let send = socket.username + " has won the game";
      for (let i = 0; i < list_id.length; i++) {
        io.to(list_id[i]).emit("won", send);
      }
    })

    socket.on("cards", (myData:any) => {
        console.log("Received");
        console.log(socket.id);
        const shuffledCards = shuffleCards(cardList);
        console.log("PLAYERS:", list_players.length);
        const playerCards = shuffledCards.splice(0, 7);
        //console.log(playerCards);
        console.log(socket.id);
        if(!list_id_sent.includes(socket.id))
        {
        console.log(playerCards);
        io.to(socket.id).emit("cards", playerCards);
        list_id_sent.push(socket.id);
        }
        console.log("CARDS LEFT", cardList.length);     
    });
    // console.log("LENGTH of list", list_id_sent.length);
    // if (list_id_sent.length === 2 && deck_sent)
    // {
    //     console.log("SENDING DECK");
    //     const card = cardList.splice(0,1);
    //     io.to(list_id[0]).emit("deck", card);
    //     io.to(list_id[1]).emit("deck", card);
    //     deck_sent = false;
    // }
    socket.on("deck", (bool:any) => {
      if (!deck_sent)
      {
        const card = cardList.splice(0,1);
        //const card = ['num-2 red'];
        //console.log("CARDS REMAINING:", ...cardList);
        console.log("CARDS REMAINING LENGTH", cardList.length);
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("deck", card);
        }
        const value = card[0].split(' ')[0];
        console.log("VALUE", value);
        if(value === 'skip')
        {
          console.log("HERE IN SKIP");
          let send = "The first card drawn from the pile was a skip card. " + list_players[0] + "'s turn has been skipped. It's " + list_players[1] + "'s turn";
          for (let i = 0; i < list_id.length; i++) {
            io.to(list_id[i]).emit("msg", send);
          }
          io.to(list_id[0]).emit("Your turn", false);
          io.to(list_id[1]).emit("Your turn", true);             
          io.to(list_id[2]).emit("Your turn", false);
          io.to(list_id[3]).emit("Your turn", false);
          let card2:any[] = []
          let t = true
          while(t)
          {
            const card3 = cardList.splice(0,1);
            if (card[0].split(' ')[0] !== ' skip' && card[0].split(' ')[0] !== ' reverse' && card[0].split(' ')[0] !== ' draw' && card[0].split(' ')[0] !== ' draw-4')
            {
              t = false;
              card2 = card3
            }
          }
          for (let i = 0; i < list_id.length; i++) {
                console.log("Sending to", list_id[i]);
                console.log(card2);
                io.to(list_id[i]).emit("deck", card2);
              }             
          deck_sent = true;
        }
        else if (value === 'reverse')
        {
          console.log("HERE IN REVERSE");
          console.log(list_players);
          if(rev !== 1)
          {
            list_id.reverse();
            list_players.reverse();
            rev += 1;
          }
          const indx = list_id.indexOf(socket.id);
          let indx2 = indx+1;
          if(indx2 >= list_id.length)
          {
            indx2 = 0;
          }
          let send = "The first card drawn from the pile was a reverse card. " + "Turns will now go in reverse order. It's " + list_players[0] + "'s turn";
          console.log(list_players);
          console.log(send);
          for (let i = 0; i < list_id.length; i++) {
            io.to(list_id[i]).emit("msg", send);
          }
          
          io.to(list_id[0]).emit("Your turn", true);
          io.to(list_id[1]).emit("Your turn", false);
          io.to(list_id[2]).emit("Your turn", false);
          io.to(list_id[3]).emit("Your turn", false);
          
          
          let card2:any[] = []
          let t = true
          while(t)
          {
            const card3 = cardList.splice(0,1);
            if (card[0].split(' ')[0] !== ' skip' && card[0].split(' ')[0] !== ' reverse' && card[0].split(' ')[0] !== ' draw' && card[0].split(' ')[0] !== ' draw-4')
            {
              t = false;
              card2 = card3
            }
          }
          for (let i = 0; i < list_id.length; i++) {
                console.log("Sending to", list_id[i]);
                console.log(card2);
                io.to(list_id[i]).emit("deck", card2);
              }
            deck_sent = true;
          }
          else
          {
            let send = list_players[0] + "'s turn";
            for (let i = 0; i < list_id.length; i++) {
              io.to(list_id[i]).emit("msg", send);
            }
            io.to(list_id[0]).emit("Your turn", true);
          }
           // wait for 1 second before resetting deck_sent
            //io.to(socket.id).emit("deck",card);
            //io.to(list_id[1]).emit("deck",card);
        }
    })

    socket.on("users_req", (l:any) => {
      let players:any = [];
      //console.log("USERS", list_players[0], list_players[1]);
      players.push(socket.username);
      const filteredList = list_players.filter((value:any) => value !== socket.username);
      //console.log("FILTERED", filteredList);
      for (let i = 0; i < filteredList.length; i++) {
        players.push(filteredList[i]);
      }
      //console.log("FINAL LIST", players);
      io.to(socket.id).emit("users_list", players);
    })

    socket.on("skip", (i:any) => {
      console.log("Skip received");
      const indx = list_id.indexOf(socket.id);
      console.log("indx", indx);
      const indx2 = indx+1;
      const temp = (indx2+1) % list_id.length;
      console.log("temp", temp);
      if (temp < list_id.length) {
        io.to(list_id[temp]).emit("Your turn", true);
      }
      let send2 = socket.username + " played skip. It's ";
      send2 += list_players[temp] + "'s turn";
      console.log(send2);
      for (let i = 0; i < list_id.length; i++) {
        io.to(list_id[i]).emit("msg", send2);
      }
      
    });


    socket.on("reverse", (o:any) => {
      console.log("Reverse received");
      list_id.reverse();
      list_players.reverse();
      const indx = list_id.indexOf(socket.id);
      let indx2 = indx+1;
      if(indx2 >= list_id.length)
      {
        indx2 = 0;
      }
      io.to(list_id[indx2]).emit("Your turn", true);
      let send2 = "";
      send2 += list_players[indx2] + "'s turn";
      console.log(send2);
      for (let i = 0; i < list_id.length; i++) {
        io.to(list_id[i]).emit("msg", send2);
      }

      let send = "";
      send += socket.username + " played reverse";
      let f = list_players.indexOf(socket.username) + 1;
      if (f >= list_players.length)
      {
        f = 0;
      }
      send += ". It's " + list_players[f] +"'s turn";
      
      console.log(send);
      for (let i = 0; i < list_id.length; i++) {
        io.to(list_id[i]).emit("msg", send);
      }
    })

    socket.on("draw2", (u:any) => {
      console.log("DRAW2 Received");
      const indx = list_id.indexOf(socket.id);
        let indx2 = indx+1;
        if(indx2 >= list_id.length)
        {
          indx2 = 0;
        }
        io.to(list_id[indx2]).emit("Your turn", true);
        io.to(list_id[indx2]).emit("draw2", true);
        let send2 = socket.username + " played draw 2. It's ";
        send2 += list_players[indx2] + "'s turn";
        console.log(send2);
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("msg", send2);
        }
    })

    socket.on("draw4", (u:any) => {
      console.log("DRAW4 Received");
      const indx = list_id.indexOf(socket.id);
        let indx2 = indx+1;
        if(indx2 >= list_id.length)
        {
          indx2 = 0;
        }
        io.to(list_id[indx2]).emit("Your turn", true);
        io.to(list_id[indx2]).emit("draw4", true);
        let send2 = socket.username + " played draw 4. It's ";
        send2 += list_players[indx2] + "'s turn";
        console.log(send2);
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("msg", send2);
        }
    })

    socket.on("Update deck", (deckcard:any) => {
        console.log("UPDATED DECK:", deckcard);
        deckcard = [deckcard];
        io.to(socket.id).emit("deck",deckcard);
        for (let i = 0; i < list_id.length; i++) {
            io.to(list_id[i]).emit("deck", deckcard);
          }
    })

    socket.on("next turn", (tmp: any) => {
        const indx = list_id.indexOf(socket.id);
        let indx2 = indx+1;
        if(indx2 >= list_id.length)
        {
          indx2 = 0;
        }
        io.to(list_id[indx2]).emit("Your turn", true);
        let send2 = "";
        send2 += list_players[indx2] + "'s turn";
        console.log(send2);
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("msg", send2);
        }
    })

    socket.on("msg", (msg:any) => {
      console.log("Message received");
      let send = "";
      if (cardList.length === 0) {
        let send = "Deck empty. The game is a draw";
        console.log("SENDING DRAW MSG");
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("draw", send);
        }
      }
      else if(msg === "Passed")
      {
        send += socket.username + " passed the turn";
        let f = list_players.indexOf(socket.username) + 1;
        if (f >= list_players.length)
        {
          f = 0;
        }
        send += ". It's " + list_players[f] +"'s turn";
        
        console.log(send);
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("msg", send);
        }
      }

      //else(msg === "picked")
      else if (msg === "picked")
      {
        send += socket.username + " picked a card from the deck";
        console.log(send);
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("msg", send);
      }
      }

      else
      {
        send += socket.username + " " + msg;
        let f = list_players.indexOf(socket.username) + 1;
        if (f >= list_players.length)
        {
          f = 0;
        }
        send += ". It's " + list_players[f] +"'s turn";
        
        console.log(send);
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("msg", send);
        }
      }
    })

    socket.on("pick card", (player_cards: any) => {
        const card = cardList.splice(0,1);
        console.log("BEFORE:", player_cards);
        player_cards.push(card[0]);
        console.log("AFTER:", player_cards);
        io.to(socket.id).emit("cards",player_cards);
    })

    socket.on("initGameState", (turn:any) => {
      if(start === 0)
      {
        console.log("turn", turn);
        console.log("SENDING INIT TO:", list_id[turn]);
        io.to(list_id[turn]).emit("Your turn",true);
        let send2 = "";
        send2 += list_players[0] + "'s turn";
        console.log(send2);
        for (let i = 0; i < list_id.length; i++) {
          io.to(list_id[i]).emit("msg", send2);
        }
        setTimeout(() => {
          io.to(list_id[turn]).emit("Your turn",true);
          io.to(list_id[1]).emit("Your turn",false);
          io.to(list_id[2]).emit("Your turn",false);
          io.to(list_id[3]).emit("Your turn",false);
        }, 1000);
        
      }  
    })

    socket.on("disconnect", () => {
      console.log("user", username, "disconnected with a socket id", socket.id);
      numOfPlayers--;
      list_players.filter((c:any) => c !== socket.username);
      let index = list_id.indexOf(socket.id);
      if (index > -1) {
        list_id.splice(index, 1);
      }
    });
  });
}

);

