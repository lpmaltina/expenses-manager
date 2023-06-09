const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

function convertStringToDate(dateString){
    const dateParts = dateString.split('.');
    return new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
}

class Expense {
    constructor(name, category, priceString, dateString) {
        this.name = name;
        this.category = category;
        this.price = Number(priceString);
        this.date = convertStringToDate(dateString);
    }
}

let expenses = [];
let dayLimit = 0;

app.listen(3000, () => {
    console.log('App started!');
});

// POST метод для создания объекта расхода
app.post('/createExpense', (req, res) => {
    if (!req.body.name){
        res.status(400).send('Empty name!');
    }
    else if (!req.body.category){
        res.status(400).send('Empty category!');
    }
    else if (!req.body.price){
        res.status(400).send('Empty price!');
    }
    else if (!req.body.date){
        res.status(400).send('Empty date!');
    }
    else if (isNaN(req.body.price) || Number(req.body.price) <= 0){
        res.status(400).send('Price must be a positive number!');
    }
    else {
        const expense = new Expense(req.body.name, req.body.category, req.body.price, req.body.date);
        expenses.push(expense);
        res.status(200).send({
            name: expense.name,
            category: expense.category,
            price: expense.price,
            date: expense.date.toLocaleDateString()
        });
    }
});

// GET метод для получения всех расходов
app.get('/getExpenses', (req, res) => {
    if (expenses.length){
        let expensesPretty = [];
        for (let i = 0; i < expenses.length; i++) {
            expensesPretty.push({
                name: expenses[i].name,
                category: expenses[i].category,
                price: expenses[i].price,
                date: expenses[i].date.toLocaleDateString()
            });
        }
        res.status(200).send(expensesPretty);
    }
    else {
        res.status(400).send('No expenses!');
    }
});

// POST метод для поиска расходов за конкретный день
app.post('/findExpensesByDay', (req, res) => {
    if (!req.body.date){
        res.status(400).send('Empty date!');
    }
    else {
        const date = convertStringToDate(req.body.date);
        let foundExpenses = [];
        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].date.getTime() === date.getTime()){
                foundExpenses.push({
                    name: expenses[i].name,
                    category: expenses[i].category,
                    price: expenses[i].price,
                    date: expenses[i].date.toLocaleDateString()
                });
            }
        }
        if (foundExpenses.length){
            res.status(200).send(foundExpenses);
        }
        else {
            res.status(400).send(`No expenses found for ${req.body.date}!`);
        }
    }
});

// POST метод для установки лимита потраченных денег за день
app.post('/setDayLimit', (req, res) => {
    if (!req.body.dayLimit){
        res.status(400).send('Empty day limit!');
    }
    else if (isNaN(req.body.dayLimit) || Number(req.body.dayLimit) <= 0){
        res.status(400).send('Day limit must be a positive number!');
    }
    else {
        dayLimit = Number(req.body.dayLimit);
        res.status(200).send(`Successfully set a day limit = ${dayLimit}`);
    }
});

// GET метод для получения лимита расходов за день
app.get('/getDayLimit', (req, res) => {
    res.send(dayLimit.toString());
});
