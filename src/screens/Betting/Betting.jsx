import React, { useState, useEffect, useRef } from "react";
import {
  contractAddress,
  abi,
  tokenAddress,
  tokenAbi,
} from "../../Components/Utils/utils";
import { loadWeb3 } from "../../Components/api/api";
import { toast } from "react-toastify";
import { card } from "./array";
import axios from "axios";
import spinnerImage from "../assets/images/game/spinersmall.png";
function Betting({ selectedCard }) {
  let [userRewards, setUsersRewards] = useState(0);
  let [minutes, setMinutes] = useState(0);
  const [betButton, setbetButton] = useState("Bet Now!");
  let [secods, setSeconds] = useState(0);
  let [toggle, setToggle] = useState(false);
  let [contractStarttime, setContractstartTime] = useState();
  let [timerCalculate, setTimercalcuate] = useState(false);
  const [modal, setModal] = useState();
  const [mybalance, setMybalance] = useState(0);
  let [myWinningCard, setMywinningCard] = useState();
  let betAmount = useRef(0);
  let userWonCard = card.filter((data) => data.id == myWinningCard);

  const withDrawal = async () => {
    try {
      let add = await loadWeb3();
      if (add == "No Wallet") {
        toast.error("No Wallet");
      } else if (add == "Wrong Wallet") {
        toast.error("Wrong Wallet");
      } else {
        if (userRewards > 0) {
          const web3 = window.web3;
          let contract = new web3.eth.Contract(abi, contractAddress);
          await contract.methods.withDraw_Reward().send({
            from: add,
          });
        } else {
          toast.error("No Rewards Found");
        }
      }
    } catch (e) {
      console.log("Error while withdrawing amount", e);
      toast.error("Error While Amount WithDrawal");
    }
  };

  const getData = async () => {
    try {
      let add = await loadWeb3();
      if (add == "No Wallet") {
        console.log("No Wallet");
      } else if (add == "Wrong Wallet") {
        console.log("Wrong Wallet");
      } else {
        let currentTime = Math.floor(new Date().getTime() / 1000.0);
        const web3 = window.web3;
        let contractOf = new web3.eth.Contract(abi, contractAddress);
        let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        let myBalnce = await tokenContract.methods.balanceOf(add).call();
        let convertedBalanc = await window.web3.utils.fromWei(myBalnce);
        convertedBalanc = parseFloat(convertedBalanc).toFixed(3);
        setMybalance(convertedBalanc);
        let winnerPool = await contractOf.methods.winnerpool().call();
        let startTime = await contractOf.methods.betTime().call();

        let rewards = await contractOf.methods.rewarded(add).call();
        rewards = web3.utils.fromWei(rewards);
        rewards = parseFloat(rewards).toFixed(3);
        if (startTime == 0) {
          setMinutes("00");
          setSeconds("00");
        } else {
          startTime = currentTime - startTime;
          // console.log("Start time =",startTime);

          let myMinutes = startTime / 60;
          myMinutes = parseInt(myMinutes);
          let Seconds = startTime - myMinutes * 60;
          setMinutes(myMinutes);
          setSeconds(Seconds);
          // console.log("Minutes: ", parseInt(myMinutes));
          // console.log("Seconds: ", startTime);
          if (startTime > 480 && startTime < 500) {
            setTimercalcuate(true);
          } else if (startTime == 600) {
            // console.log("Calling the Api");
            setTimercalcuate(false);
            let myApiData = await axios.get(
              "https://ule.wyzth.org/Calculate_reward"
            );
            console.log("myApiData", myApiData);
          } else if (startTime >= 600) {
            setMinutes("10");
            setSeconds("00");
          }
        }
        setContractstartTime(startTime);
        setMywinningCard(winnerPool);
        setUsersRewards(rewards);
      }
    } catch (e) {
      console.log("Error Wile Getting data", e);
    }
  };

  // bet amount
  const betAmountfunc = async () => {
    // console.log("inside", selectedCard)
    let myValue = betAmount.current.value;
    // console.log("My Value", myValue);
    let add = await loadWeb3();
    // console.log("Address = ", add);
    if (add == "No Wallet") {
      console.log("No Wallet");
      toast.error("No Wallet Connected");
    } else if (add == "Wrong Network") {
      console.log("Wrong Wallet");
      toast.error("Wrong Wallet");
    } else {
      // console.log("Clicked  id ",modal);
      const web3 = window.web3;
      setbetButton("Please wait while processing...");
      // setButtonState(true);
      // console.log(buttonState)
      try {
        let contract = new web3.eth.Contract(abi, contractAddress);
        let tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        let myBalnce = await tokenContract.methods.balanceOf(add).call();
        let convertedBalanc = await window.web3.utils.fromWei(myBalnce);
        convertedBalanc = parseFloat(convertedBalanc).toFixed(3);
        setMybalance(convertedBalanc);

        if (selectedCard == undefined) {
          console.log("No Card Selected");
          toast.error("No Card Selected");
        } else {
          if (myValue >= 1) {
            if (contractStarttime < 480) {
              if (parseFloat(convertedBalanc) >= parseFloat(myValue)) {
                await tokenContract.methods
                  .approve(contractAddress, web3.utils.toWei(myValue))
                  .send({ from: add })
                  .then(async (output) => {
                    setbetButton("Please wait for second Confirmation");
                    selectedCard = selectedCard + 1;
                    await contract.methods
                      .bet(selectedCard, web3.utils.toWei(myValue))
                      .send({
                        from: add,
                      });
                    toast.success("Transaction Successfull");
                    loadWeb3();
                    setToggle(!toggle);
                    let myBalnce = await tokenContract.methods
                      .balanceOf(add)
                      .call();
                    let convertedBalanc = await window.web3.utils.fromWei(
                      myBalnce
                    );
                    convertedBalanc = parseFloat(convertedBalanc).toFixed(3);
                    setMybalance(convertedBalanc);
                    betAmount.current.value = "";
                  })
                  .catch((e) => {
                    toast.error("Card purchase rejected");
                    console.log("response", e);
                  });
              } else {
                toast.error("Amount is Greater than Your Balance");
              }
            } else {
              toast.error("Pool Time Is Over");
            }
          } else {
            toast("Minimum Bet is 1 ");
          }
        }
        // setValue("")
        // setButtonState(false)
        setbetButton("Bet Now!");
      } catch (error) {
        console.log("Error while Betting Amount ", error);
        setbetButton("Bet Now!");
      }
    }
  };
  useEffect(() => {
    setInterval(() => {
      getData();
    }, 1000);
    loadWeb3();
  }, [toggle]);
  return (
    <section className="how-section padding-top padding-bottom bg_img bg_img2">
      <div className="container">
        <div className="profile-edit-wrapper">
          <div className="row gy-5">
            <div className="col-xl-6">
              <h2
                className="section-header__title"
                style={{ fontSize: "25px" }}
              >
                CHOOSE BETTING AMOUNT IN ULE TOKEN
              </h2>
              <div className="custom--card card--lg">
                <div className="card--body">
                  <div className="row gy-3">
                    <div className="main">
                      <div className="form-group">
                        <label
                          for="fname"
                          className="section-header__title form-label top"
                        >
                          Timer
                        </label>
                      </div>
                      <div className="form-group center">
                        <label for="lname" className="form-label top">
                          {minutes}:{secods}
                        </label>
                      </div>

                      <div
                        className="form-group center spiner1"
                        onclick="document.getElementById('id01').style.display='block'"
                        style={{ width: "auto" }}
                      >
                        <img width={50} src={spinnerImage} />
                      </div>
                    </div>

                    <div className="main">
                      <div className="form-group">
                        <label
                          for="uname"
                          className=" section-header__title form-label"
                        >
                          Your Rewards
                        </label>
                      </div>

                      <div className="form-group">
                        <label
                          for="email"
                          className=" section-header__title form-label"
                        >
                          {userRewards} ULE Token
                        </label>
                      </div>
                    </div>

                    <div className="main">
                      <div className="form-group">
                        <label
                          for="number"
                          className="section-header__title form-label"
                        >
                          My Wallet
                        </label>
                      </div>

                      <div className="form-group">
                        <label
                          for="addr"
                          className="section-header__title form-label"
                        >
                          {mybalance} ULE Token
                        </label>
                      </div>
                    </div>

                    <div className="main">
                      <div className="form-group">
                        <label
                          for="zip"
                          className="section-header__title form-label"
                        >
                          Bet Amount
                        </label>
                      </div>
                      <div className="form-group1" style={{ width: "30%" }}>
                        <input
                          ref={betAmount}
                          id="zip"
                          type="text"
                          className="form-control form--control style-two  "
                          placeholder=""
                        />
                      </div>

                      <div className="form-group center">
                        <label
                          className="form-label section-header__title"
                          for="about"
                        >
                          ULE Token
                        </label>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group">
                        <label className="form-label" for="about">
                          *Min bet 1 token, Max bet 40,000 token
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <button
                        className="cmn--btn active mt-3"
                        onClick={() => betAmountfunc()}
                      >
                        {betButton}
                      </button>
                    </div>
                    <div className="col-md-4">
                      <button
                        className="cmn--btn active mt-3"
                        onClick={() => withDrawal()}
                      >
                        Withdrawal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-6">
              {timerCalculate ? (
                <div>
                  <center className="banner_topOne">
                    <img
                      src="logo.png"
                      alt="banner"
                      className="form-group center spiner1"
                      style={{ width: "60%" }}
                    />
                  </center>
                </div>
              ) : (
                <div className="section-header text-center">
                  <h2
                    className="section-header__title"
                    style={{ fontSize: "25px" }}
                  >
                    WINNING CARD HISTORY
                  </h2>
                  <div className="row justify-content-center">
                    <div className="col-lg-12 col-xl-6 col-md-6 col-sm-6">
                      <div
                        className="game-item"
                        style={{ padding: "24px 11px" }}
                      >
                        <div className="game-inner">
                          <div className="game-item__thumb img2 ">
                            {userWonCard.map((items) => {
                              return (
                                <div className="textdivinwonsection">
                                  {/* <h2 className="text-4xl  text-main font-semibold xsm:text-md ">Win Card</h2><br /> */}
                                  <img
                                    src={items.imgSrc}
                                    alt="User Winning Card"
                                    height="36%"
                                    width="400px"
                                    className="ml-10 cardherewon"
                                  />
                                </div>
                              );
                            })}

                            {/* <img src="/2.png" alt="game"/> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Betting;
