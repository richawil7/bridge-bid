#Introduction
This web-based application allows two players to practice bidding in the Bridge card game.
The application deals a deck of cards each of the four players. Bridge refers to these players based on their seat location at the table: North, East, South, and West. The two human players sit at North and South. The East and West seats are played by the application.

#Usage
##Connecting to the Server
Using your favorite web browser, enter this URL:
      [Bridge Bidding](http://192.168.1.5:3000)

##Choosing a Seat
The home page invites the player to choose a seat. Use the pulldown menu to select to sit in either the North or South seat. If you choose the same seat as your partner, you will get assigned to the other seat.
The home page will update, showing the playing table.

##Starting a Game
A button is pressed to start a game. This button can be pressed after a game completes to start another game. Starting a game will cause your hand to appear.

##Game Options
###Showing Hand Evaluation
If you want a little hint about how to evaluate your hand, press the Evaluate button.

###Ending a Game
A game ends when there are 3 Pass bids in a row. The hand continues to be displayed so that the players can discuss the bidding sequence.

###Rebid a Hand
After a discussion, you may wish to rebid the existing hand. To do this, press the Rebid button.

###Showing All Hands
There is an option to display all the hands which may be useful in discussion of the bidding session.

#Implementation
##Challenges
###Supporting Two Clients
React.JS was used to render the front end of this application. And React is great for updating individual components based on changes in state variables. Usually the state variables change based on user inputs. But because the application has four player, there was a challenge updating the web page for the human players when the state change was triggered by another player.
I tried using polling by the client of the server. This was inefficient at best, but at worst I had difficulty preventing a poll update from resetting the overall state of the application.
Instead I implemented a server-side event stream. When the state of the application changes, it sends an event to each of the clients. The clients can then use the event to trigger a request to the server to update some state. Multiple event types were defined so as to only request an update of data which has changed.


##Lessons Learned
###Redirecting in React
I found that React does not like to leave its primary page or even redirect to the primary page. In either case, React runs the App.jsx file all over again. This causes all your state variable to be re-initialized.
I needed to avoid both these situations. The server never performs a res.redirect back to the home page.
The other place that required changes was in submit buttons. Normally a submit button causes a page to re-rendered. All buttons had to be changed to type "
button" and an onclick handler provided which would perform the HTTP POST.

###Entering Bids
Originally I had a simple text box and submit button for a user to enter a bid. Much to my delight, I discovered it was possible to attach an onclick handler function to different HTML elements.  
So I converted from the text box to a grid of bids in a data table. I was able to display the bid as an entry in a table cell and resolve the bid when the cell was clicked.
But when I tried to "pretty-up" the table by making all the column widths the same, the onclick capability fails. I believe this is because the styling causes the location of cells to be moved visually, but they are not moved in terms of their "click area".

#Future Improvements
##Smarter Application Bidding
The seats played by the computer will try in the first round of bidding to bid if it has an opening hand. But after that, the opponents will pass. An improved bidding logic will make opponents more competitive.

##Practicing Specified Conventions
Be able to configure the dealing and assignment of hands to practice a set of bidding conventions.
This is a large effort. Not likely anytime soon.