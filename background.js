// chrome.tabs.onUpdated.addListener((tabId, tab) => {
//     console.log('Tab updated:', tabId, tab.url)
//     if (
//       tab.url &&
//       tab.url.includes('mail.google.com')

//     ) {
//       const queryParameters = tab.url.split("/")[1];
//       const urlParameters = new URLSearchParams(queryParameters);
//       console.log(urlParameters);

//   chrome.tabs.sendMessage(tabId, {
//     type: 'NEW',
//     subject: subject || 'No subject',
//   })
//     }
// })

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (
//     changeInfo.status === 'complete' &&
//     tab.url &&
//     tab.url.includes('mail.google.com')
//   ) {
//     const url = new URL(tab.url)
//     const pathSegments = url.pathname.split('/')

//     // Check if it's a Gmail compose window
//     if (pathSegments[3] === 'compose') {
//       const subject = url.searchParams.get('subject')

//       chrome.tabs.sendMessage(tabId, {
//         type: 'GMAIL_COMPOSE',
//         subject: subject || 'No subject',
//       })
//     }

//     // Check if it's a Gmail thread
//     else if (pathSegments.length > 4 && pathSegments[3] === 'thread') {
//       const threadId = pathSegments[pathSegments.length - 1]

//       chrome.tabs.sendMessage(tabId, {
//         type: 'GMAIL_THREAD',
//         threadId: threadId,
//       })
//     }
//   }
// })

let currentEmail = null

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension loaded successfully')
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.includes('mail.google.com')
  ) {
    const parsedUrl = new URL(tab.url)
    const pathSegments = parsedUrl.href.split('#')

    if (pathSegments[1].startsWith('inbox/')) {
      const regex = /^inbox\/[\w-]+$/
      if (regex.test(pathSegments[1])) {
        console.log('Path matches the inbox pattern')
      }

      currentEmail = null
      console.log(`Gmail inbox opened`)

      chrome.storage.local.set({ lastCheckedInbox: Date.now() }, () => {
        console.log('Last checked inbox timestamp updated')
      })

      console.log(pathSegments)

      chrome.tabs.sendMessage(tabId, {
        type: 'NEW',
        mailId: parsedUrl[1],
        subject: 'No subject',
      })
    }
  }
})
