/* Med document.queryselector(selector) kan vi hämta
 * de element som vi behöver från html dokumentet.
 * Vi spearar elementen i const variabler då vi inte kommer att
 * ändra dess värden.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 * Viktigt: queryselector ger oss ett html element eller flera om det finns.
 */
const clickerButton = document.querySelector('#game-button');
const moneyTracker = document.querySelector('#money');
const mpsTracker = document.querySelector('#mps'); // money per second
const mpcTracker = document.querySelector('#mpc'); // money per click
const upgradesTracker = document.querySelector('#upgrades');
const upgradeList = document.querySelector('#upgradelist');
const msgbox = document.querySelector('#msgbox');

/* Följande variabler använder vi för att hålla reda på hur mycket pengar som
 * spelaren, har och tjänar.
 * last används för att hålla koll på tiden.
 * För dessa variabler kan vi inte använda const, eftersom vi tilldelar dem nya
 * värden, utan då använder vi let.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
 */
let money = 0;
let moneyPerClick = 1;
let moneyPerSecond = 0;
let acquiredUpgrades = 0;
let last = 0;
let numberOfClicks = 0; // hur många gånger har spelare eg. klickat
let active = false; // exempel för att visa att du kan lägga till klass för att indikera att spelare får valuta

// likt upgrades skapas här en array med objekt som innehåller olika former
// av achievements.
// requiredSOMETHING är vad som krävs för att få dem

function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        money = gameState.money || 0;
        moneyPerClick = gameState.moneyPerClick || 1;
        moneyPerSecond = gameState.moneyPerSecond || 0;
        acquiredUpgrades = gameState.acquiredUpgrades || 0;

        achievements.forEach((achievement, index) => {
            achievement.acquired = gameState.achievements[index] || false;
        });

        upgrades.forEach((upgrade, index) => {
            upgrade.owned = gameState.upgrades[index] || 0;
            
            for (let i = 0; i < upgrade.owned; i++) {
                upgrade.cost = Math.round(upgrade.cost * 1.3);
            }
        });

        selectedState = gameState.selectedState || '';
    }
}

let achievements = [
    {
        description: 'Your state is coming along well',
        requiredUpgrades: 1,
        acquired: false,
    },
    {
        description: 'Your first civilians start to live here now',
        requiredUpgrades: 40,
        acquired: false,
    },
    {
        description: 'A new hand touches the beacon',
        requiredClicks: 10,
        acquired: false,
    },
];

/* Med ett valt element, som knappen i detta fall så kan vi skapa listeners
 * med addEventListener så kan vi lyssna på ett specifikt event på ett html-element
 * som ett klick.
 * Detta kommer att driva klickerknappen i spelet.
 * Efter 'click' som är händelsen vi lyssnar på så anges en callback som kommer
 * att köras vi varje klick. I det här fallet så använder vi en anonym funktion.
 * Koden som körs innuti funktionen är att vi lägger till moneyPerClick till
 * money.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 */
clickerButton.addEventListener(
    'click',
    () => {
        // vid click öka score med moneyPerClick
        money += moneyPerClick;
        // håll koll på hur många gånger spelaren klickat
        numberOfClicks += 1;
        // console.log(clicker.score);
        saveGameState();
    },
    false
);

/* För att driva klicker spelet så kommer vi att använda oss av en metod som heter
 * requestAnimationFrame.
 * requestAnimationFrame försöker uppdatera efter den refresh rate som användarens
 * maskin har, vanligtvis 60 gånger i sekunden.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * funktionen step används som en callback i requestanaimationframe och det är
 * denna metod som uppdaterar webbsidans text och pengarna.
 * Sist i funktionen så kallar den på sig själv igen för att fortsätta uppdatera.
 */
function step(timestamp) {
    moneyTracker.textContent = Math.round(money);
    mpsTracker.textContent = moneyPerSecond;
    mpcTracker.textContent = moneyPerClick;
    upgradesTracker.textContent = acquiredUpgrades;

    if (timestamp >= last + 1000) {
        money += moneyPerSecond;
        last = timestamp;
    }

    if (moneyPerSecond > 0 && !active) {
        mpsTracker.classList.add('active');
        active = true;
    }

    // achievements, utgår från arrayen achievements med objekt
    // koden nedan muterar (ändrar) arrayen och tar bort achievements
    // som spelaren klarat
    // villkoren i första ifsatsen ser till att achivments som är klarade
    // tas bort. Efter det så kontrolleras om spelaren har uppfyllt kriterierna
    // för att få den achievement som berörs.
    achievements.forEach((achievement) => {
        if (achievement.acquired) return;
    
        if (
            achievement.requiredUpgrades &&
            acquiredUpgrades >= achievement.requiredUpgrades
        ) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
        } else if (
            achievement.requiredClicks &&
            numberOfClicks >= achievement.requiredClicks
        ) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
        }
    });
    

    renderUpgrades();

    window.requestAnimationFrame(step);
}

const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New_Hampshire",
    "New_Jersey", "New_Mexico", "New_York", "North_Carolina", "North_Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode_Island", "South_Carolina", "South_Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West_Virginia",
    "Wisconsin", "Wyoming"
];
  
window.addEventListener('DOMContentLoaded', () => {
    const randomIndex = Math.floor(Math.random() * states.length);
    const selectedState = states[randomIndex];

    const sealImagePath = `./img/Seal_of_${selectedState}.png`;
    const container = document.querySelector('.upgcontainer');
    if (container) {
        container.style.backgroundImage = `url('${sealImagePath}')`;
    }

    const mapImagePath = `./img/Map_of_${selectedState}.png`;
    const gameButton = document.getElementById('game-button');
    if (gameButton) {
        gameButton.style.backgroundImage = `url('${mapImagePath}')`;
    }
})

/* Här använder vi en listener igen. Den här gången så lyssnar iv efter window
 * objeket och när det har laddat färdigt webbsidan(omvandlat html till dom)
 * När detta har skett så skapar vi listan med upgrades, för detta använder vi
 * en forEach loop. För varje element i arrayen upgrades så körs metoden upgradeList
 * för att skapa korten. upgradeList returnerar ett kort som vi fäster på webbsidan
 * med appendChild.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * Efter det så kallas requestAnimationFrame och spelet är igång.
 */

/* En array med upgrades. Varje upgrade är ett objekt med egenskaperna name, cost
 * och amount. Önskar du ytterligare text eller en bild så går det utmärkt att
 * lägga till detta.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
 */
upgrades = [
    {
        name: 'Tax Legislation',
        cost: 10,
        amount: 0.5,
        requiredClicks: 20,
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 1.13)
    },
    {
        name: 'Increased Tax',
        cost: 100,
        amount: 5,
        requiredUpgrade: 'Tax Legislation',
        requiredAmount: 10,
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 1.3)
    },
    {
        name: 'Local Roads',
        cost: 10,
        clicks: 0.5,
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 1.13)
    },
    {
        name: 'Major Roads',
        cost: 100,
        clicks: 2,
        requiredUpgrade: [
            { name: 'Local Roads', amount: 15},
            { name: 'Tax Legislation', amount: 5},
        ],
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 1.3)
    },
    {
        name: 'Public Transports',
        cost: 250,
        amount: 7,
        requiredUpgrade: [
            { name: 'Local Roads', amount: 20},
            { name: 'Major Roads', amount: 5},
        ],
        requiredAmount: 20,
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 1.2)
    },
    {
        name: 'Plots',
        cost: 750,
        amount: 25,
        requiredAchievement: 'Your first civilians start to live here now',
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 1.18)
    },
    {
        name: 'Buildings',
        cost: 2000,
        amount: 50,
        requiredUpgrade: 'Plots',
        requiredAmount: 10,
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 1.5)
    },
    {
        name: 'Apartment Buildings',
        cost: 5000,
        amount: 120,
        requiredUpgrade: 'Buildings',
        requiredAmount: 10,
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 1.7)
    },
    {
        name: 'The Bank',
        cost: 5000,
        effect: 'doubleMoney',
        requiredUpgrade: [
            { name: 'Buildings', amount: 20},
            { name: 'Increased Tax', amount: 20},
            { name: 'Tax Legislation', amount: 50}
        ],
        owned: 0,
        displayed: false,
        costChange: (currentCost) => Math.round(currentCost * 2.4)
    }
];

/* createCard är en funktion som tar ett upgrade objekt som parameter och skapar
 * ett html kort för det.
 * För att skapa nya html element så används document.createElement(), elementen
 * sparas i en variabel så att vi kan manipulera dem ytterligare.
 * Vi kan lägga till klasser med classList.add() och text till elementet med
 * textcontent = 'värde'.
 * Sedan skapas en listener för kortet och i den hittar vi logiken för att köpa
 * en uppgradering.
 * Funktionen innehåller en del strängar och konkatenering av dessa, det kan göras
 * med +, variabel + 'text'
 * Sist så fäster vi kortets innehåll i kortet och returnerar elementet.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */
function renderUpgrades() {
    upgrades.forEach((upgrade) => {
        const hasRequiredUpgrades = Array.isArray(upgrade.requiredUpgrade)
            ? upgrade.requiredUpgrade.every(req => {
                const requiredUpgrade = upgrades.find(u => u.name === req.name);
                return requiredUpgrade && requiredUpgrade.owned >= req.amount;
            })
            : (!upgrade.requiredUpgrade || (upgrades.find(u => u.name === upgrade.requiredUpgrade)?.owned || 0) >= (upgrade.requiredAmount || 0));
        const hasRequiredAchievement = (!upgrade.requiredAchievement || achievements.find(a => a.description === upgrade.requiredAchievement)?.acquired);

        const hasPrerequisites = hasRequiredUpgrades && hasRequiredAchievement;

        if (hasPrerequisites && !upgrade.displayed) {
            upgradeList.appendChild(createCard(upgrade));
            upgrade.displayed = true;
        } else if (!hasPrerequisites && upgrade.displayed) {
            upgrade.displayed = false;
        }
    })
}

function resetDisplayedUpgrades() {
    upgrades.forEach(upgrade => {
        upgrade.displayed = false;
    });
}

function createCard(upgrade) {
    const card = document.createElement('div');
    card.classList.add('card');
    const header = document.createElement('p');
    header.classList.add('title');
    const cost = document.createElement('p');
    const ownedDisplay = document.createElement('p');
    if (upgrade.amount) {
        header.textContent = `${upgrade.name}, +${upgrade.amount} per second.`;
    } else if (upgrade.clicks) {
        header.textContent = `${upgrade.name}, +${upgrade.clicks} per click.`;
    } else {
        header.textContent = `${upgrade.name}, double your money`
    }
    cost.textContent = `Purchase for: ${upgrade.cost}$.`;
    ownedDisplay.textContent = `You own: ${upgrade.owned}`;

    card.addEventListener('click', (e) => {
        
            if (money >= upgrade.cost) {
                
                if (upgrade.effect === 'doubleMoney') {
                    money *= 2;
                    message ('The Bank doubled your money', 'success');
                } else {
                
                    acquiredUpgrades++;
                    money -=upgrade.cost;
                    upgrade.cost = upgrade.costChange(upgrade.cost);
                    cost.textContent = 'Purchase for ' + upgrade.cost + '$';
                    
                    if (upgrade.clicks) {
                        moneyPerClick += upgrade.clicks;
                    } else if (upgrade.amount) {
                        moneyPerSecond += upgrade.amount;
                    }
                }
                
                upgrade.owned++;
                ownedDisplay.textContent = `Owns: ${upgrade.owned}`;
                saveGameState();

                message('Congratulations, you have purchased a upgrade!', 'success');
            } else {
                message('Too poor.', 'warning');
            }
        
    });

    card.appendChild(header);
    card.appendChild(cost);
    card.appendChild(ownedDisplay)
    return card;
}

window.addEventListener('load', (event) => {
    renderUpgrades();
    window.requestAnimationFrame(step);
});
/* Message visar hur vi kan skapa ett html element och ta bort det.
 * appendChild används för att lägga till och removeChild för att ta bort.
 * Detta görs med en timer.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
 */
function message(text, type) {
    const p = document.createElement('p');
    p.classList.add(type);
    p.textContent = text;
    msgbox.appendChild(p);
    
    setTimeout(() => {
        p.parentNode.removeChild(p);
    }, 2000);
}

function saveGameState() {
    const gameState = {
        money,
        moneyPerClick,
        moneyPerSecond,
        acquiredUpgrades,
        achievements: achievements.map(a => a.acquired),
        upgrades: upgrades.map(u => u.owned),
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}
