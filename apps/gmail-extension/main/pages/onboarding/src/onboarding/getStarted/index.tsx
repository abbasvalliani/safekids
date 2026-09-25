import React, {useEffect} from "react";
import { Root, ContinueButton, Footer } from "@src/onboarding/getStarted/getStarted.style";
import { SubmitButton } from "@src/components";
const GetStarted = () => {
  useEffect(() => {
    saveUserOptIn();
  }, []);
  const completeOnBoarding = async () => {
    try {
      saveUserOptIn();
    } catch (err) {
      console.log(err);
    } finally {
      closeTab();
    }
  };
  const saveUserOptIn = () => {
    chrome.runtime.sendMessage({ type: "SAVE_OPT_IN",payload: {
        onboardingDone: true,
        onboardingTime: new Date()
      } });
  };
  const closeTab = () => {
    chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
  };

  React.useLayoutEffect(() => {
    document.title = "Onboarding | Safekids.ai for cache";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const GetCurrentScreen = ({}) => {
    return (
      <>
        <Root>
          <div className="text-container">
            <span className="welcome-text">Welcome To</span>
            <img
              src={"/images/safeKids_logo.svg"}
              alt="Safe kids logo image"
            />
            <span className="for-text">for Email</span>
          </div>
          <div className="banner-section">
            <img
              className="img-1"
              src={"/images/getStarted.png"}
              alt="Get started image"
            />
            <img
              className="img-2"
              src={"/images/inbox_Img.png"}
              alt="Inbox image"
            />
            <div className="content">
              <h2>Safe Kids for Email helps you:</h2>
              <ul>
                <li>
                  <div className="dot"></div>
                  <span>Know an email might be unkind before you open it</span>
                </li>
                <li>
                  <div className="dot"></div>
                  <span>Write kinder emails</span>
                </li>
              </ul>
            </div>
          </div>
          <ContinueButton>
            <SubmitButton
              id={"getStartedButton"}
              text="Get Started"
              onClick={() => completeOnBoarding()}
            />
          </ContinueButton>
        </Root>
        <Footer>
          <span>© All Rights Reserved – Numora Capital, LLC.</span>
          <span>
            Safe Kids’{" "}
            <a
              className="service-terms primary-text cursor-pointer"
              href="https://www.safekids.ai/termsandconditions"
              target="_blank"
            >
              Services Terms
            </a>{" "}
            and{" "}
            <a
              className="privacy-policy primary-text cursor-pointer"
              href="https://www.safekids.ai/privacy_policy"
              target="_blank"
            >
              Privacy Policy.
            </a>
          </span>
        </Footer>
      </>
    );
  };

  return <>{<GetCurrentScreen />}</>;
};

export default GetStarted;
