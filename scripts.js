const year = document.getElementById("year");
const thisYear = new Date().getFullYear();
year.setAttribute("datetime", thisYear);
year.textContent = "2021";

document.addEventListener('DOMContentLoaded', function () {
    let menu = document.querySelector('.menu-button');
    let cmenu = document.querySelector('.close-menu-button');
    let nav = document.querySelector('.header__nav');

    menu.onclick = function () {
        nav.style.cssText = 
        'display: block; animation: showMenu 0.5s ease-in-out forwards';
        menu.style.display = 'none';
        cmenu.style.display = 'block';
        console.log('nav menu opened');
    };

    cmenu.onclick = function() {
        menu.style.display = 'block';
        cmenu.style.display = 'none';
        nav.style.cssText = 
        'display: block; animation: hideMenu 0.5s ease-in-out forwards';
        console.log('nav menu closed'); 
    };
});