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
import { Accordion, AccordionDetails, AccordionSummary, Pagination } from "@mui/material";
import PlayerCard from "./PlayerCard";

import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      collections: [{ name: "World Cup Players", value: "wcplayers" }],
      wcPlayers: [],
      wcCountries: [],
      collection: "wcplayers",
      subCollection: "none",
      rarities: [],
      players: [],
      currentPage: 1,
      clubSync: true,
    };

    this.handleSingleSelect = this.handleSingleSelect.bind(this);
    this.handleSubFilterClick = this.handleSubFilterClick.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePlayerClick = this.handlePlayerClick.bind(this);
    this.downloadJs = this.downloadJs.bind(this);

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

        // get owned players
        axios
        .post(
          process.env.REACT_APP_AJAXSERVER +
            "getOwnedPlayers.php" +
            "?user_id=" + user.uid
        )
        .then((response) => {
          // manipulate the response here
          let players = response.data;
          // only use definitionId
          if(players && players.length > 0){
            players = players.map((player) => {
              return player.definitionId;
            });
          }


          this.setState({ players: players });
        }); 

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

  downloadJs() {
    const userId = this.state.user.uid;
    const file = new File([`// ==UserScript==
    // @name         FUT Club Export Script
    // @namespace    http://tampermonkey.net/
    // @version      0.1
    // @updateURL
    // @description
    // @match       https://www.ea.com/*/fifa/ultimate-team/web-app/*
    // @match       https://www.ea.com/fifa/ultimate-team/web-app/*
    // @require     https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
    // @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
    // @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
    // @resource    jqUI_CSS  http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css
    // @resource    IconSet1  http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/images/ui-icons_222222_256x240.png
    // @resource    IconSet2  http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/images/ui-icons_454545_256x240.png
    // @grant       GM_getResourceURL
    // @grant       GM_getResourceText
    // @grant       GM_addStyle
    // @grant       unsafeWindow
    // @grant       GM_xmlhttpRequest
    // @grant       GM_download
    // @connect     ea.com
    // @connect     ea2.com
    // @connect     futbin.com
    // @connect     amazonaws.com
    // @connect     freakpants.ch
    // @connect     futbin.org
    // @connect     localhost
    // ==/UserScript==
    
    const MAX_CLUB_SEARCH = 90;
    
    const wait = async (seconds = 1) => {
      const rndFactor = Math.floor(Math.random());
      await new Promise((resolve) =>
        setTimeout(resolve, (rndFactor + seconds) * 1000)
      );
    };
    
    const sendWebRequest = (options) => {
      GM_xmlhttpRequest({
        method: options.method,
        url: options.url,
        onload: options.onload,
      });
    };
    
    const sendExternalRequest = async (options) => {
      if (isPhone()) {
        sendPhoneRequest(options);
      } else {
        sendWebRequest(options);
      }
    };
    
    const postPriceDataWithRange = function (resourceId, console_price, min_price, max_price) {
      console.log(resourceId);
      console.log(console_price);
      if(resourceId === undefined || console_price === undefined){
        return;
      }
      
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "POST",
          dataType: "json",
          url: "http://localhost/fut/postPriceData.php",
          data: JSON.stringify({resourceId, console_price, min_price, max_price}),	
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          onload: function (response) {
            console.log("got response from posting price data");
            console.log(response.responseText);
            return resolve(response.responseText);
          },
        });
      });
    };
    
    const sendRequest = (url, method, identifier) => {
      return new Promise((resolve, reject) => {
        sendExternalRequest({
          method,
          identifier,
          url,
          onload: (res) => {
            if (res.status !== 200) {
              return reject();
            }
            return resolve(res.response);
          },
        });
      });
    };
    
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    };
    
    const showLoader = () => {
      $(".ut-click-shield").addClass("showing");
      $(".loaderIcon ").css("display", "block");
    };
    
    const hideLoader = () => {
      $(".ut-click-shield").removeClass("showing");
      $(".loaderIcon ").css("display", "none");
    };
    
    const downloadCsv = (csvContent, fileName) => {
      const encodedUri =
        "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", \`\${fileName}.csv\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    const downloadJson = (jsonContent, fileName) => {
      const encodedUri =
        "data:text/json;charset=utf-8,%EF%BB%BF" + encodeURIComponent(JSON.stringify(jsonContent));
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", \`\${fileName}\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    const getClubSquad = (searchCriteria) => {
      return services.Club.search(searchCriteria);
    };
    
    const getAllClubPlayers = function (filterLoaned, playerId) {
      return new Promise((resolve) => {
        const searchCriteria = new UTBucketedItemSearchViewModel().searchCriteria;
        if (playerId) {
          searchCriteria.defId = [playerId];
        }
        searchCriteria.count = MAX_CLUB_SEARCH;
        let gatheredSquad = [];
    
        const getAllSquadMembers = () => {
          getClubSquad(searchCriteria).observe(
            this,
            async function (sender, response) {
              gatheredSquad = [
                ...response.response.items.filter(
                  (item) => !filterLoaned || item.loans < 0
                ),
              ];
              if (response.status !== 400 && !response.response.retrievedAll) {
                searchCriteria.offset += searchCriteria.count;
                await wait(1);
                getAllSquadMembers();
              } else {
                resolve(gatheredSquad);
              }
            }
          );
        };
        getAllSquadMembers();
      });
    };
    
    const lookUp = new Map();
    
    const setValue = (key, value) => {
      lookUp.set(key, value);
    };
    
    const getUserPlatform = () => {
      let platform = getValue("userPlatform");
      if (platform) return platform;
    
      if (services.User.getUser().getSelectedPersona().isPlaystation) {
        setValue("userPlatform", "ps");
        return "ps";
      } else if (services.User.getUser().getSelectedPersona().isXbox) {
        setValue("userPlatform", "ps");
        return "ps";
      } else {
        setValue("userPlatform", "pc");
        return "pc";
      }
    };
    
    const getValue = (key) => {
      const value = lookUp.get(key);
      if (value && value.expiryTimeStamp && value.expiryTimeStamp < Date.now()) {
        lookUp.delete(key);
        return null;
      }
      return value;
    };
    
    const fetchPlayerPrices = async (playerIds, result) => {
      const idsArray = Array.from(playerIds);
      const platform = getUserPlatform();
      while (idsArray.length) {
        const playersIdArray = idsArray.splice(0, 30);
        const primaryId = playersIdArray.shift();
        if (!primaryId) {
          continue;
        }
        const refIds = playersIdArray.join(",");
        try {
          const futBinResponse = await sendRequest(
            \`https://www.futbin.com/23/playerPrices?player=\${primaryId}&rids=\${refIds}\`,
            "GET",
            \`\${Math.floor(+new Date())}_fetchPlayerPrices\`
          );
    
          const priceResponse = JSON.parse(futBinResponse);
    
          for (const id of [primaryId, ...playersIdArray]) {
            const lcPrice = priceResponse[id].prices[platform].LCPrice;
            if (!lcPrice) {
              continue;
            }
    
            const cardPrice = parseInt(lcPrice.replace(/[,.]/g, ""));
    
            const cacheValue = {
              expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
              price: cardPrice,
            };
            setValue(id, cacheValue);
            result.set(id, cardPrice);
          }
        } catch (err) {
          console.log(err);
        }
      }
    };
    
    const postPriceData = function (resourceId, console_price) {
      console.log(resourceId);
      console.log(console_price);
      if(resourceId === undefined || console_price === undefined){
        return;
      }
      
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "POST",
          dataType: "json",
          url: "http://localhost/fut/postPriceData.php",
          data: JSON.stringify({resourceId, console_price}),	
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          onload: function (response) {
            console.log("got response from posting price data");
            console.log(response.responseText);
            return resolve(response.responseText);
          },
        });
      });
    };
    
    const fetchPrices = async (items) => {
      const result = new Map();
    
      const missingPlayerIds = new Set();
      const missingConsumables = new Map();
    
      for (const item of items) {
        if (!item.definitionId) {
          continue;
        }
    
        const priceDetail = getValue(item.definitionId);
        if (priceDetail) {
          result.set(item.definitionId, priceDetail.price);
        } else if (item.isPlayer()) {
          missingPlayerIds.add(item.definitionId);
        } else if (
          item.isTraining() &&
          supportedConsumables.has(item._staticData.name)
        ) {
          if (!missingConsumables.has(item._staticData.name)) {
            missingConsumables.set(item._staticData.name, []);
          }
          missingConsumables.get(item._staticData.name).push({
            definitionId: item.definitionId,
            subType: getCardName(item),
          });
        }
      }
    
      const pendingPromises = [];
    
      if (missingPlayerIds.size) {
        pendingPromises.push(fetchPlayerPrices(missingPlayerIds, result));
      }
    
      if (missingConsumables.size) {
        pendingPromises.push(fetchConsumablesPrices(missingConsumables, result));
      }
      await Promise.all(pendingPromises);
    
      return result;
    };
    
    const getCardQuality = (card) => {
      if (card.isGoldRating()) {
        return "Gold";
      } else if (card.isSilverRating()) {
        return "Silver";
      } else if (card.isBronzeRating()) {
        return "Bronze";
      }
      return "";
    };
    
    const downloadClub = async () => {
      showLoader();
      let squadMembers = await getAllClubPlayers();
      squadMembers = squadMembers.sort((a, b) => b.rating - a.rating);
    
      console.log(squadMembers);
      squadMembers.forEach((member) => {
        console.log(JSON.stringify(member, getCircularReplacer()));
      });
    
      await fetchPrices(squadMembers);
    
      let csvContent = "";
      const headers =
        "Player Name,Rating,Quality,Rarity,Position,Nation,League,Club,Price Range,FUTBIN Price,Bought For,Discard Value,Contract Left,IsUntradable,IsLoaned";
      csvContent += headers;
    
      const jsonContent = squadMembers.map((squadMember) => {
        let rarity = "";
        if (ItemRarity[squadMember.rareflag]) {
          rarity += !squadMember.rareflag
            ? "COMMON"
            : ItemRarity[squadMember.rareflag];
        } else if (squadMember.isSpecial()) {
          rarity += "SPECIAL";
        }
        let itemPriceLimits = '';
        let minRange = 0;
        let maxRange = 0;
        if (squadMember._itemPriceLimits) {
          itemPriceLimits +=
            "Min: " +
            squadMember._itemPriceLimits.minimum +
            " Max: " +
            squadMember._itemPriceLimits.maximum;
          minRange = squadMember._itemPriceLimits.minimum;
          maxRange = squadMember._itemPriceLimits.maximum;
        } else {
          itemPriceLimits += "--NA--";
    
        }
        const existingValue = getValue(squadMember.definitionId);
        let futbinPrice = "--NA--";
        if (existingValue && existingValue.price && typeof(existingValue.price) === 'string') {
          futbinPrice = existingValue.price.replace(/[,.]/g, "");
        }  else if(existingValue && existingValue.price) {
          futbinPrice = existingValue.price;
        }
        return [
          squadMember._metaData.id,
          squadMember.teamId,
          squadMember.rating,
          itemPriceLimits,
          futbinPrice,
          squadMember.lastSalePrice,
          squadMember.discardValue,
          squadMember.contract,
          squadMember.untradeable,
          squadMember.loans >= 0,
          squadMember.definitionId,
          minRange,
          maxRange,
          squadMember
        ];
      });
      console.log(jsonContent);
      await submitJsonData(jsonContent);
    
      // downloadJson(jsonContent, "club.json");
    
    
      for (const squadMember of squadMembers) {
        let rowRecord = "";
        rowRecord += squadMember._staticData.name + ",";
        rowRecord += squadMember.rating + ",";
        rowRecord += getCardQuality(squadMember) + ",";
        if (ItemRarity[squadMember.rareflag]) {
          rowRecord += !squadMember.rareflag
            ? \`\${services.Localization.localize("item.raretype0")},\`
            : ItemRarity[squadMember.rareflag] + ",";
        } else if (squadMember.isSpecial()) {
          rowRecord +=
            services.Localization.localize("search.cardLevels.cardLevel4") + ",";
        } else {
          rowRecord += ",";
        }
        rowRecord +=
          UTLocalizationUtil.positionIdToName(
            squadMember.preferredPosition,
            services.Localization
          ) + ",";
        rowRecord +=
          UTLocalizationUtil.nationIdToName(
            squadMember.nationId,
            services.Localization
          ) + ",";
        rowRecord +=
          UTLocalizationUtil.leagueIdToName(
            squadMember.leagueId,
            services.Localization
          ) + ",";
        rowRecord +=
          UTLocalizationUtil.teamIdToAbbr15(
            squadMember.teamId,
            services.Localization
          ) + ",";
        if (squadMember._itemPriceLimits) {
          rowRecord +=
          \`\${services.Localization.localize("abbr.minimum")}\` +
            squadMember._itemPriceLimits.minimum +
            \` \${services.Localization.localize("abbr.maximum")}\` +
            squadMember._itemPriceLimits.maximum +
            ",";
        } else {
          rowRecord += "--NA--,";
        }
        const existingValue = getValue(squadMember.definitionId);
        if (existingValue && existingValue.price) {
          rowRecord += existingValue.price + ",";
        } else {
          rowRecord += "--NA--,";
        }
        rowRecord += squadMember.lastSalePrice + ",";
        rowRecord += squadMember.discardValue + ",";
        rowRecord += squadMember.contract + ",";
        rowRecord += squadMember.untradeable + ",";
        rowRecord += (squadMember.loans >= 0) + ",";
    
        csvContent += rowRecord;
      }
      const club = services.User.getUser().getSelectedPersona().getCurrentClub();
      // downloadCsv(csvContent, club.name);
    
      hideLoader();
    };
    
    const createButton = function (text, callBack, customClass) {
      const stdButton = new UTStandardButtonControl();
      stdButton.init();
      stdButton.addTarget(stdButton, callBack.bind(stdButton), EventType.TAP);
      stdButton.setText(text);
    
      if (customClass) {
        const classes = customClass.split(" ").filter(Boolean);
        for (let cl of classes) stdButton.getRootElement().classList.add(cl);
      }
    
      return stdButton;
    };
    
    const generateDownloadClubCsv = () => {
      return createButton(
        "Sync Club",
        downloadClub,
        "btn-standard mini downloadClub clubAction"
      );
    };
    
    const clubPageGenerate = UTClubItemSearchHeaderView.prototype._generate;
    UTClubItemSearchHeaderView.prototype._generate = function (...args) {
      if (!this._generated) {
        clubPageGenerate.call(this, ...args);
        const downloadClubBtn = generateDownloadClubCsv();
        this.__searchContainer.prepend(downloadClubBtn.__root);
      }
    };
    
    const submitJsonData = function (jsonContent) {
        return new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: "POST",
            dataType: "json",
            url: "https://freakpants.ch/fut/php/sync.php?user_id=${userId}",
            data: JSON.stringify(jsonContent, getCircularReplacer()),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            onload: function(response) {
              console.log(response.responseText);
              resolve();
            }
          });
        });
      };
    `], 'club-sync.user.js', {
      type: 'text/plain',
    });
    const link = document.createElement('a')
    const url = URL.createObjectURL(file)
  
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
  
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
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

  handlePageChange(event, value) {
    this.setState({ currentPage: value });
  }

  componentDidMount() {
    // check if href contains clubsync
    const url = window.location.href;
    if (url.includes("clubsync")) {
      this.setState({ clubSync: true });
    }

    // get rarities
    let rarities = require("./rarities.json");
    this.setState({ rarities: rarities });
    /* axios
      .get(process.env.REACT_APP_AJAXSERVER + "getRarities.php")
      .then((response) => {
        console.log(response.data);
        this.setState({ rarities: response.data });
      })
      .catch((error) => {
        console.log(error);
      }); */
    // get wc players
    let wcPlayers = require("./wcPlayers.json");
    // get distinct wc countries
    let countries = [];
    wcPlayers.forEach((player) => {
      if (!countries.includes(player.nationId)) {
        countries.push(player.nationId);
      }
    });
    this.setState({ wcPlayers: wcPlayers, wcCountries: countries });
    /* axios
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
      }); */

    // get owned players from localstorage
    let players = JSON.parse(localStorage.getItem("players"));
    this.setState({ players: players });
  }

  handleCancelProfile() {
    this.setState({ editingProfile: false });
  }

  handleSubFilterClick(event) {
    console.log(event);
    let subCollection = event.target.getAttribute("data-value");
    if(subCollection === this.state.subCollection) {
      subCollection = "none";
    }
    this.setState({ subCollection: subCollection, currentPage: 1 });

  }

  handlePlayerClick(event, definitionId) {
    let player = definitionId;
    console.log("clicked player: " + player);
    let players = this.state.players;
    if (players && players.length > 0 && players.includes(player)) {
      players = players.filter((item) => item !== player);
    } else {
      if(players && players.length > 0){
        players.push(player);
      } else {
        players = [player];
      }
    }
    console.log("setting players to: " + players);
    this.setState({ players: players });
    // saving players to local storage
    localStorage.setItem("players", JSON.stringify(players));
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


    const stateHasPlayers = this.state.players && this.state.players.length > 0;
    let wcPlayers = this.state.wcPlayers;

    let wcPlayersCollected = 0;
    wcPlayers.forEach((wcPlayer) => {
      let player = false;
      if(stateHasPlayers) {
        player = this.state.players.find(
          (player) => player === wcPlayer.definitionId
        );
      }
      if (player) {
        wcPlayersCollected++;
      } 
    });

    // filter by team if needed
    if (this.state.subCollection !== "none") {
      wcPlayers = wcPlayers.filter((player) => {
        return player.nationId === this.state.subCollection;
      });
    }

    const filteredCount = wcPlayers.length;

    let currentCollected = 0;
    wcPlayers.forEach((wcPlayer) => {
      let player = false;
      if(stateHasPlayers) {
        player = this.state.players.find(
          (player) => player === wcPlayer.definitionId
        );
      }
      if (player) {
        currentCollected++;
      } 
    });
    

    // determine number of pages
    let pages = Math.ceil(wcPlayers.length / 40);

    // get current page
    let currentPage = this.state.currentPage;

    // get players for current page
    wcPlayers = wcPlayers.slice(
      (currentPage - 1) * 40,
      currentPage * 40
    );

   
    wcPlayers.forEach((wcPlayer) => {
      let player = false;
      if(stateHasPlayers) {
        player = this.state.players.find(
          (player) => player === wcPlayer.definitionId
        );
      }
      if (player) {
        wcPlayer.exists = true;
      } else {
        wcPlayer.exists = false;
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
          { this.state.clubSync && (
          <div id="download-js" onClick={this.downloadJs}>
            Download Club Sync Script
          </div>
          )}
        </div>
        <div id="subfilters">
          {this.state.collection === "wcplayers" && (
            <div>
              {this.state.wcCountries.map((country) => (
                /* <img alt="country-flag"
                onClick={this.handleSubFilterClick}
                data-value={country}
                  className={"national-team" + (this.state.subCollection === country ? " selected" : "") + (this.state.subCollection !== "none" ? " faded" : "")}
                  src={
                    "https://cdn.futbin.com/content/fifa23/img/clubs/" +
                    country +
                    ".png"
                  }
                /> */
                <img alt="country-flag"
                onClick={this.handleSubFilterClick}
                data-value={country}
                  className={"national-team" + (this.state.subCollection === country ? " selected" : "") + (this.state.subCollection !== "none" ? " faded" : "")}
                  src={require(
                    "./assets/flags/f_" +
                    country +
                    ".png")
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
                onClick={(event) => this.handlePlayerClick(event, player.definitionId)}
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
              onClick={(event) => this.handlePlayerClick(event, player.definitionId)}
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
                  <div className={"card__wrapper__item placeholder"} >
                    <img alt="placeholder"
                      className={"card__wrapper__item__bg"}
                      src={
                        "https://freakpants.ch/fut/php/cards/placeholder.png"
                      }
                    />

                    <div className="card__wrapper__item__ratings">
                      <span className="card__wrapper__item__ratings__position">
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
        {this.state.collection === "wcplayers" && (
        <React.Fragment>
        <div id="pagination">
          <Pagination
            count={pages}
            page={currentPage}
            onChange={this.handlePageChange}
            color="primary"
          />
        </div>
        <div id="counts">
          <div id="counts-total">
            <span className="counts-total-label">Collected: </span>
            { this.state.wcPlayers && this.state.wcPlayers.length > 0 && this.state.players && this.state.players.length > 0 &&(
            <span className="counts-total-value">{wcPlayersCollected} of {this.state.wcPlayers.length} (
             {Math.floor(100 / this.state.wcPlayers.length * wcPlayersCollected)}%)</span>
            )}
          </div>
          <div id="counts-current">
            <span className="counts-current-label">Current Selection: </span>
            <span className="counts-current-value">{currentCollected} of {filteredCount} (
            {Math.floor(100 / filteredCount * currentCollected)}%)
            </span>
          </div>
        </div>
        </React.Fragment>
        )}

      </ThemeProvider>
    );
  }
}
export default App;
