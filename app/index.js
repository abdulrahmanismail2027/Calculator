const apiUrl = 'http://localhost:8080/api';

const operationsToSymbol = {
    'add': '+',
    'subtract': '-',
    'divide': '÷',
    'times': '×'
}

const symbolToOperation = {
    '+': 'add',
    '-': 'subtract',
    '÷': 'divide',
    '×': 'times'
}

let screen = {

    display: document.getElementById('display'),
    upperDisplay: document.getElementById('upper-display'),

    placeHolder: true,
    fraction: false,

    get value() {
        return this.display.value;
    },

    get upperValue() {
        return this.upperDisplay.value;
    },

    get isPlaceHolder() {
        return this.placeHolder;
    },

    get isFraction() {
        return this.fraction;
    },

    set value(value) {
        this.display.value = value;
        this.adjustFontSize();
    },

    set upperValue(value) {
        this.upperDisplay.value = value;
        this.adjustFontSize();
    },

    set isPlaceHolder(bool) {
        this.placeHolder = bool;
    },

    set isFraction(bool) {
        this.fraction = bool;
    },

    isEmpty: function() {
        return this.placeHolder || this.display.value === '0' || this.display.value === '';
    },

    isError: function() {
        return this.display.value === 'E';
    },

    reset: function() {
        this.display.value = '0';
        this.upperDisplay.value = '';
        this.placeHolder = true;
        this.fraction = false;
        this.adjustFontSize();
    },

    lastEntry: function() {
        return this.display.value.slice(-1);
    },

    upperLastEntry: function () {
        return this.upperDisplay.value.slice(-1);
    },

    removeLastEntry: function() {
        this.display.value = this.display.value.slice(0, -1);
        this.adjustFontSize(this.display);
    },

    getOperationSymbol: function() {
        return this.upperDisplay.value.slice(-1);
    },

    getOperand() {
        return this.upperDisplay.value.slice(0, -2);
    },

    putOperation: function (operand, symbol) {
        this.upperDisplay.value = operand + ' ' + symbol;
        this.adjustFontSize();
    },

    adjustFontSize: function () {
        const maxWidth = this.display.offsetWidth;
        const upperMaxWidth = this.upperDisplay.offsetWidth;
        const initialFontSize = 45;
        const upperInitialFontSize = 14;
        const minFontSize = 10;
        const upperMinFontSize = 5;

        // Reset to initial font sizes
        this.display.style.fontSize = initialFontSize + "px";
        this.upperDisplay.style.fontSize = upperInitialFontSize + "px";

        // Reduce font sizes until text fits within the input box width
        while (this.display.scrollWidth > maxWidth && parseInt(this.display.style.fontSize) > minFontSize) {
            this.display.style.fontSize = (parseInt(this.display.style.fontSize) - 1) + "px";
        }
        while (this.upperDisplay.scrollWidth > upperMaxWidth && parseInt(this.upperDisplay.style.fontSize) > upperMinFontSize) {
            this.upperDisplay.style.fontSize = (parseInt(this.upperDisplay.style.fontSize) - 1) + "px";
        }
    }
}

function appendToDisplay(input) {
    if (screen.upperLastEntry() === '=') screen.upperValue = '';
    if (screen.isEmpty()) {
        screen.isFraction = false;
        if (input === '.') {
            screen.value = '0.';
            screen.isFraction = true;
        }
        else {
            screen.value = input;
        }
        screen.isPlaceHolder = false;
    }
    else {
        if (input === '.') {
            if (!screen.isFraction) {
                screen.isFraction = true;
                screen.value += '.';
            }
        }
        else {
            screen.value += input;
        }
    }
}

function reset() {
    screen.reset();
}

function backspace() {
    if (screen.isEmpty()) return;
    if (screen.lastEntry() === '.') screen.isFraction = false;
    screen.removeLastEntry();
    if (screen.isEmpty()) {
        screen.value = '0';
        screen.isPlaceHolder = true;
    }
}

async function primitiveOperation(operation) {
    if (screen.isError()) return;
    let operationSymbol = operationsToSymbol[operation];
    if (screen.isEmpty()) {
        screen.putOperation(screen.value, operationSymbol);
    }
    else if (screen.upperValue === '' || screen.upperLastEntry() === '=') {
        screen.putOperation(screen.value, operationSymbol);
    }
    else {
        let firstOperand = screen.getOperand();
        let secondOperand = screen.value;
        let upperOperation = symbolToOperation[screen.getOperationSymbol()];
        let result = await fetchText(upperOperation, firstOperand, secondOperand);
        if (result === '"Infinity"' || result === '"-Infinity"') {
            screen.value = 'E';
        }
        else {
            screen.value = Number(result);
            screen.putOperation(Number(result), operationSymbol);
        }
    }
    screen.isPlaceHolder = true;
}

async function equals() {
    if (screen.isError() || screen.upperValue === '' || screen.upperLastEntry() === '=') return;
    let operationSymbol = screen.getOperationSymbol();
    let firstOperand = screen.getOperand();
    let secondOperand = screen.value;
    let result = await fetchText(symbolToOperation[operationSymbol],
        firstOperand, secondOperand);
    if (result === '"Infinity"' || result === '"-Infinity"' || result === '"NaN"') {
        screen.value = 'E';
    }
    else {
        screen.upperValue = Number(firstOperand) + ' ' +
            operationSymbol + ' ' + Number(secondOperand) + ' ' + '=';
        screen.value = Number(result)
    }
    screen.isPlaceHolder = true;
}

async function percent() {
    if (screen.isError()) return;
    screen.value = Number(await fetchText('divide', screen.value, 100));
    if (screen.upperLastEntry() === '=') screen.upperValue = '';
    screen.isPlaceHolder = false;
}

async function reciprocal() {
    if (screen.isError()) return;
    let operand = screen.value;
    let result = await fetchText('divide', 1, operand);
    if (result === '"Infinity"' || result === '"-Infinity"') {
        screen.value = 'E';
        console.log('Division by zero.');
    }
    else {
        screen.value = Number(result);
        if (screen.upperLastEntry() === '=') screen.upperValue = '';
    }
    screen.isPlaceHolder = true;
}

async function square() {
    if (screen.isError()) return;
    let operand = screen.value;
    let result = await fetchText('times', operand, operand);
    if (result === '"Infinity"') {
        screen.value = 'E';
        console.log('Overflow.');
    }
    else {
        screen.value = Number(result);
        if (screen.upperLastEntry() === '=') screen.upperValue = '';
    }
    screen.isPlaceHolder = true;
}

async function sqrt() {
    if (screen.isError()) return;
    let operand = screen.value;
    let result = await fetchText('sqrt', operand);
    if (result === '"NaN"') {
        screen.value = 'E';
        console.log('Square root of a negative number.');
    }
    else {
        screen.value = Number(result);
        if (screen.upperLastEntry() === '=') screen.upperValue = '';
    }
    screen.isPlaceHolder = true;
}

async function negate() {
    if (screen.isError()) return;
    let operand = screen.value;
    screen.value = Number(await fetchText('times', operand, -1));
    if (screen.upperLastEntry() === '=') screen.upperValue = '';
    screen.isPlaceHolder = true;
}

async function fetchText (operation, a, b) {
    let response = await fetch(`${apiUrl}/${operation}?a=${a}&b=${b}`);
    return await response.text();
}

document.addEventListener('keydown', async function (event) {
    switch (event.key) {
        case 'Enter':
        case '=':
            await equals();
            break;
        case '+':
            await primitiveOperation('add');
            break;
        case '-':
            await primitiveOperation('subtract');
            break;
        case '*':
            await primitiveOperation('times');
            break;
        case '/':
            await primitiveOperation('divide');
            break;
        case 'Backspace':
            backspace();
            break;
        case 'Escape':
        case 'Delete':
            reset();
            break;
        case '.':
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            appendToDisplay(event.key);
            break;
        default:
            console.log(`${event.key} pressed`);
    }
});