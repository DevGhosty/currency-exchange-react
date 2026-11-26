import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { apiUrl, useFetch } from './useFetch.js'
import './style.css'

function Converter() {
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [request, setRequest] = useState(null)

  const catalog = useFetch(apiUrl + '/currencies')
  let url = ''
  let count = 0

  if (request) {
    url = apiUrl + '/rates?' + new URLSearchParams({ base: request.from })
    count = request.count
  }

  const rates = useFetch(url, count)

  function convert(event) {
    event.preventDefault()
    setRequest({ amount: Number(amount), from, to, count: count + 1 })
  }

  let options = []
  if (catalog.data) {
    options = catalog.data.map((currency) => (
      <option key={currency.iso_code} value={currency.iso_code}>
        {currency.iso_code} - {currency.name}
      </option>
    ))
  }

  let result = 'Rate unavailable.'
  if (rates.data && request) {
    for (const item of rates.data) {
      if (item.quote === request.to) {
        const total = request.amount * item.rate
        result = request.amount + ' ' + request.from + ' = ' + total.toFixed(2) + ' ' + request.to
      }
    }
  }

  return (
    <main>
      <h1>Currency Converter</h1>
      {catalog.error && <p role="alert">{catalog.error}</p>}
      {!catalog.data && !catalog.error && <p role="status">Loading currencies...</p>}
      {catalog.data && (
        <form onSubmit={convert}>
          <label>
            Amount
            <input type="number" min="0" step="any" required value={amount}
              onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label>
            From
            <select value={from} onChange={(event) => setFrom(event.target.value)}>
              {options}
            </select>
          </label>
          <label>
            To
            <select value={to} onChange={(event) => setTo(event.target.value)}>
              {options}
            </select>
          </label>
          <button type="submit">Convert</button>
        </form>
      )}
      {rates.error && <p role="alert">{rates.error}</p>}
      {request && !rates.data && !rates.error && <p role="status">Loading rates...</p>}
      {rates.data && (
        <>
          <p role="status">{result}</p>
          <h2>Rates for 1 {request.from}</h2>
          <ul>
            {rates.data.map((item) => (
              <li key={item.quote}>
                <a href={'./currency.html?' + new URLSearchParams({ code: item.quote })}>
                  {item.quote}
                </a>
                {' - ' + item.rate}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}

function CurrencyDetails() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  let url = ''

  if (code) {
    url = apiUrl + '/currency/' + encodeURIComponent(code)
  }

  const currency = useFetch(url)

  return (
    <main>
      <a href="./index.html">Back to converter</a>
      <h1>Currency Details</h1>
      {!code && <p>Choose a currency from the rate list.</p>}
      {code && !currency.data && !currency.error && <p role="status">Loading currency...</p>}
      {currency.error && <p role="alert">{currency.error}</p>}
      {currency.data && (
        <>
          <h2>{currency.data.name}</h2>
          <p>Code: {currency.data.iso_code}</p>
          {currency.data.symbol && <p>Symbol: {currency.data.symbol}</p>}
        </>
      )}
    </main>
  )
}

let page = <Converter />
if (window.location.pathname.endsWith('/currency.html')) {
  page = <CurrencyDetails />
}

createRoot(document.getElementById('root')).render(page)
