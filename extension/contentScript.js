// import {}

async function getSummarizer() {
    const canSummarize = await ai.summarizer.capabilities();
    let summarizer;
    if (canSummarize && canSummarize.available !== "no") {
        if (canSummarize.available === "readily") {
            // The summarizer can immediately be used.
            summarizer = await ai.summarizer.create();
        } else {
            // The summarizer can be used after the model download.
            summarizer = await ai.summarizer.create();
            summarizer.addEventListener("downloadprogress", (e) => {
                console.log(e.loaded, e.total);
            });
            await summarizer.ready;
        }
    } else {
        // The summarizer can't be used at all.
    }
    return summarizer;
}
(() => {
    let mailer, mailing;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        console.log(obj);
        const { type, mailId, emailId, location, locationName } = obj;

        if (type === "NEW") {
            newMailLoaded();
        }
    });

    const newMailLoaded = () => {
        const summarizer = document.getElementsByClassName("bHJ")[0];

        const summarizeButton = document.getElementById(
            "aiders-summarize-button"
        );

        if (summarizer && !summarizeButton) {
            const summarizeButton = document.createElement("button");
            summarizeButton.textContent = "Summarize";
            summarizeButton.className = `aider-grad-1 text-sm text-white font-semibold`;
            summarizeButton.setAttribute("id", "aiders-summarize-button");
            summarizeButton.addEventListener("click", summarize);
            summarizer.prepend(summarizeButton);
        }
    };

    const summarize = async () => {
        const loadingOverlay = document.createElement("div");
        loadingOverlay.className =
            "aider-loading-overlay fixed inset-0 w-screen h-screen backdrop-blur-sm z-[99999999]";
        loadingOverlay.innerHTML = `<div class="absolute inset-0 bg-gray-400 opacity-50 flex">
                <div
                    class="aider-loading-div rounded-xl bg-white max-w-[18rem] w-full p-4 m-auto isolate opacity-100"
                >
                    <img src="chrome-extension://${chrome.runtime.id}/assets/loading.svg" alt="" class="w-full" />
                </div>
            </div>`;

        document.getElementsByTagName("body")[0].append(loadingOverlay);
        return;

        const emailContent = extractEmailContent();
        console.log(emailContent);

        if (emailContent) {
            const summarizer = await getSummarizer();

            await summarizer.summarize(emailContent).then((res) => {
                console.log(res);

                summarizer.destroy();
            });
        }

        // console.log(content);
        // console.log(body);
    };
})();

function extractEmailContent() {
    const contentSelectors = [
        // Main email body selectors
        'div[role="listitem"] div[role="textbox"]',
        'div[data-message-id] div[role="textbox"]',
        'div[class*="a3s"][class*="aiL"]',
        ".a3s.aiL",

        // Alternative selectors for different views
        'div[role="dialog"] div[role="textbox"]',
        'div[id^="m_"] > div',
        ".gs > .ii.gt div.a3s",

        // Capture text within different email components
        '[data-message-id] [role="region"]',
        ".a3s",
        ".ii.gt .a3s",
    ];

    // Different methods for extracting text
    for (const selector of contentSelectors) {
        const elements = document.querySelectorAll(selector);

        if (elements.length > 0) {
            // Collect text from all matching elements
            const contents = Array.from(elements)
                .map((el) => {
                    // Extract text
                    const texts = [
                        el.innerText,
                        el.textContent,
                        el.getAttribute("aria-label"),
                        el.innerHTML,
                    ];

                    // Return first non-empty text
                    return texts.find((text) => text && text.trim().length > 0);
                })
                .filter(Boolean);

            if (contents.length > 0) {
                return contents.join("\n\n");
            }
        }
    }

    return null;
}
