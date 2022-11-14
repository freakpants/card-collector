/*
3 tokens = 1040 x 585
50 tokens screenshot = 2400*1350
*/

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithRedirect,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import React, { Component } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import axios from "axios";

import PlayerCard from "./PlayerCard";

import Select from "react-select";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      collections: [{ name: "World Cup Players", value: "wcplayers" }],
      wcPlayers: [],
      wcCountries: [],
      collection: "none",
      subCollection: "none",
      rarities: [],
      players: [],
    };

    this.handleSingleSelect = this.handleSingleSelect.bind(this);
    this.handleSubFilterClick = this.handleSubFilterClick.bind(this);

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyBZjAp5aWnUV9y_AbI0UeN8fMSco9L7U3U",
      authDomain: "pack-collector.firebaseapp.com",
      projectId: "pack-collector",
      storageBucket: "pack-collector.appspot.com",
      messagingSenderId: "935679710199",
      appId: "1:935679710199:web:906c3ac232f7d9fecf54f2",
      measurementId: "G-60T2BG3K5X",
      databaseURL:
        "https://pack-collector-default-rtdb.europe-west1.firebasedatabase.app/",
    };

    const fireApp = initializeApp(firebaseConfig);

    const appCheck = initializeAppCheck(fireApp, {
      provider: new ReCaptchaV3Provider(
        "6Lfj7aAiAAAAAOZtB0a6MNtSRdFFdCxk5hCPkjWC"
      ),
      isTokenAutoRefreshEnabled: true,
    });

    this.appCheck = appCheck;

    this.fireApp = fireApp;

    const analytics = getAnalytics(fireApp);
    this.analytics = analytics;

    this.database = getDatabase(fireApp);

    this.GoogleAuthProvider = new GoogleAuthProvider();

    // this.provider = new TwitterAuthProvider();
    this.auth = getAuth();

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // write user object to local storage
        localStorage.setItem("user", JSON.stringify(user));

        console.log("setting status to logged in");
        this.setState({ user: user, loggingIn: false });
      } else {
        // User is signed out
        localStorage.setItem("user", JSON.stringify(user));

        this.setState({ user: false, loggingIn: false });
      }
    });
  }

  triggerGoogleLogin() {
    signInWithRedirect(this.auth, this.GoogleAuthProvider);
  }

  triggerGoogleLogout() {
    this.auth.signOut();
  }

  handleSingleSelect(event) {
    if (event.target.value === "sbc" || event.target.value === "objective") {
      this.setState({ packable: false });
    }
    this.setState(
      {
        [event.target.name]: event.target.value,
      },
      () => {}
    );
  }

  handleCheckboxChange(event) {
    const { name } = event.target;
    this.setState(
      (prevState) => {
        let oldState = prevState[name];

        return {
          [name]: !oldState,
        };
      },
      () => {}
    );
  }

  componentDidMount() {
    // get rarities
    axios
      .get(process.env.REACT_APP_AJAXSERVER + "getRarities.php")
      .then((response) => {
        console.log(response.data);
        this.setState({ rarities: response.data });
      })
      .catch((error) => {
        console.log(error);
      });
    // get wc players
    axios
      .get(process.env.REACT_APP_AJAXSERVER + "getWcPlayers.php")
      .then((response) => {
        console.log(response.data);

        // get distinct wc countries
        let countries = [];
        response.data.forEach((player) => {
          if (!countries.includes(player.teamId)) {
            countries.push(player.teamId);
          }
        });
        console.log(countries);
        this.setState({ wcPlayers: response.data, wcCountries: countries });
      });
      axios
      .post(
        process.env.REACT_APP_AJAXSERVER +
          "getOwnedPlayers.php" +
          "?user_id=1"
      )
      .then((response) => {
        // manipulate the response here
        let players = response.data;
        this.setState({ players: players });
      });
  }

  handleCancelProfile() {
    this.setState({ editingProfile: false });
  }

  handleSubFilterClick(event) {
    console.log(event);
    let subCollection = event.target.getAttribute("data-value");
    this.setState({ subCollection: subCollection });
  }

  render() {
    const theme = createTheme({
      typography: {
        fontFamily: "Matroska",
        fontSize: 12,
        color: "#F8EEDE",
      },
      palette: {
        primary: {
          main: "#b90040",
        },
        secondary: {
          main: "#edf2ff",
        },
        lightgray: {
          main: "#292f35",
        },
        lightergray: {
          main: "#505a64",
        },
      },
    });

    console.log("trying to render");



    let wcPlayers = this.state.wcPlayers;

    // filter by team if needed
    if (this.state.subCollection !== "none") {
      wcPlayers = wcPlayers.filter((player) => {
        return player.teamId === this.state.subCollection;
      });
    }

    // limit array to 23
    wcPlayers = wcPlayers.slice(0, 40);

    wcPlayers.forEach((wcPlayer) => {
      let player = this.state.players.find(
        (player) => player.definitionId === wcPlayer.definitionId
      );
      if (player) {
        wcPlayer.exists = true;
      }
    });

    return (
      <ThemeProvider theme={theme}>
        <div id="filters">
          <Accordion>
            <AccordionSummary
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <div className="filter-header">Collections</div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="filter-content">
                <div className="filter-content-row">
                  <div className="filter-content-row-label">Collection</div>
                  <div className="filter-content-row-input">
                    <select
                      id="collection"
                      onChange={this.handleSingleSelect}
                      name="collection"
                      value={this.state.collection}
                      multiple={false}
                    >
                      <option value="none">...select a collection</option>
                      {this.state.collections.map((collection) => (
                        <option value={collection.value}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
        <div id="subfilters">
          {this.state.collection === "wcplayers" && (
            <div>
              {this.state.wcCountries.map((country) => (
                <img
                onClick={this.handleSubFilterClick}
                data-value={country}
                  className={"national-team"}
                  src={
                    "https://cdn.futbin.com/content/fifa23/img/clubs/" +
                    country +
                    ".png"
                  }
                />
              ))}
            </div>
          )}
        </div>
        <div id="cards">
          {this.state.collection === "wcplayers" &&
            wcPlayers.map((player) => {
              return player.exists ? (

                <PlayerCard
                key={player.definitionId}
                  badge={true}
                  small={true}
                  player={player}
                  rarities={this.state.rarities}
                  style={{
                    transform: "scale(.4)",
                    width: "160px",
                    height: "145px",
                    marginBottom: "28.8px",
                    WebkitTransformOriginX: "left",
                    WebkitTransformOriginY: "top",
                  }}
                />
            ) : (
              <div
                key={player.definitionId}
                className={"card__wrapper"}
                style={{
                  transform: "scale(.4)",
                  width: "160px",
                  height: "145px",
                  marginBottom: "28.8px",
                  WebkitTransformOriginX: "left",
                  WebkitTransformOriginY: "top",
                }}
              >
                  <div className={"card__wrapper__item placeholder"}>
                    <img
                      classNAme={"card__wrapper__item__bg"}
                      src={
                        "https://freakpants.ch/fut/php/cards/placeholder.png"
                      }
                    />

                    <div class="card__wrapper__item__ratings">
                      <span class="card__wrapper__item__ratings__position">
                        {player.mainPosition}
                      </span>
                    </div>
                    <div className={"card__wrapper__item__name"}>
                      {player.knownAs !== "" && player.knownAs !== "---"
                        ? player.knownAs
                        : player.lastName}
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      </ThemeProvider>
    );
  }
}
export default App;
