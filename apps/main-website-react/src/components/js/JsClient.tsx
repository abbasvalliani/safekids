'use client';
import { useEffect } from 'react';
import React from 'react';
// jQuery 4 needs a window when imported; the factory defers that to the browser.
import { jQueryFactory } from 'jquery/factory';

type Props = {
  children: React.ReactNode;
};
export default function JsClient({ children }: Props) {
  useEffect(() => {
    const $ = jQueryFactory(window);
    window.addEventListener('load', () => {
      // Add 'loaded' class to body when page is fully loaded
      document.body.classList.add('loaded');
    });

    $(document).ready(function () {
      // Button click event handler
      $('#haeder-menu-button').click(function (event) {
        event.stopPropagation(); // Prevent click event from bubbling up to the document
        $('#mobile-navigation').toggleClass('hidden'); // Toggle 'highlight' class on the div
      });

      // Document click event handler to remove class if clicked outside the div
      $(document).click(function (event) {
        if (!$(event.target).closest('#myDiv').length) {
          // Check if clicked outside the div
          $('#mobile-navigation').addClass('hidden'); // Remove 'highlight' class from the div
        }
      });
    });

    function load() {
      const loads = document.querySelectorAll('.load');

      for (let i = 0; i < loads.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = loads[i].getBoundingClientRect().top;
        const elementVisible = 30;

        if (elementTop < windowHeight - elementVisible) {
          loads[i].classList.add('active');
        } else {
          loads[i].classList.remove('active');
        }
      }
    }

    window.addEventListener('load', load);

    function reveal() {
      const reveals = document.querySelectorAll('.reveal');

      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add('active');
        } else {
          reveals[i].classList.remove('active');
        }
      }
    }

    window.addEventListener('scroll', reveal);

    $(window).scroll(function () {
      const scrollTop = $(window).scrollTop() || 0;
      if (scrollTop > 1) {
        $('header').addClass('header-fixed');
      } else {
        $('header').removeClass('header-fixed');
      }
    });

    $('.nav-link').click(function () {
      $('#navbarScroll').removeClass('show');
    });
  }, []);
  return <>{children}</>;
}
