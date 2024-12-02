;(() => {
  let mailer, mailing
  console.log('I am activeeeeeeee')

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj

    newMailLoaded()
    if (type === 'NEW') {
    }
  })

  const newMailLoaded = () => {
    const summarizer = document.getElementsByClassName('bHJ')[0]
    console.log('sumarizer: ', summarizer)

    if (summarizer) {
      const sumbutton = document.createElement('button')
      sumbutton.textContent = 'summarize!!1'
      sumbutton.addEventListener('click', sumarize)
      summarizer.prepend(sumbutton)
    }
  }

  const sumarize = () => {
    const content = document.getElementById(':1u')
    const body = content.getElementsByTagName('div')
    const realContent = body[0]

    console.log(content)
    console.log(body)
    console.log(realContent.innerText)
  }
})()
