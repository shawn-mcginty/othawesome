# Othawesome
> The Othello game written by me.  All game logic is executed on the front end, back end is only used to persist game states.  The view is semi-responsive and should be usable on almost any screen-size.

#### Stuff Used
* **RxJS** (Reactive Extensions) - Used to observe gamestate and keep view in sync with game state
* **Materialize CSS** - CSS framework used for style/UX/Responsive-ness
* **Angular** - Used for general MVC
* **Mocha** - Unit testing framework
* **Chai** - Assertion library

#### Requirements
- Ruby (with Sass gem) are required to compile scss
- MongoDB must be installed and running to start the app

#### Setup steps
1. ``npm install``
2. ``bower install``
3. ``gulp``
4. ``node ./bin/www``
5. Visit http://localhost:3000

#### Testing
* Front end tests can be executed by viewing ``../OTHELLO-HOME-DIR/front-end-tests.html``