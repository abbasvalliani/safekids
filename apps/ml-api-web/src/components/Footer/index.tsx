import React from 'react';
import { JSX } from 'react';
import styled from 'styled-components';

type Props = { anchorColor?: string };
export const FooterContainer = styled.div<Props>`
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 10px 20px;
    a {
        color: ${(props) => props.anchorColor || '#fa6400'};
        text-decoration: underline;
    }
`;

const Footer = ({ anchorColor }: Props): JSX.Element => (
    <FooterContainer anchorColor={anchorColor}>
        <span>© All Rights Reserved – Numora Capital, LLC.</span>
        <span>
            Safe Kids’{' '}
            <a className="primary-text cursor-pointer" href="https://www.safekids.ai/termsandconditions/" target="_blank" rel="noopener noreferrer">
                Services Terms
            </a>{' '}
            and{' '}
            <a className="primary-text cursor-pointer" href="https://www.safekids.ai/privacy_policy/" target="_blank" rel="noopener noreferrer">
                Privacy Policy.
            </a>
        </span>
    </FooterContainer>
);

export default Footer;
