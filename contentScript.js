(() => {
  let mailer, mailing
  console.log('I am activeeeeeeee')

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj

    if (type === 'NEW') {
      newMailLoaded()
    }
  })

  const newMailLoaded = () => {
    const summarizer = document.getElementsByClassName('bHJ')[0]
    console.log('sumarizer: ', summarizer)

    if (summarizer) {
      const sumbutton = document.createElement('button')
      sumbutton.textContent = 'summarize!!1'
      sumbutton.addEventListener('click', sumarize)
      summarizer.appendChild(sumbutton)
    }
  }

  const sumarize = () => {
    const content = document.querySelector(
      '[class^="m_-1747130294979513310"] [class*="bodyContent"]'
    )

    console.log(content)
  }
})()
