import {
  BronzeCommon,
  BronzeRare,
  SilverCommon,
  SilverRare,
  GoldRare,
  GoldCommon,
} from "./CardBackgrounds";
import React from "react";
class PlayerCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    const {
      lastName,
      knownAs,
      console_price,
      rating,
      weakFoot,
      rareflag,
      teamId,
      playerId,
      nationId,
      pac,
      pas,
      phy,
      sho,
      dri,
      def,
      loaned,
      contracts,
      untradeable,
      definitionId,
      skillMoves,
      offensiveWorkRate,
      defensiveWorkRate,
      min_price,
      max_price,
      bestQualityImage,
      mainPosition,
    } = this.props.player;

    const { rarities } = this.props;
    let badge =
      "https://cdn.futbin.com/content/fifa23/img/clubs/" + teamId + ".png";
    let cardImage = BronzeCommon;
    let rarityClass = "gold";

    const workRates = offensiveWorkRate + "/" + defensiveWorkRate;

    if (parseInt(rating) > 74) {
      if (rareflag === "1") {
        cardImage = GoldRare;
      } else {
        cardImage = GoldCommon;
      }
    } else if (parseInt(rating) > 64) {
      // rarityClass = 'silver';
      if (rareflag === "1") {
        cardImage = SilverRare;
      } else {
        cardImage = SilverCommon;
      }
    } else {
      // rarityClass = 'bronze';
      if (rareflag === "1") {
        cardImage = BronzeRare;
      } else {
        cardImage = BronzeCommon;
      }
    }

    let bronzesilvergold = 0;
    if(rareflag === "3"){
      if(parseInt(rating) > 74){
        bronzesilvergold = 3;
        rarityClass = "totw gold";
      }else if(parseInt(rating) > 64){
        bronzesilvergold = 2;
        rarityClass = "totw silver";
      }else{
        bronzesilvergold = 1;
        rarityClass = "totw bronze";
      }
      cardImage = false;
    }

    if (rareflag > 3) {
      // look up rareflag in rarities
      const rarity = rarities.find((r) => r.id === rareflag);
      if (rarity) {
        rarityClass = rarity.rareClass;
      }
      cardImage = false;
    }

    const nationflag =
      "https://www.futwiz.com/assets/img/fifa22/flags/" + nationId + ".png";

    let src = "";
    let imageClass = "";
    switch (bestQualityImage) {
      case "unchecked":
        src = "";
        break;
      case "wefutDynamic":
        src =
          "https://static.wefut.com/assets/images/fut23/playeravatars/custom/" +
          definitionId +
          ".png";
        imageClass = "custom";
        break;
      case "futbinDynamic":
        src =
          "https://cdn.futbin.com/content/fifa23/img/players/p" +
          definitionId +
          ".png";
        imageClass = "custom";
        break;
      case "wefut":
        src =
          "https://static.wefut.com/assets/images/fut23/playeravatars/" +
          playerId +
          ".png";
        imageClass = "original";
      case "futbin":
        src =
          "https://cdn.futbin.com/content/fifa23/img/players/" +
          playerId +
          ".png";
        imageClass = "original";
        break;
      case "futggDynamic":
        src =
          "https://game-assets.fut.gg/cdn-cgi/image/quality=100,format=auto,width=300/2023/players/" +
          definitionId +
          ".png";
        imageClass = "custom";
        break;
    }

    let cardClass = "";
    cardClass = "" + rarityClass;

    if (this.props.small) {
      cardClass += " small";
    }

    if (untradeable === "1") {
      cardClass += " untradeable";
    }

    let formatted_console_price = console_price;
    if (parseInt(console_price) > 999) {
      formatted_console_price =
        (parseInt(console_price) / 1000).toFixed(1) + "K";
    }
    if (parseInt(console_price) > 99999) {
      formatted_console_price =
        (parseInt(console_price) / 1000).toFixed(0) + "K";
    }
    if (parseInt(console_price) > 999999) {
      formatted_console_price =
        (parseInt(console_price) / 1000000).toFixed(0) + "M";
    }

    let price_range = "SBC/";
    let prp = "Objective";
    if (min_price != 0) {
      let formatted_min_price = min_price;
      if (parseInt(min_price) > 999) {
        formatted_min_price = (parseInt(min_price) / 1000).toFixed(0) + "K";
      }
      if (parseInt(min_price) > 99999) {
        formatted_min_price = (parseInt(min_price) / 1000).toFixed(0) + "K";
      }
      if (parseInt(min_price) > 999999) {
        formatted_min_price = (parseInt(min_price) / 1000000).toFixed(0) + "M";
      }

      let formatted_max_price = max_price;
      if (parseInt(max_price) > 999) {
        formatted_max_price = (parseInt(max_price) / 1000).toFixed(0) + "K";
      }
      if (parseInt(max_price) > 99999) {
        formatted_max_price = (parseInt(max_price) / 1000).toFixed(0) + "K";
      }
      if (parseInt(max_price) > 999999) {
        formatted_max_price = (parseInt(max_price) / 1000000).toFixed(0) + "M";
      }

      price_range = formatted_min_price + " - " + formatted_max_price;
      // calculate price range percentage
      const range = parseInt(max_price) - parseInt(min_price);
      const $range_diff = parseInt(console_price) - parseInt(min_price);
      prp = "(" + Math.floor(($range_diff / range) * 100) + "%)";
    }

    let badgeOrFull = 'e';
    if (this.props.badge) {
      badgeOrFull = 's'
    }

    return (
      <div style={this.props.style} className={"card__wrapper " + (this.props.badge ? "badge" : "")} data-rareflag="79">
        {parseInt(loaned) > 0 && (
          <div class="ut-item-player-status--loan">{contracts}</div>
        )}
        <div class={"card__wrapper__item " + cardClass} >
          <img
            class="card__wrapper__item__bg"
            src={
              cardImage
                ? cardImage
                : "https://freakpants.ch/fut/php/cards/cards_bg_" + badgeOrFull +  "_1_" +
                  rareflag +
                  "_" + bronzesilvergold + ".png"
            }
          />
          <img class={"card__wrapper__item__dynamic " + imageClass} src={src} />
          <div class="card__wrapper__item__ratings">
            <span class="card__wrapper__item__ratings__rating">
              {rating}
              <span class="card__wrapper__item__ratings__rating__diff"></span>
            </span>
            <span class="card__wrapper__item__ratings__position">
              {mainPosition}
            </span>
            <div class="card__wrapper__item__ratings__extra">
              <div class="card__wrapper__item__ratings__divider"></div>
              <img
                src={nationflag}
                class="card__wrapper__item__ratings__nation"
              />
              <div class="card__wrapper__item__ratings__divider"></div>
              <img src={badge} class="card__wrapper__item__ratings__club" />
            </div>
          </div>
          <div class="card__wrapper__item__name">
            {knownAs !== "" && knownAs !== "---" ? knownAs : lastName}
          </div>
          {!this.props.badge && (
          <div class="card__wrapper__item__stats">
            <div class="card__wrapper__item__stats__dividers">
              <div class="card__wrapper__item__stats__dividers__hor"></div>
              <div class="card__wrapper__item__stats__dividers__ver"></div>
              <div class="card__wrapper__item__stats__dividers__horxs"></div>
            </div>
            <div class="card__wrapper__item__stats__row">
              <div class="card__wrapper__item__stats__row__cell">
                <span class="card__wrapper__item__stats__row__cell__value">
                  {pac}
                </span>
                <span class="card__wrapper__item__stats__row__cell__label">
                  PAC
                </span>
                <span class="card__wrapper__item__stats__row__cell__diff pos"></span>
              </div>
              <div class="card__wrapper__item__stats__row__cell">
                <span class="card__wrapper__item__stats__row__cell__value">
                  {dri}
                </span>
                <span class="card__wrapper__item__stats__row__cell__label">
                  DRI
                </span>
                <span class="card__wrapper__item__stats__row__cell__diff pos"></span>
              </div>
            </div>
            <div class="card__wrapper__item__stats__row">
              <div class="card__wrapper__item__stats__row__cell">
                <span class="card__wrapper__item__stats__row__cell__value">
                  {sho}
                </span>
                <span class="card__wrapper__item__stats__row__cell__label">
                  SHO
                </span>
                <span class="card__wrapper__item__stats__row__cell__diff pos"></span>
              </div>
              <div class="card__wrapper__item__stats__row__cell">
                <span class="card__wrapper__item__stats__row__cell__value">
                  {def}
                </span>
                <span class="card__wrapper__item__stats__row__cell__label">
                  DEF
                </span>
                <span class="card__wrapper__item__stats__row__cell__diff pos"></span>
              </div>
            </div>
            <div class="card__wrapper__item__stats__row">
              <div class="card__wrapper__item__stats__row__cell">
                <span class="card__wrapper__item__stats__row__cell__value">
                  {pas}
                </span>
                <span class="card__wrapper__item__stats__row__cell__label">
                  PAS
                </span>
                <span class="card__wrapper__item__stats__row__cell__diff pos"></span>
              </div>
              <div class="card__wrapper__item__stats__row__cell">
                <span class="card__wrapper__item__stats__row__cell__value">
                  {phy}
                </span>
                <span class="card__wrapper__item__stats__row__cell__label">
                  PHY
                </span>
                <span class="card__wrapper__item__stats__row__cell__diff pos"></span>
              </div>
            </div>


            <div class="card__wrapper__item__pricing">
              <div>
                <img
                  src="https://cdn.futbin.com/design/img/logos/small/ps_blue.png"
                  title="Console market"
                />
                <img
                  src="https://cdn.futbin.com/design/img/logos/small/xbox_green.png"
                  title="Console market"
                />
                <span class="card__wrapper__item__pricing__price">{formatted_console_price}</span> |
                <img
                  src="https://cdn.futbin.com/design/img/logos/small/pc_orange.png"
                  title="PC market"
                />
                <span class="card__wrapper__item__pricing__price"></span>
              </div>
              <div class="card__wrapper__item__pricing__pricerange">
               {price_range}
              </div>
            </div>
          </div>
    )}

          <div class="card__wrapper__item__alts"></div>
          {!this.props.badge && (
          <div class="card__wrapper__item__extra no-promo">
            <span>left</span>
            <span>L/L WR</span>
            <span data-skill-moves-diff="0">
              4<img src="https://freakpants.ch/fut/php/star.png" title="Star" />{" "}
              SM
            </span>
            <span data-weak-foot-diff="0">
              4<img src="https://freakpants.ch/fut/php/star.png" title="Star" />{" "}
              WF
            </span>
          </div>
          )}
        </div>
      </div>
    );
  }
}
export default PlayerCard;
