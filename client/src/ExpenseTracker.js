import React, { useState, useEffect, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './index.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseTracker = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [date, setDate] = useState('');
    const [darkMode, setDarkMode] = useState(() => {
        return JSON.parse(localStorage.getItem('darkMode')) || false;
    });

    useEffect(() => {
        const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
        setTransactions(savedTransactions);
    }, []);

    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        setBalance(transactions.reduce((acc, t) => acc + (t.type === 'expense' ? -t.amount : t.amount), 0));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [darkMode]);

    const addTransaction = () => {
        const parsedAmount = parseFloat(amount.trim());

        if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !date.trim()) {
            alert('Please enter valid details.');
            return;
        }

        const newTransaction = {
            id: Date.now(),
            description: description.trim(),
            amount: parsedAmount,
            type,
            date
        };

        setTransactions(prev => [...prev, newTransaction]);
        setDescription('');
        setAmount('');
        setDate('');
    };

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const incomeTotal = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [transactions]);
    const expenseTotal = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);

    const chartData = {
        labels: ['Income', 'Expenses'],
        datasets: [
            {
                data: [incomeTotal, expenseTotal],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                hoverOffset: 10,
            },
        ],
    };

    return (
        <div className={`container ${darkMode ? 'dark' : ''}`}>
            <button className="theme-toggle" onClick={() => setDarkMode(prev => !prev)}>
                {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </button>

            <h1>Expense Tracker</h1>

            <div className="add-transaction">
                <h2>Add Transaction</h2>
                <form onSubmit={(e) => e.preventDefault()} className="transaction-form">
                    <div className="form-grid">
                        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    <button type="button" onClick={addTransaction} disabled={!description || !amount || !date} className="add-btn">Add Transaction</button>
                </form>
            </div>

            <div className="balance">
                <h2>Balance: <span>${balance.toFixed(2)}</span></h2>
            </div>

            <div className="chart-container">
                <Pie data={chartData} />
            </div>

            <div className="transactions">
                <h2>Transactions</h2>
                {transactions.length === 0 ? <p>No transactions recorded.</p> : (
                    <ul>
                        {transactions.map(transaction => (
                            <li key={transaction.id} className={`transaction ${transaction.type}`}>
                                <span>{transaction.date} - {transaction.description}: ${transaction.amount.toFixed(2)}</span>
                                <button className="delete-btn" onClick={() => deleteTransaction(transaction.id)}>❌</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            
        </div>
    );
};

export default ExpenseTracker;
