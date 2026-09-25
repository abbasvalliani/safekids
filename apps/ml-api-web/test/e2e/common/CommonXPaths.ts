export class CommonXPaths {
    static SAFEKIDS_LOGO: string = "//a//*[name()='svg']";
    static SAFEKIDS_IMAGE: string = '//img[@src="/static/media/getStartedAlt.59f68661.png" and @alt=\'safeKids for Home\']';
    static ALL_RIGHTS_RESERVED_TEXT: string = "//span[text()='© All Rights Reserved – Numora Capital, LLC.']";
    static ALL_RIGHTS_RESERVED_TEXT_COPPA: string = "//span[text()='© All Rights Reserved – Numora Capital, LLC.']";
    static PRIVACY_POLICY_LINK_ALL_RIGHTS_LINK: string =
        "//span[text()='COPPA Parental Consent']/following-sibling::span[text()='Please review the Safe Kids']//a[@href=\"https://www.safekids.ai/privacy_policy/\"]";
    static AND_THE_TEXT: string = "//span[text()='COPPA Parental Consent']/following-sibling::span[text()='and the']";
    static TERMS_AND_CONDITIONS_ALL_RIGHTS_LINK: string =
        "//span[text()='COPPA Parental Consent']/following-sibling::span[text()='Please review the Safe Kids']//a[@href=\"https://www.safekids.ai/termsandconditions/\"]";
    static BEFORE_COMPLETING_TEXT: string = "//span[text()='COPPA Parental Consent']/following-sibling::span[text()='before completing this form.']";
}
