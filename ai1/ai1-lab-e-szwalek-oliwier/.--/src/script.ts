const msg: string = "Hello!";
alert(msg);

interface AppState{
    currentStyle: string;
    currentStyleFile: string;
    availableStyles: {[key: string] : string };
}

const state: AppState = {
    currentStyle: "Japandi (jasny)",
    currentStyleFile: "style-1.css",
    availableStyles: {
        "Japandi (jasny)": "style-1.css",
        "Dark mode": "style-2.css",
        "Minimalistyczny": "style-3.css",
        "Skandynawski": "style-4.css"
    }
};

function changeStyle(styleName: string): void{
    const styleFile = state.availableStyles[styleName];
    if(!styleFile){
        console.error(`Styl "${styleName}" nie zostal znaleziony`);
        return;
    }

    const oldLink = document.querySelector('link[rel="stylesheet"]');
    if(oldLink){
        oldLink.remove();
    }

    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = styleFile;
    document.head.appendChild(newLink);

    state.currentStyle = styleName;
    state.currentStyle = styleFile;

    updateActiveStyleLink(styleName); 

    console.log(`Zmieniono styl na ${styleName} (${styleFile})`);
}


function updateActiveStyleLink(styleName: string): void{
    const allLinks = document.querySelectorAll('.style-switcher a');
    allLinks.forEach(link => {
        if(link.textContent === styleName){
            link.classList.add('active');
        }else{
            link.classList.remove('active');
        }
    });
}


function createStyleSwitch(): void{
    const nav = document.querySelector('.main-nav ul');

    if(!nav){
        console.error('Nie znaleziono elem nawigacji');
        return;
    }

    const styleSwitcherLi = document.createElement('li');
    styleSwitcherLi.className = 'style-switch';

    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'dropdown';

    const mainButton = document.createElement('button');
    mainButton.className = 'dropdown-toggle';
    mainButton.textContent = 'STYL';
    mainButton.setAttribute('aria-label', 'Wybierz styl strony');

    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';

    Object.keys(state.availableStyles).forEach(styleName => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = styleName;

        if(styleName === state.currentStyle){
            link.classList.add('active');
        }
        link.addEventListener('click', (e:Event) => {
            e.preventDefault();
            changeStyle(styleName);
            dropdownMenu.classList.remove('show');
        });

        dropdownMenu.appendChild(link);
    });

    mainButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e:Event)=>{
        if(!dropdownContainer.contains(e.target as Node)){
            dropdownMenu.classList.remove('show');
        }
    });

    dropdownContainer.appendChild(mainButton);
    dropdownContainer.appendChild(dropdownMenu);
    
    styleSwitcherLi.appendChild(dropdownContainer);
    nav.appendChild(styleSwitcherLi);
}


function addStyleSwitchCss(): void{
    const style = document.createElement('style');
    style.textContent = `.style-switcher{
        position: relative;
    }
    .dropdown{
        position: relative;
        display: inline-block;
    }
    
    .dropdown-toggle{
        background: transparent;
        border: 2px solid currentColor;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        color: inherit;
        font-family: inherit;
    }
    
    .dropdown-toggle:hover{
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .dropdown-menu{
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 1000;
    }

    .dropdown-menu.show{
        opacity: 1;
        visibility: visible;
        transform: translateY(0);    
    }

    .dropdown-menu a{
        display: block;
        padding: 0.75rem 1.25rem;
        color: #333;
        text-decoration: none;
        transition: all 0.2s ease;
        border-bottom: 1px solid #f0f0f0;
    }

    .dropdown-menu a:last-child{
        border-bottom: none;
    }

    .dropdown-menu a:hover {
        background: #f8f8f8;
        padding-left: 1.5rem;
    }

    .dropdown-menu: a.active:hover{
        background: #5a4d2a;
    }

    @media (max-width: 768px) { 
        .dropdown-menu {
            right: auto;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
        }

        .dropdown-menu.show{
            transform: translateX(-50%) translateY(0);
        }
    }
    `;
    document.head.appendChild(style);
}

function init(): void {
    console.log('Biezacy style: ', state.currentStyle);
    console.log('Dostepne style: ', Object.keys(state.availableStyles));

    addStyleSwitchCss();
    createStyleSwitch();
}

if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
}else{
    init();
}

export { changeStyle, state};