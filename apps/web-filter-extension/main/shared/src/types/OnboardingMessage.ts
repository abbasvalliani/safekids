export type OnBoardingMessages = {
    getStarted_footer_safeKids: string;
    getStarted_footer_servicesTerms: string;
    getStarted_footer_and: string;
    getStarted_footer_privacyPolicy: string;
    getStarted_footer_rights_reserved: string;
    getStarted_welcome: string;
    getStarted_login: string;
    getStarted_redirect_signup: string;
    getStarted_getCompanionApp: string;
    getStarted_getCompanionApp_button: string;
    getStarted_gotCompanionApp_button: string;
    getStarted_getCompanionApp_description: string;
    getStarted_redirect_signup_link: string;
    getStarted_enter_code_paragraph: string;
    getStarted_enter_code_btn_text: string;
    getStarted_or: string;
    getStarted_kidsLogin: string;
    getStartedQuickButton: string;
    getStartedButton: string;
    loginForm_accessCode: string;
    loginForm_email: string;
    loginForm_byProceeding: string;
    loginForm_confirmThat: string;
    thank_you_message_header_custom: string;
    thank_you_message_header_recommended: string;
    thank_you_laptop1Text: string;
    thank_you_laptop2Text1: string;
    thank_you_laptop2Text2: string;
    thank_you_laptop3Text: string;
    thank_you_message_footer: string;
};

export const defaultMessages: OnBoardingMessages = {
    getStarted_footer_safeKids: "Safe Kids'",
    getStarted_footer_servicesTerms: 'Services Terms',
    getStarted_footer_and: 'and',
    getStarted_footer_privacyPolicy: 'Privacy Policy',
    getStarted_footer_rights_reserved: `© All Rights Reserved - Numora Capital, LLC.`,
    getStarted_welcome: 'Welcome to',
    getStarted_login: 'Then: Login',
    getStarted_redirect_signup: "If you're a parent or guardian, you need to login to get the access code at",
    getStarted_getCompanionApp: 'First: Get the Companion App',
    getStarted_getCompanionApp_button: 'GET COMPANION APP',
    getStarted_gotCompanionApp_button: 'INSTALLED',
    getStarted_getCompanionApp_description:
        'Before continuing, we have a companion app that will help ensure the health of the current app. Please click the button below to install it, then return back to this page to continue',
    getStarted_redirect_signup_link: 'app.safekids.ai/signup',
    getStarted_enter_code_paragraph: 'Enter the access code we provided you on your device for this kid. ',
    getStarted_enter_code_btn_text: 'NEXT',
    getStarted_or: 'or',
    getStarted_kidsLogin: 'Kids Login',
    getStartedQuickButton: 'NO CONFIGURATION',
    getStartedButton: 'GET STARTED',
    loginForm_accessCode: 'Access Code',
    loginForm_email: 'Email',
    loginForm_byProceeding: "By proceeding, I accept the safekids' ",
    loginForm_confirmThat: " and confirm that I have read safekids' ",
    thank_you_message_header_custom: "Thank you, based on your responses, we're recommending settings that you can view and change with your parent login.",
    thank_you_message_header_recommended:
        "Thank you, you're all set. Based on the kid's age, we're recommending settings that you can view and change with your parent login.",
    thank_you_laptop1Text: "It's ok to be curious but if you go some place you shouldn't...",
    thank_you_laptop2Text1: 'Our software intercepts with simple prompts like:',
    thank_you_laptop2Text2: 'This is not what you should be doing, is it? ',
    thank_you_laptop3Text: 'Safe Kids helps you to stay on things that are appropriate for you. ',
    thank_you_message_footer: "When you're ready, just close this window and enjoy the internet.",
};
