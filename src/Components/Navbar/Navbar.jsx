import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, Image, Button } from "react-bootstrap";
import { loadWeb3 } from "../api/api";
import { Link } from "react-router-dom";
import "./Navbar.css";
const NavbarCustom = () => {
  const navigate = useNavigate();

  const [show, handleShow] = useState(false);
  let [btnText, setBtnText] = useState("Connect Wallet");

  const getAccount = async () => {
    let acc = await loadWeb3();
    console.log("ACC=", acc);
    if (acc != "false") {
      if (acc == "No Wallet") {
        setBtnText("No Wallet");
      } else if (acc == "Wrong Network") {
        setBtnText("Wrong Network");
      } else {
        let myAcc =
          acc && acc?.substring(0, 4) + "..." + acc?.substring(acc?.length - 4);
        setBtnText(myAcc);
      }
    } else {
      setBtnText("Connect Wallet");
    }
  };

  useEffect(() => {
    let prev = window.scrollY;
    let scrollD = "";

    window.addEventListener("scroll", (e) => {
      const window = e.currentTarget;

      if (prev > window.scrollY) {
        scrollD = "up";
      } else if (prev < window.scrollY) {
        scrollD = "down";
      }
      prev = window.scrollY;

      if (window.scrollY > 40 && scrollD === "up") {
        handleShow(true);
      } else handleShow(false);
    });
    return () => {
      window.removeEventListener("scroll");
    };
  }, []);

  const navItem = [
    {
      title: "NoWallet",
      link: "/wallet",
    },
  ];

  useEffect(() => {
    setInterval(() => {
      getAccount();
    }, 1500);
  }, []);

  return (
    <div className="header">
      {/* <div className="resNav">
        <img src="/10PATTILOGO.png" alt="logo" id="patti-logo" width={50} />
        <div className="btn btn-dark accoutadd">{btnText}</div>
      </div> */}
      <div className="container">
        <div className="header-bottom">
          <div className="header-bottom-area align-items-center">
            <div className="logo">
              {/* <a href="">
                <img src="/10PATTILOGO.png" alt="logo" />
              </a> */}
              <h1
                className="banner-content__title"
                style={{
                  fontSize: "27px",
                  color: "#efc164",
                  textShadow: "3px -4px 8px rgb(255 200 39 / 30%)",
                }}
              >
                ULE TEN CARD GAME
              </h1>
            </div>
            <ul className="menu">
              <li className="button-wrapper">
                <a href="#" className="bxshdow cmn--btn active btn--lg">
                  {btnText}
                </a>
              </li>
              <button className="btn-close btn-close-white d-lg-none"></button>
            </ul>
            <div className="header-trigger-wrapper d-flex d-lg-none align-items-center">
              <div className="header-trigger me-4">
                <span></span>
              </div>
              <a href="#" className="cmn--btn active btn--md d-none d-sm-block">
                No Wallet
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    // here is  your code
  );
};

export default NavbarCustom;
