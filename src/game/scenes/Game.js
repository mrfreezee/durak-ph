import { AUTO, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { cards, trumps } from '../../cardsList';


var cardArr = []
var battleField = [];
var firstPlayer = []
var secondPlayer = []
let turn = Math.random() >= 0.5 ? true : false
var suits = [];
var trump = []
var card
console.log(turn)

var isAttackFirst = true;
var isDefenseFirst = true
var isAttackSecond = true;
var isDefenseSecond = true


export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('background', 'table.jpg');
        this.load.image('rub', 'rub.png');


        cardArr = cards.map(card => {
            this.load.image(String(card.id), card.img)
            return String(card.id)
        })



        suits = trumps.map(trump => {
            this.load.image(trump.type, trump.img)
            return trump.type
        })

    }

    create() {
        this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');

        this.firstPlayer = this.add.container(window.innerWidth / 2, window.innerHeight / 5);
        this.battleField = this.add.container(window.innerWidth / 2, window.innerHeight / 2);
        this.secondPlayer = this.add.container(window.innerWidth / 2, window.innerHeight * 3 / 3.7);

        const createBeat = document.createElement('div')
        createBeat.textContent = 'Бито'
        createBeat.classList.add('btn-beat')

        const creatTake = document.createElement('div')
        creatTake.textContent = 'Забрать'
        creatTake.classList.add('btn-beat')

        this.beat = this.add.dom(window.innerWidth / 10, 30, createBeat).setInteractive()
        this.take = this.add.dom(window.innerWidth / 1.14, 30, creatTake).setInteractive()



        this.dealCards();
        this.trumpSelection()
        this.beatCards()
        this.takeCards()
        this.displayPlayerCards(this.firstPlayer, firstPlayer, true);
        this.displayPlayerCards(this.secondPlayer, secondPlayer, true);

    }

    update() {

    }
    dealCards() {
        Phaser.Utils.Array.Shuffle(cardArr);

        secondPlayer = cardArr.slice(0, 6);
        firstPlayer = cardArr.slice(6, 12);

        cardArr = cardArr.slice(12);
        const cardCount = cardArr.length
        this.cardCount = cardCount
        this.cardCountText = this.add.text(10, window.innerHeight / 2, `Остаток: ${this.cardCount}`, { fontSize: 20 })

    }

    displayPlayerCards(playerContainer, playerCards, faceUp) {
        playerContainer.removeAll(true);
    
       
    const maxOverlapX = 70; 
    const minOverlapX = 10; 
    const overlapX = Math.max(minOverlapX, maxOverlapX - (playerCards.length - 1) * 5);
        const angleRange = 30; 
        const startAngle = -angleRange / 2; 
        const angleStep = angleRange / (playerCards.length - 1); 
    
        let totalWidth = 0; 
    
        playerCards.forEach((cardId, index) => {
            const angle = startAngle + index * angleStep;
            const x = index * overlapX; 
            const y = 0; 
    
            const cardSprite = this.add.sprite(x, y, faceUp ? cardId : 'rub').setInteractive();
    
            cardSprite.setDisplaySize(100, 170);
            cardSprite.setAngle(angle); 
            cardSprite.cardId = cardId;
            cardSprite.playerContainer = playerContainer;
    
            playerContainer.add(cardSprite);
    
            totalWidth = x;
    
            cardSprite.on('pointerdown', () => {
                this.moveCardToBattleField(cardSprite, playerCards);
            });
    
            cardSprite.on('pointerover', () => {
                this.tweens.add({
                    targets: cardSprite,
                    y: cardSprite.y - 20,
                    duration: 100, 
                    ease: 'Power1',
                });
            });
    
            cardSprite.on('pointerout', () => {
                this.tweens.add({
                    targets: cardSprite,
                    y: 0,
                    duration: 100,
                    ease: 'Power1',
                });
            });
        });
    
       
        const containerX = (this.scale.width - totalWidth) / 2; 
        const containerY = playerContainer.y; 
        playerContainer.setPosition(containerX, containerY);
    }
    moveCardToBattleField(cardSprite, playerCards) {
        const cardId = cardSprite.cardId;
        const currentCard = cards.find(card => String(card.id) === cardId);

        const isPlayerTurn =
            (turn && playerCards === firstPlayer) || (!turn && playerCards === secondPlayer);
        if (!isPlayerTurn) {
            console.log('Не ваш ход');
            return;
        }

        const topBattleCardSprite = this.battleField.list.length > 0
            ? this.battleField.list[this.battleField.list.length - 1]
            : null;
        const topBattleCard = topBattleCardSprite?.card;

        if (this.battleField.list.length === 0 && turn) {
            isAttackFirst = true;
            isAttackSecond = false
            isDefenseFirst = false
            isDefenseSecond = true;
        } else if (this.battleField.list.length === 0 && !turn) {
            isAttackSecond = true;
            isAttackFirst = false
            isDefenseFirst = true;
            isDefenseSecond = false
        }

        if (topBattleCard) {
            if (isDefenseSecond && !turn) {
                if (!this.canBeatCard(topBattleCard, currentCard)) {
                    console.log('Вы не можете отбить этой картой');
                    return;
                }
            }

            if (isAttackFirst && turn) {
                if (!this.canThrowCard(currentCard)) {
                    console.log('Вы не можете подкинуть эту карту');
                    return;
                }
            }

            if (isDefenseFirst && turn) {
                if (!this.canBeatCard(topBattleCard, currentCard)) {
                    console.log('Вы не можете отбить этой картой');
                    return;
                }
            }

            if (isAttackSecond && !turn) {
                if (!this.canThrowCard(currentCard)) {
                    console.log('Вы не можете подкинуть эту карту');
                    return;
                }
            }
        }


        const cardIndex = playerCards.indexOf(cardId);
        if (cardIndex !== -1) {
            playerCards.splice(cardIndex, 1);
        }

        cardSprite.playerContainer.remove(cardSprite);

        const offsetX = 15; 
        const offsetY = 50; 
        const battleFieldCardCount = this.battleField.list.length;
    
        const newCardX = battleFieldCardCount * offsetX;
        const newCardY = battleFieldCardCount % 2 === 0 ? 0 : offsetY; 
    
        cardSprite.setPosition(newCardX, newCardY);
        cardSprite.setAngle(0);
        this.battleField.add(cardSprite);
        cardSprite.card = currentCard;

        cardSprite.removeAllListeners('pointerdown');

        turn = !turn

        console.log(`Ход переключен. Текущий игрок: ${turn ? "Первый" : "Второй"}`);
    }

    trumpSelection() {
        Phaser.Utils.Array.Shuffle(suits);
        this.trump = suits[0]

        this.add.image(50, window.innerHeight / 2 - 50, this.trump).setScale(0.2)
    }
    canBeatCard(cardToBeat, currentCard) {
        const selectedTrump = this.trump

        if (currentCard.type === selectedTrump && cardToBeat.type !== selectedTrump) {
            return true;
        }

        if (cardToBeat.type === currentCard.type) {
            return currentCard.rank > cardToBeat.rank;
        }

        if (cardToBeat.type === selectedTrump) {
            return currentCard.type === selectedTrump
        }

        return false;
    }
    canThrowCard(currentCard) {
        if (this.battleField.list.length === 0) {
            return true;
        }
        return this.battleField.list.some(battleCardSprite =>
            battleCardSprite.card.rank === currentCard.rank
        );
    }
    beatCards() {
        if (isAttackFirst) {
            this.beat.on('pointerdown', () => {
                this.battleField.list.length = 0; 


                if (firstPlayer.length < 6) {
                    const missingCardsCount = 6 - firstPlayer.length;
                    for (let i = 0; i < missingCardsCount; i++) {
                        if (this.cardCount > 0) {
                            const newCard = cardArr.shift(); 
                            firstPlayer.push(newCard);
                            this.displayPlayerCards(this.firstPlayer, firstPlayer, true);
                            this.updateCardCountDisplay();
                        }
                    }
                }
                if (secondPlayer.length < 6) {
                    const missingCardsCount = 6 - secondPlayer.length;
                    for (let i = 0; i < missingCardsCount; i++) {
                        if (this.cardCount > 0) {
                            const newCard = cardArr.shift();
                            secondPlayer.push(newCard);
                            this.displayPlayerCards(this.secondPlayer, secondPlayer, true);
                            this.updateCardCountDisplay();
                        }
                    }
                    
                }
                turn = !turn
            });
            
        }
    }

    takeCards() {
        this.take.on('pointerdown', () => {
            if (this.battleField.list.length != 0) {
                const currentPlayerCards = turn ? firstPlayer : secondPlayer;

                this.battleField.list.forEach(cardSprite => {
                    currentPlayerCards.push(cardSprite.cardId); // Добавляем карту в массив игрока
                });

                this.battleField.removeAll(true);

                const currentPlayerContainer = turn ? this.firstPlayer : this.secondPlayer;
                this.displayPlayerCards(currentPlayerContainer, currentPlayerCards, true);
                this.battleField.list.length = 0 
                if (firstPlayer.length < 6) {
                    const missingCardsCount = 6 - firstPlayer.length;
                    for (let i = 0; i < missingCardsCount; i++) {
                        if (this.cardCount > 0) {
                            const newCard = cardArr.shift(); 
                            firstPlayer.push(newCard);
                            this.displayPlayerCards(this.firstPlayer, firstPlayer, true);
                            this.updateCardCountDisplay();
                        }
                    }
                }
                if (secondPlayer.length < 6) {
                    const missingCardsCount = 6 - secondPlayer.length;
                    for (let i = 0; i < missingCardsCount; i++) {
                        if (this.cardCount > 0) {
                            const newCard = cardArr.shift();
                            secondPlayer.push(newCard);
                            this.displayPlayerCards(this.secondPlayer, secondPlayer, true);
                            this.updateCardCountDisplay();
                        }
                    }
                    
                }
                turn = !turn
                console.log(`${turn ? "Первый" : "Второй"} игрок забрал карты с поля`);
            } else {
                console.log('Поле пустое, нечего забирать');
            }
        });
    }
    updateCardCountDisplay() {
        if (this.cardCountText) {
            this.cardCount = cardArr.length; 
            this.cardCountText.setText(`Остаток: ${this.cardCount}`);
            console.log(this.cardCount)
        } else {
            console.warn('cardCountText не инициализирован');
        }
    }

}


