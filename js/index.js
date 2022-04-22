import { dictionary, targetWords } from "./data.js"


const tileContainer = document.querySelector(".wordle-screen")
const keys = document.querySelectorAll(".wordle-key")
const messageBox = document.querySelector(".wordle-message-container")

const WORD_LENGTH = 5
let wordCount = 0
  
const dateOffset = new Date(2022, 0, 1)
const dateDifference = Date.now() - dateOffset
const dayOffset = dateDifference / 1000 / 60 / 60 / 24
const currentTarget = targetWords[Math.floor(dayOffset)]


const addLetter = (letter) => {
    if(wordCount >= 5) return

    wordCount++
    const freeTile = tileContainer.querySelector(".wordle-tile:not(.active)")
    freeTile.innerText = letter.toLowerCase()
    freeTile.classList.add("active")
}


const checkGuess = () => {
    const activeTiles = [...getAllActiveTiles()]
    const offset = getCurrentRow()

    if(wordCount < WORD_LENGTH) {
        showMessage("Not long enough")
        shakeTiles(activeTiles)
        return
    }

    const guessedWord = getGuessedWord()

    if(!dictionary.includes(guessedWord)) {
        showMessage("Not in word list")
        shakeTiles(activeTiles.slice(offset), "shake")
        return
    }

    endInteraction()
    activeTiles.slice(offset).forEach((...params) => flipTiles(...params, guessedWord))
}


const checkResult = (guess, tiles) => {
    if(guess == currentTarget) {
        danceTiles(tiles)
        showMessage("You Win", 5000)
        return
    }

    const freeTiles = tileContainer.querySelectorAll('.wordle-tile:not(.active)')
    if(!freeTiles.length) {
        showMessage(currentTarget.toUpperCase(), 10000)
        endInteraction()
        return
    }

    startInteraction()
}


const danceTiles = (tiles, duration = 500) => {
    tiles.forEach((tile, index) => {
        tile.classList.add("dance")

        setTimeout(() => {
            tile.classList.remove("dance")
        }, (duration * index) / 2 )

        tile.addEventListener("animationend", () => {
            tile.classList.remove("dance") 
        })
    })
}


const deleteLetter = () => {
    const activeTiles = [...getAllActiveTiles()]
    const offset = getCurrentRow()
    const lastTile = activeTiles.slice(offset)[activeTiles.slice(offset).length - 1]
    if(!lastTile) return

    lastTile.classList.remove("active")
    lastTile.innerText = ""
    wordCount--
    return
}


const flipTiles = (tile, index, tiles, guess, duration = 500) => {
    const letter = tile.innerText.toLowerCase()
    const activeTiles = [...getAllActiveTiles()]
    const offset = getCurrentRow()
    const key = [...keys].find(key => key.innerText.toLowerCase().match(letter))

    setTimeout(() => {
        tile.classList.add('flip')
    }, (duration * index) / 2)

    tile.addEventListener('transitionend', () => {
        if(currentTarget[index] === letter){
            tile.classList.add('correct')
            key.classList.add('correct')
        }
        else if(currentTarget.includes(letter)) {
            tile.classList.add('wrong-position')
            key.classList.add('wrong-position')
        }
        else {
            tile.classList.add('wrong')
            key.classList.add('wrong')
        }

        tile.classList.remove('flip')

        if(index == tiles.length - 1) {
            // endInteraction()
            checkResult(guess, activeTiles.slice(offset))
            wordCount = 0
        }

    })
}


const getAllActiveTiles = () => tileContainer.querySelectorAll(".wordle-tile.active")


const getCurrentRow = () => {
    if(getAllActiveTiles().length % 5 == 0) return getAllActiveTiles().length - 5
    return 0
}


const getGuessedWord = () => {
    const activeTiles = [...getAllActiveTiles()]
    const offset = getCurrentRow()
    let guessedWord = activeTiles.slice(offset).reduce((word, tile) => word + tile.innerHTML, "")
    
    return guessedWord
}

const shakeTiles = (tiles) => {
    tiles.forEach(tile => {
        tile.classList.add("shake")

        tile.addEventListener("animationend", () => {
            tile.classList.remove("shake")
        }, { once: true });
    })
}


const showMessage = (msg, duration = 1000) => {
    const message = document.createElement("div")
    message.classList.add("wordle-message")
    message.innerText = msg

    messageBox.prepend(message)

    setTimeout(() => {
        message.classList.add("hide")
        message.addEventListener("transitionend", () => message.remove())
    }, duration)

}


const handleClick = (e) => {
    if(e.target.innerText.match(/^[A-Z]$/)) {
        addLetter(e.target.innerText)
        return
    }

    if(e.target.innerText.toLowerCase() === "enter") {
        checkGuess(e.target.innerText)
        return
    }

    if(e.target.classList.contains('danger')) {
        deleteLetter()
        return
    }
}


const handleKeypress = (e) => {
    if(e.key === "Enter") { 
        checkGuess()
        return
    }

    if(e.key == "Backspace" || e.key == "Delete") {
        deleteLetter()
        return
    }

    if(e.key.match(/^[a-z]$/)) {
        addLetter(e.key)
        return
    }
}


const startInteraction = () => {
    document.addEventListener("click", handleClick)
    document.addEventListener('keypress', handleKeypress)
}


const endInteraction = () => {
    document.removeEventListener("click", handleClick)
    document.removeEventListener('keypress', handleKeypress)
}

startInteraction()