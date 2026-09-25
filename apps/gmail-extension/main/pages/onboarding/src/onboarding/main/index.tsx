import React from "react";
import {Description, Footer, Root,} from "@src/onboarding/main/main.style";


const GmailOnBoarding = () => {

  React.useLayoutEffect(() => {
    document.title = "Onboarding | Safekids.ai for email";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Root>
      <div className="container">
        <a href="https://www.safekids.ai">
          <img
            src={"/images/extension-imgs/safeKids_logo.png"}
            alt="Safe kids logo image"
          />
          <span>for Email</span>
        </a>
        <Description></Description>
      </div>
      <Footer>
        <span>© All Rights Reserved – Numora Capital, LLC.</span>
        <span>
          Safe Kids’{" "}
          <a
            className="primary-text cursor-pointer"
            href="https://www.safekids.ai/termsandconditions"
            target="_blank"
          >
            Services Terms
          </a>{" "}
          and{" "}
          <a
            className="primary-text cursor-pointer"
            href="https://www.safekids.ai/privacy_policy"
            target="_blank"
          >
            Privacy Policy.
          </a>
        </span>
      </Footer>
    </Root>
  );
};

export default GmailOnBoarding;
